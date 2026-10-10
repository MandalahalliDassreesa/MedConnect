
/**
 * GOOGLE SHEETS SYNC SERVICE - v5 (Strict Master Sync)
 */

const STORAGE_KEY_API = "mc_sheets_api_url";
const STORAGE_KEY_URL = "mc_sheets_doc_url";

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  public setApiUrl(url: string) {
    localStorage.setItem(STORAGE_KEY_API, url);
  }

  public getApiUrl(): string {
    return localStorage.getItem(STORAGE_KEY_API) || "";
  }

  public setSheetUrl(url: string) {
    localStorage.setItem(STORAGE_KEY_URL, url);
  }

  public getSheetUrl(): string {
    return localStorage.getItem(STORAGE_KEY_URL) || "https://docs.google.com/spreadsheets";
  }

  /**
   * Pushes local data to the Google Sheet using UPSERT logic.
   */
  async syncData(table: string, data: any): Promise<boolean> {
    const apiUrl = this.getApiUrl();
    if (!apiUrl) return false;

    // Use UPSERT for shared tables to prevent overwriting other users' data
    const sharedTables = ['Users', 'Inquiries', 'GlobalBooks', 'Calendar'];
    const action = sharedTables.includes(table) ? 'UPSERT' : 'REPLACE';

    try {
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          table, 
          data: Array.isArray(data) ? data : [data], 
          action,
          deviceId: 'MC-' + Math.floor(Math.random() * 10000),
          timestamp: new Date().toISOString() 
        })
      });
      this.isConnected = true;
      return true;
    } catch (error) {
      // Background fallback
      try {
        await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ table, data: Array.isArray(data) ? data : [data], action })
        });
        this.isConnected = true;
        return true;
      } catch (e) {
        this.isConnected = false;
        return false;
      }
    }
  }

  /**
   * Pulls data from the master registry.
   */
  async fetchData(table: string): Promise<any[] | null> {
    const apiUrl = this.getApiUrl();
    if (!apiUrl) return null;

    try {
      const response = await fetch(`${apiUrl}?table=${table}`);
      if (!response.ok) return null;
      const json = await response.json();
      return json.data || null;
    } catch (error) {
      console.error(`[Cloud Pull] Failed for ${table}`, error);
      return null;
    }
  }

  public getStatus(): boolean {
    return this.isConnected || !!this.getApiUrl();
  }

  public getScriptTemplate(): string {
    return `
/**
 * MedConnect GLOBAL MASTER BRIDGE v5 (Strict Master Sync)
 * Deployment: Execute as 'Me', Access 'Anyone'
 */

function doGet(e) {
  var table = e.parameter.table;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table);
  
  if (!sheet) return createResponse(JSON.stringify({ data: [] }));
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return createResponse(JSON.stringify({ data: [] }));

  var headers = data.shift();
  var result = data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, i) {
      if (header === "LastSync" || header === "OriginNode") return;
      var val = row[i];
      try {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch(e) {}
      obj[header] = val;
    });
    return obj;
  });

  return createResponse(JSON.stringify({ data: result }));
}

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(params.table) || ss.insertSheet(params.table);
  
  if (!params.data || params.data.length === 0) return createResponse("No Data");

  var incomingData = Array.isArray(params.data) ? params.data : [params.data];
  var keys = Object.keys(incomingData[0]);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(keys.concat(["LastSync", "OriginNode"]));
  }

  if (params.action === 'UPSERT') {
    var existingRaw = sheet.getDataRange().getValues();
    var headers = existingRaw[0];
    var idIdx = headers.indexOf("id");
    
    incomingData.forEach(function(item) {
      var foundRowIdx = -1;
      for (var i = 1; i < existingRaw.length; i++) {
        if (existingRaw[i][idIdx].toString() === item.id.toString()) {
          foundRowIdx = i + 1;
          break;
        }
      }
      
      var rowValues = keys.map(function(k) { 
        return (typeof item[k] === 'object') ? JSON.stringify(item[k]) : item[k]; 
      }).concat([params.timestamp || new Date().toISOString(), params.deviceId || "Unknown"]);
      
      if (foundRowIdx !== -1) {
        sheet.getRange(foundRowIdx, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
    });
  } else {
    sheet.clearContents();
    sheet.appendRow(keys.concat(["LastSync", "OriginNode"]));
    incomingData.forEach(function(item) {
      sheet.appendRow(keys.map(function(k) { 
        return (typeof item[k] === 'object') ? JSON.stringify(item[k]) : item[k]; 
      }).concat([params.timestamp || new Date().toISOString(), params.deviceId || "Unknown"]));
    });
  }
  
  return createResponse("Sync Success");
}

function createResponse(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.JSON);
}
    `.trim();
  }
}

export const sheets = GoogleSheetsService.getInstance();
