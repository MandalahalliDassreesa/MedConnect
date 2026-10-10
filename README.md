# MEDCONNECT — Comprehensive Medical Ecosystem

> The ultimate medical education and management platform. Feature-rich modules for academics, clinical logbooks, performance analytics, and administrative management with integrated AI assistance.

## Features

- **Dashboard** — Personalized overview with stats, upcoming events, and quick links
- **Subjects** — Cardiology, Neurology, Anatomy with topics, chapters, and quizzes
- **Library** — Digital books and video lectures
- **3D Anatomy Simulation** — Interactive 3D models (Heart, Brain, Skeleton, Nervous System) via Three.js
- **Clinical Logbook** — Track clinical rotations and duties
- **Performance Analytics** — Charts and progress tracking (Recharts)
- **Calendar** — Academic events, exams, and scheduling
- **Hostel Management** — Room info, roommates, mess menu
- **Notice Board** — Institutional announcements
- **Fee Management** — Track tuition and payment history
- **Inquiry System** — Student Q&A per subject
- **Database Manager** — Admin-only user and data management
- **AI Assistant** — Gemini-powered contextual help
- **Dark Mode** — Full light/dark theme support

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Framework   | React 19 + TypeScript                     |
| Bundler     | Vite 6                                    |
| Styling     | Tailwind CSS (CDN) + Inter font           |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei |
| Charts      | Recharts                                  |
| Icons       | Lucide React                              |
| AI          | Google Gemini (@google/genai)             |

## Getting Started

### Prerequisites

- **Node.js** (v18+)

### Installation

```bash
npm install
```

### Configuration

Set your Gemini API key in [`.env.local`](.env.local):

```env
GEMINI_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

The app will start at **http://localhost:3000**.

## Login Credentials

### Admin Account

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@medconnect.edu` |
| Password | `Password@123`         |

### Student Account

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `sarah.s@aiims.edu.in` |
| Password | `Password@123`         |

> You can also create new student accounts via the **Sign Up** form (requires a `.edu` email).

## Project Structure

```
├── index.html          # Entry HTML
├── index.tsx           # React mount point
├── App.tsx             # Root component + routing
├── types.ts            # TypeScript interfaces
├── constants.ts        # Seed data (users, subjects, etc.)
├── components/         # Shared UI components
│   ├── AIAssistant.tsx
│   ├── Sidebar.tsx
│   ├── QuizModal.tsx
│   ├── NotesPad.tsx
│   ├── ThreeScene.tsx
│   └── AnatomyModels/  # 3D organ models
├── views/              # Page-level views
│   ├── Dashboard.tsx
│   ├── LoginView.tsx
│   ├── SubjectsView.tsx
│   ├── Library.tsx
│   ├── Simulation.tsx
│   └── ... (14 more views)
├── services/           # Data & API layer
│   ├── db.ts           # LocalStorage database
│   ├── geminiService.ts
│   ├── googleSheets.ts
│   └── localAI.ts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── .env.local          # API keys (not committed)
```

## License

This project is for educational purposes.
