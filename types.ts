
export type Role = 'Student' | 'Nurse' | 'Doctor' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  college: string;
  year: string;
  avatar: string;
  email: string;
  password?: string;
  bloodGroup: string;
  emergencyContact: string;
  contactNumber: string;
  cgpa: string;
  percentage: string;
  lastLogin?: string;
  completedTopicIds?: string[];
  completedChapterIds?: string[];
  quizScores?: Record<string, number>;
}

export interface Inquiry {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  question: string;
  answer?: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
  answeredAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  quizPool: QuizQuestion[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  notes?: string;
  chapters: Chapter[];
  quiz?: QuizQuestion[];
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  watched?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  topics: Topic[];
  books: Book[];
  videos: Video[];
  attendance: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  pdfUrl?: string;
  isGlobal?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Exams' | 'Holidays' | 'Programs';
  status: 'Upcoming' | 'Attended';
  location?: string;
  isPublished?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Urgent' | 'General' | 'Event';
  author: string;
}

export interface HostelInfo {
  roomNumber: string;
  block: string;
  roommates: string[];
  messMenu: Record<string, string[]>;
}

export interface ClinicalDuty {
  id: string;
  department: string;
  time: string;
  date: string;
  notes?: string;
  logbookStatus: 'Pending' | 'Completed';
}

export interface FeeRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

export interface AnatomyTask {
  id: string;
  organ: 'heart' | 'brain' | 'skeleton' | 'nervous';
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface TaskPerformance {
  taskId: string;
  attempts: number;
  successRate: number;
  timeSpent: number;
}

export interface StudySession {
  date: string;
  hours: number;
  subject: string;
}

export interface AIFeedback {
  weakSpots: string[];
  masteredAreas: string[];
  actionPlan: string[];
  focusTopics: string[];
  encouragement: string;
}

export type ViewType = 'dashboard' | 'subjects' | 'library' | 'simulation' | 'calendar' | 'clinical' | 'hostel' | 'notices' | 'fees' | 'performance' | 'profile' | 'settings' | 'database' | 'inquiries';
