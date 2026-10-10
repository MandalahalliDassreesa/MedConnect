
import { Subject, Topic, Chapter, QuizQuestion, CalendarEvent, ClinicalDuty, FeeRecord, AnatomyTask, TaskPerformance, Notice, HostelInfo, UserProfile } from './types';

const generateChapterQuizzes = (chapterName: string): QuizQuestion[] => [
  {
    id: `q-${chapterName}-1`,
    question: `Which clinical presentation is most characteristic of pathology in ${chapterName}?`,
    options: ["Acute localized pain", "Referred sympathetic discharge", "Bilateral systemic fatigue", "Asymptomatic progression"],
    correctAnswer: 1,
    explanation: "Referred pain patterns are high-yield clinical indicators for visceral pathology."
  },
  {
    id: `q-${chapterName}-2`,
    question: `What is the gold standard diagnostic modality for evaluating ${chapterName}?`,
    options: ["High-resolution CT", "Contrast-enhanced MRI", "Bedside Ultrasound", "Serum biomarkers"],
    correctAnswer: 1,
    explanation: "MRI provides superior soft tissue contrast for detailed structural evaluation."
  }
];

const createChapters = (topicName: string, topicId: string): Chapter[] => [
  { id: `${topicId}c1`, title: "Foundational Principles", description: `Introduction to the core mechanics of ${topicName}.`, quizPool: generateChapterQuizzes(`${topicName} Foundations`) },
  { id: `${topicId}c2`, title: "Clinical Presentation", description: `How ${topicName} manifests in symptomatic patients.`, quizPool: generateChapterQuizzes(`${topicName} Clinics`) },
  { id: `${topicId}c3`, title: "Diagnostic Pathways", description: `Standard protocols for verifying ${topicName} integrity.`, quizPool: generateChapterQuizzes(`${topicName} Diagnostics`) },
  { id: `${topicId}c4`, title: "Surgical Considerations", description: `Interventional approaches to ${topicName} pathology.`, quizPool: generateChapterQuizzes(`${topicName} Surgery`) },
  { id: `${topicId}c5`, title: "Post-Operative Care", description: `Rehabilitation and longitudinal management of ${topicName}.`, quizPool: generateChapterQuizzes(`${topicName} Recovery`) },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-01',
    name: 'Institutional Admin',
    role: 'Admin',
    college: 'Central Administration',
    year: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    email: 'admin@medconnect.edu',
    password: 'Password@123',
    bloodGroup: 'N/A',
    emergencyContact: '000',
    contactNumber: '0000000000',
    cgpa: '4.0',
    percentage: '100%',
    completedTopicIds: [],
    completedChapterIds: [],
    quizScores: {}
  },
  {
    id: 'u1',
    name: 'Sarah Sharma',
    role: 'Student',
    college: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
    year: 'MBBS Phase III',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    email: 'sarah.s@aiims.edu.in',
    password: 'Password@123',
    bloodGroup: 'B+',
    emergencyContact: '+91 98765-43210',
    contactNumber: '9876543210',
    cgpa: '8.5',
    percentage: '82%',
    completedTopicIds: [],
    completedChapterIds: [],
    quizScores: {}
  }
];

export const SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Cardiology',
    code: 'CARD-101',
    attendance: 92,
    topics: [
      { id: 's1t1', title: 'Heart Valves & Mechanics', description: 'Deep dive into mitral and aortic valve dynamics.', chapters: createChapters('Heart Valves', 's1t1') },
      { id: 's1t2', title: 'ECG Interpretation', description: 'Understanding P-QRS-T patterns.', chapters: createChapters('ECG', 's1t2') },
      { id: 's1t3', title: 'Myocardial Infarction', description: 'Pathophysiology of ST-elevation events.', chapters: createChapters('Infarction', 's1t3') },
      { id: 's1t4', title: 'Heart Failure', description: 'Management of CHF and pulmonary edema.', chapters: createChapters('CHF', 's1t4') },
      { id: 's1t5', title: 'Congenital Defects', description: 'VSD, ASD, and Tetralogy of Fallot.', chapters: createChapters('Congenital', 's1t5') }
    ],
    books: [{ id: 'b1', title: 'Braunwald\'s Heart Disease', author: 'Eugene Braunwald', cover: 'https://picsum.photos/seed/heart/200/300' }],
    videos: [{ id: 'v1', title: 'Valve Mechanics', thumbnail: 'https://picsum.photos/seed/heartvid/300/200', duration: '12:45' }]
  },
  {
    id: 's2',
    name: 'Neurology',
    code: 'NEU-301',
    attendance: 84,
    topics: [
      { id: 's2t1', title: 'Synaptic Pathways', description: 'Chemical signal propagation.', chapters: createChapters('Synapses', 's2t1') },
      { id: 's2t2', title: 'Cranial Nerve Mapping', description: 'Study of the 12 cranial nerves.', chapters: createChapters('Cranial Nerves', 's2t2') },
      { id: 's2t3', title: 'Neurotransmitters', description: 'Dopamine, Serotonin, and GABA dynamics.', chapters: createChapters('Neurotransmitters', 's2t3') },
      { id: 's2t4', title: 'Ischemic Stroke', description: 'Diagnosis and thrombolytic therapy.', chapters: createChapters('Stroke', 's2t4') },
      { id: 's2t5', title: 'Basal Ganglia', description: 'Motor control and Parkinson\'s disease.', chapters: createChapters('Basal Ganglia', 's2t5') }
    ],
    books: [{ id: 'b2', title: 'Principles of Neural Science', author: 'Eric Kandel', cover: 'https://picsum.photos/seed/brain/200/300' }],
    videos: [{ id: 'v2', title: 'Nerve Exam', thumbnail: 'https://picsum.photos/seed/brainvid/300/200', duration: '18:20' }]
  },
  {
    id: 's3',
    name: 'Anatomy',
    code: 'ANAT-101',
    attendance: 95,
    topics: [
      { id: 's3t1', title: 'Thoracic Cavity', description: 'Study of mediastinum.', chapters: createChapters('Thorax', 's3t1') },
      { id: 's3t2', title: 'Upper Limb Osteology', description: 'Analysis of humerus and radius.', chapters: createChapters('Upper Limb', 's3t2') },
      { id: 's3t3', title: 'Abdominal Wall', description: 'Inguinal canal and layers.', chapters: createChapters('Abdomen', 's3t3') },
      { id: 's3t4', title: 'Pelvic Anatomy', description: 'Urogenital triangle and perineum.', chapters: createChapters('Pelvis', 's3t4') },
      { id: 's3t5', title: 'Head & Neck', description: 'Pharyngeal arches and facial nerve.', chapters: createChapters('Head/Neck', 's3t5') }
    ],
    books: [{ id: 'b3', title: 'Gray\'s Anatomy', author: 'Henry Gray', cover: 'https://picsum.photos/seed/anatomy/200/300' }],
    videos: [{ id: 'v3', title: 'Thorax Dissection', thumbnail: 'https://picsum.photos/seed/anatomyvid/300/200', duration: '25:10' }]
  }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Final Prof Examinations', date: '2025-05-15', type: 'Exams', status: 'Upcoming', location: 'Examination Hall 1' }
];

export const NOTICES: Notice[] = [
  { id: 'n1', title: 'Mandatory Clinical Rotation', content: 'Posting in the Outreach Clinic is mandatory for all 3rd-year students.', date: '2025-03-10', category: 'Urgent', author: 'Academic Dean' }
];

export const HOSTEL_DATA: HostelInfo = {
  roomNumber: 'D-304',
  block: 'Hostel No. 7',
  roommates: ['Ananya Iyer', 'Priya Patel'],
  messMenu: {
    'Monday': ['Poha', 'Rajma Chawal', 'Paneer Butter Masala'],
    'Tuesday': ['Aloo Paratha', 'Masala Dosa', 'Veg Kadai'],
    'Wednesday': ['Omelette', 'Dal Makhani', 'Chicken Curry'],
    'Thursday': ['Idli Sambar', 'Veg Pulav', 'Mixed Veg'],
    'Friday': ['Chole Bhature', 'Kadhi Chawal', 'Paneer Tikka'],
    'Saturday': ['Waffles', 'Poori Sabzi', 'Gulab Jamun'],
    'Sunday': ['Special Breakfast', 'Biryani', 'Fried Rice']
  }
};

export const CLINICAL_DUTIES: ClinicalDuty[] = [
  { id: 'd1', department: 'General Medicine', time: '09:00 - 16:00', date: '2025-03-10', logbookStatus: 'Completed' }
];

export const FEE_HISTORY: FeeRecord[] = [
  { id: 'f1', title: 'Tuition Fee - Prof III', amount: 150000, date: '2025-01-10', status: 'Paid' }
];

export const TASKS: AnatomyTask[] = [
  { id: 'task1', organ: 'heart', title: 'Valve Recognition', description: 'Identify mitral valve in 3D.', difficulty: 'Beginner' }
];

export const MOCK_PERFORMANCE: TaskPerformance[] = [
  { taskId: 'task1', attempts: 3, successRate: 0.6, timeSpent: 240 }
];
