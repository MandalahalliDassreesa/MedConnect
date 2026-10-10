
import { SUBJECTS, CLINICAL_DUTIES, FEE_HISTORY, MOCK_PERFORMANCE, NOTICES, HOSTEL_DATA, INITIAL_USERS, CALENDAR_EVENTS } from '../constants';
import { Subject, ClinicalDuty, FeeRecord, TaskPerformance, Notice, HostelInfo, UserProfile, StudySession, CalendarEvent, Inquiry, Book } from '../types';
import { sheets } from './googleSheets';

const DB_KEYS = {
  USERS: 'mc_users_v6',
  CURRENT_USER: 'mc_current_user_v6',
  SUBJECTS: 'mc_subjects_v2',
  DUTIES: 'mc_duties_v2',
  FEES: 'mc_fees_v2',
  PERFORMANCE: 'mc_performance_v2',
  NOTES: 'mc_notes_v2',
  NOTICES: 'mc_notices_v2',
  HOSTEL: 'mc_hostel_v2',
  STUDY_SESSIONS: 'mc_study_sessions_v3',
  CALENDAR: 'mc_calendar_v2',
  INQUIRIES: 'mc_inquiries_v1',
  GLOBAL_BOOKS: 'mc_global_books_v1'
};

class MedConnectDB {
  private static instance: MedConnectDB;
  private isSyncing: boolean = false;
  private initialized: boolean = false;
  
  private constructor() {
    this.init();
  }

  public static getInstance(): MedConnectDB {
    if (!MedConnectDB.instance) {
      MedConnectDB.instance = new MedConnectDB();
    }
    return MedConnectDB.instance;
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async init() {
    if (this.initialized) return;
    
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      const hashedUsers = await Promise.all(INITIAL_USERS.map(async u => ({
        ...u,
        password: u.password ? await this.hashPassword(u.password) : 'OAuthAccount'
      })));
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(hashedUsers));
    }
    
    const defaults: [string, any][] = [
      [DB_KEYS.SUBJECTS, SUBJECTS],
      [DB_KEYS.DUTIES, CLINICAL_DUTIES],
      [DB_KEYS.FEES, FEE_HISTORY],
      [DB_KEYS.PERFORMANCE, MOCK_PERFORMANCE],
      [DB_KEYS.NOTICES, NOTICES],
      [DB_KEYS.HOSTEL, HOSTEL_DATA],
      [DB_KEYS.CALENDAR, CALENDAR_EVENTS],
      [DB_KEYS.STUDY_SESSIONS, []],
      [DB_KEYS.INQUIRIES, []],
      [DB_KEYS.GLOBAL_BOOKS, []]
    ];

    defaults.forEach(([key, data]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
    });

    this.initialized = true;
    this.pullFromCloud();
  }

  /**
   * GLOBAL MASTER PRIORITY SYNC (v5)
   * Shared tables strictly follow the Cloud Registry to ensure all devices are in sync.
   */
  async pullFromCloud() {
    if (!sheets.getApiUrl() || this.isSyncing) return;
    
    this.isSyncing = true;
    try {
      const tablesToPull = [
        { key: DB_KEYS.USERS, cloudName: 'Users' },
        { key: DB_KEYS.INQUIRIES, cloudName: 'Inquiries' },
        { key: DB_KEYS.GLOBAL_BOOKS, cloudName: 'GlobalBooks' },
        { key: DB_KEYS.CALENDAR, cloudName: 'Calendar' }
      ];

      for (const table of tablesToPull) {
        const cloudData = await sheets.fetchData(table.cloudName);
        if (cloudData && Array.isArray(cloudData)) {
          // Force overwrite local shared cache with cloud's master state
          localStorage.setItem(table.key, JSON.stringify(cloudData));
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async sync(table: string, data: any) {
    this.isSyncing = true;
    try {
      await sheets.syncData(table, data);
    } finally {
      this.isSyncing = false;
    }
  }

  getSyncState() { return this.isSyncing; }

  async login(email: string, password: string): Promise<UserProfile | null> {
    await this.init();
    await this.pullFromCloud(); // Must pull latest global users before login
    const users = this.getAllUsers();
    const hashed = await this.hashPassword(password);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashed);
    if (user) {
      const sessionUser = { ...user, lastLogin: new Date().toISOString() };
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
      await this.sync('Users', sessionUser);
      return sessionUser;
    }
    return null;
  }

  async signup(profile: Omit<UserProfile, 'id'>): Promise<UserProfile | null> {
    await this.init();
    await this.pullFromCloud();
    const users = this.getAllUsers();
    if (users.some(u => u.email.toLowerCase() === profile.email.toLowerCase())) return null;
    
    const hashed = await this.hashPassword(profile.password || 'Password@123');
    const newUser = { ...profile, id: `u${Date.now()}`, password: hashed, completedTopicIds: [], completedChapterIds: [], quizScores: {} } as UserProfile;
    
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(newUser));
    await this.sync('Users', newUser);
    return newUser;
  }

  logout() { localStorage.removeItem(DB_KEYS.CURRENT_USER); }
  
  getCurrentUser(): UserProfile | null {
    const u = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }
  
  getAllUsers(): UserProfile[] { 
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'); 
  }

  getSubjects(): Subject[] { return JSON.parse(localStorage.getItem(DB_KEYS.SUBJECTS) || '[]'); }
  getDuties(): ClinicalDuty[] { return JSON.parse(localStorage.getItem(DB_KEYS.DUTIES) || '[]'); }
  getFees(): FeeRecord[] { return JSON.parse(localStorage.getItem(DB_KEYS.FEES) || '[]'); }
  getPerformance(): TaskPerformance[] { return JSON.parse(localStorage.getItem(DB_KEYS.PERFORMANCE) || '[]'); }
  getNotices(): Notice[] { return JSON.parse(localStorage.getItem(DB_KEYS.NOTICES) || '[]'); }
  getHostel(): HostelInfo { return JSON.parse(localStorage.getItem(DB_KEYS.HOSTEL) || '{}'); }
  getStudySessions(): StudySession[] { return JSON.parse(localStorage.getItem(DB_KEYS.STUDY_SESSIONS) || '[]'); }
  getCalendarEvents(): CalendarEvent[] { return JSON.parse(localStorage.getItem(DB_KEYS.CALENDAR) || '[]'); }
  getGlobalBooks(): Book[] { return JSON.parse(localStorage.getItem(DB_KEYS.GLOBAL_BOOKS) || '[]'); }

  async addGlobalBook(book: Omit<Book, 'id'>) {
    const books = this.getGlobalBooks();
    const newBook = { ...book, id: `book-${Date.now()}`, isGlobal: true } as Book;
    books.unshift(newBook);
    localStorage.setItem(DB_KEYS.GLOBAL_BOOKS, JSON.stringify(books));
    await this.sync('GlobalBooks', newBook);
    return newBook;
  }

  getInquiries(): Inquiry[] { return JSON.parse(localStorage.getItem(DB_KEYS.INQUIRIES) || '[]'); }

  async logStudyTime(hours: number, subject: string = 'General Medicine') {
    const sessions = this.getStudySessions();
    const today = new Date().toISOString().split('T')[0];
    
    const existing = sessions.find(s => s.date === today && s.subject === subject);
    if (existing) {
      existing.hours += hours;
    } else {
      sessions.push({ date: today, hours, subject });
    }
    
    localStorage.setItem(DB_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
    await this.sync('StudySessions', sessions);
  }

  async addInquiry(question: string, subjectId: string) {
    const user = this.getCurrentUser();
    if (!user) return;
    
    const newInq: Inquiry = {
      id: `inq-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      subjectId,
      question,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    const inquiries = this.getInquiries();
    inquiries.unshift(newInq);
    localStorage.setItem(DB_KEYS.INQUIRIES, JSON.stringify(inquiries));
    
    // Broadcast immediately to ensure visibility on other devices
    await this.sync('Inquiries', newInq);
    return newInq;
  }

  async answerInquiry(id: string, answer: string) {
    const inquiries = this.getInquiries();
    const idx = inquiries.findIndex(i => i.id === id);
    if (idx !== -1) {
      inquiries[idx].answer = answer;
      inquiries[idx].status = 'Resolved';
      inquiries[idx].answeredAt = new Date().toISOString();
      localStorage.setItem(DB_KEYS.INQUIRIES, JSON.stringify(inquiries));
      await this.sync('Inquiries', inquiries[idx]);
    }
  }

  async completeChapter(chapterId: string, topicId: string, quizScore: number) {
    const user = this.getCurrentUser();
    if (!user) return;
    
    const completedChapters = user.completedChapterIds || [];
    if (!completedChapters.includes(chapterId)) {
      completedChapters.push(chapterId);
    }
    
    const quizScores = user.quizScores || {};
    quizScores[chapterId] = quizScore;
    
    const subjects = this.getSubjects();
    let topicCompleted = false;
    
    for (const sub of subjects) {
      const topic = sub.topics.find(t => t.id === topicId);
      if (topic) {
        const allChaptersDone = topic.chapters.every(c => completedChapters.includes(c.id));
        if (allChaptersDone) {
          const completedTopics = user.completedTopicIds || [];
          if (!completedTopics.includes(topicId)) {
             completedTopics.push(topicId);
             user.completedTopicIds = completedTopics;
             topicCompleted = true;
          }
        }
        break;
      }
    }
    
    const updatedUser = { ...user, completedChapterIds: completedChapters, quizScores };
    await this.updateProfile(updatedUser);
    return topicCompleted;
  }

  async addLogbookEntry(entry: Omit<ClinicalDuty, 'id'>) {
    const d = this.getDuties();
    const newE = { ...entry, id: `d${Date.now()}` } as ClinicalDuty;
    d.unshift(newE);
    localStorage.setItem(DB_KEYS.DUTIES, JSON.stringify(d));
    await this.sync('ClinicalLogs', d);
    return newE;
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>) {
    const events = this.getCalendarEvents();
    const newEvent = { ...event, id: `e${Date.now()}`, isPublished: false } as CalendarEvent;
    events.push(newEvent);
    localStorage.setItem(DB_KEYS.CALENDAR, JSON.stringify(events));
    return newEvent;
  }

  async deployCalendarToAll() {
    const events = this.getCalendarEvents();
    const updated = events.map(e => ({ ...e, isPublished: true }));
    localStorage.setItem(DB_KEYS.CALENDAR, JSON.stringify(updated));
    await this.sync('Calendar', updated);
  }

  async deleteCalendarEvent(id: string) {
    const events = this.getCalendarEvents();
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem(DB_KEYS.CALENDAR, JSON.stringify(updated));
    await this.sync('Calendar', updated);
  }

  async updateLogbookStatus(id: string, status: 'Pending' | 'Completed') {
    const d = this.getDuties();
    const item = d.find(x => x.id === id);
    if (item) {
      item.logbookStatus = status;
      localStorage.setItem(DB_KEYS.DUTIES, JSON.stringify(d));
      await this.sync('ClinicalLogs', d);
    }
  }

  async updateProfile(profile: UserProfile) { 
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(profile));
    const u = this.getAllUsers();
    const idx = u.findIndex(x => x.id === profile.id);
    if (idx !== -1) {
      u[idx] = profile;
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(u));
      await this.sync('Users', profile);
    }
  }
}

export const db = MedConnectDB.getInstance();
