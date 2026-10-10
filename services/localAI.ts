
import { TaskPerformance, AnatomyTask, AIFeedback, UserProfile } from "../types";
import { db } from "./db";

interface MedicalEntry {
  title: string;
  tags: string[];
  response: string;
  clinicalNote?: string;
}

const MEDICAL_KNOWLEDGE_BASE: Record<string, MedicalEntry> = {
  "anatomy": {
    title: "General Anatomy",
    tags: ["anatomy", "body", "structures", "basics", "muscles", "bones"],
    response: "Anatomy is the foundational study of human structure. For MBBS Phase I, clinical relevance is key. Focus on 'Applied Anatomy'—how structures relate to clinical procedures like lumbar punctures (L3-L4) or venipuncture.",
    clinicalNote: "Always remember: Anatomical variations are common; never assume 'textbook' symmetry in a real patient."
  },
  "heart": {
    title: "Cardiovascular System",
    tags: ["heart", "cardio", "cardiology", "valves", "myocardium", "aorta", "ventricle", "atrium", "mitral", "aortic"],
    response: "The heart is a four-chambered pump. The Left Ventricle is the thickest, pumping blood to the systemic circulation. Valves (Mitral, Aortic, Tricuspid, Pulmonary) ensure unidirectional flow.",
    clinicalNote: "S1 is the 'lub' (mitral/tricuspid closure), S2 is the 'dub' (aortic/pulmonary closure). Murmurs indicate valve pathology."
  }
};

export const queryLocalAI = async (input: string): Promise<string | null> => {
  const query = input.toLowerCase();
  await new Promise(resolve => setTimeout(resolve, 300));

  let bestMatch: MedicalEntry | null = null;
  let maxMatches = 0;

  for (const entry of Object.values(MEDICAL_KNOWLEDGE_BASE)) {
    const matches = entry.tags.filter(tag => query.includes(tag)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxMatches > 0) {
    return `**${bestMatch.title}**\n\n${bestMatch.response}\n\n*Clinical Pearl:* ${bestMatch.clinicalNote}`;
  }

  return "I couldn't find a high-confidence match in the local workstation database. Try specific clinical keywords like 'heart valves' or 'pediatrics'.";
};

export const getLocalPersonalizedFeedback = async (performance: TaskPerformance[], tasks: AnatomyTask[]): Promise<AIFeedback> => {
  const user = db.getCurrentUser();
  const quizScores = user?.quizScores || {};
  
  // Analyze Chapter-specific failures
  const quizWeakSpots = Object.entries(quizScores)
    .filter(([_, score]) => score < 70)
    .map(([chapterId]) => {
      // Mapping chapter IDs to more descriptive names for feedback
      if (chapterId.includes('s1t1')) return "Valvular Hemodynamics";
      if (chapterId.includes('s1t2')) return "Advanced Electrocardiography";
      if (chapterId.includes('s2')) return "Neural Pathway Integration";
      if (chapterId.includes('s3')) return "Structural Osteology";
      return "General Clinical Concepts";
    });

  const uniqueWeakSpots = Array.from(new Set([...quizWeakSpots]));

  const mastered = Object.entries(quizScores)
    .filter(([_, score]) => score >= 90)
    .map(([chapterId]) => {
      if (chapterId.includes('s1')) return "Cardiac Mechanics";
      if (chapterId.includes('s2')) return "Neurological Examination";
      return "Diagnostic Fundamentals";
    });

  return {
    weakSpots: uniqueWeakSpots.length ? uniqueWeakSpots : ["No significant curriculum gaps detected."],
    masteredAreas: mastered.length ? Array.from(new Set(mastered)) : ["Initial Assessment Pending"],
    actionPlan: [
      "Review the specifically highlighted chapters where quiz performance fell below 70%.",
      "Utilize the 3D Simulation Lab to visualize structural pathology in weak domains.",
      "Sync local study journals with faculty for peer-review on 'Academic Help Desk'.",
      "Focus next clinical posting on the department corresponding to your identified gaps."
    ],
    focusTopics: uniqueWeakSpots.length ? [uniqueWeakSpots[0], "Applied Anatomy", "Clinical Diagnostics"] : ["Applied Physiology", "General Surgery Basics"],
    encouragement: "Granular tracking shows your dedication. Focus on the sub-topic gaps to achieve clinical mastery."
  };
};
