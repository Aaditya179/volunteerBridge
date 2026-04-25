# 🌉 VolunteerBridge

**AI-Powered Volunteer Coordination Platform for NGOs**

VolunteerBridge uses Google Gemini AI to intelligently match volunteers to community needs during crisis situations. It automates survey intake, performs smart skill-based matching, and provides real-time crisis intelligence — enabling NGOs to deploy the right volunteer to the right place at the right time.

> Built for the Google Solution Challenge 2026

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VolunteerBridge                          │
├───────────────┬──────────────────────┬──────────────────────────┤
│   Frontend    │      Backend         │     Mobile App           │
│   (Next.js)   │     (FastAPI)        │     (Flutter)            │
│               │                      │                          │
│  Dashboard    │  /ingest             │  Task Feed               │
│  Crisis Map   │  /match              │  Task Details            │
│  AI Reports   │  /assign             │  My Assignments          │
│  Survey Upload│  /crisis-report      │  Profile Setup           │
├───────────────┴──────────────────────┴──────────────────────────┤
│                     Shared Services                              │
│  Firebase Auth │ Cloud Firestore │ FCM │ Google Maps │ Gemini   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer       | Technology                          | Purpose                          |
|-------------|-------------------------------------|----------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS| NGO Admin Dashboard              |
| Backend     | Python 3.11, FastAPI, Pydantic v2   | API, AI Processing               |
| Mobile      | Flutter 3.22, Dart, Riverpod        | Volunteer Mobile App             |
| AI/ML       | Google Gemini 1.5 Flash             | Survey extraction, matching, reports |
| Database    | Cloud Firestore                     | Real-time data store             |
| Auth        | Firebase Authentication             | Google Sign-In                   |
| Messaging   | Firebase Cloud Messaging (FCM)      | Push notifications               |
| Maps        | Google Maps Platform                | Crisis mapping, geolocation      |
| Hosting     | Google Cloud Run                    | Container deployment             |
| CI/CD       | GitHub Actions                      | Automated deployment             |

---

## 👥 Team Structure

| Member           | Role              | Branch             | Ownership                  |
|------------------|-------------------|---------------------|----------------------------|
| Member 1         | Frontend Lead     | `frontend/main`     | `frontend/`                |
| Member 2         | Backend Lead      | `backend/main`      | `backend/`                 |
| Member 3         | Mobile Lead       | `flutter/main`      | `flutter-app/`             |
| Member 4         | Integration Lead  | `integration/main`  | `.github/`, `README.md`    |

---

## 🚀 Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Flutter 3.22+
- Firebase CLI (`npm install -g firebase-tools`)
- A Google Cloud project with Gemini API enabled

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/volunteerbridge.git
cd volunteerbridge
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file and fill in your values
cp .env.example .env

# Place your Firebase service account key as serviceAccountKey.json in backend/

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local with your Firebase and API config:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_FIREBASE_API_KEY=your_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

npm run dev
```

### 4. Flutter App Setup

```bash
cd flutter-app
flutter pub get

# Configure Firebase:
# 1. Run: flutterfire configure
# 2. Place google-services.json in android/app/
# 3. Place GoogleService-Info.plist in ios/Runner/

flutter run
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable                        | Description                        |
|---------------------------------|------------------------------------|
| `GEMINI_API_KEY`                | Google Gemini API key              |
| `FIREBASE_PROJECT_ID`          | Firebase project ID                |
| `GOOGLE_APPLICATION_CREDENTIALS`| Path to service account JSON       |
| `GOOGLE_MAPS_API_KEY`          | Google Maps Platform API key       |
| `ENVIRONMENT`                   | `development` or `production`      |

### Frontend (`frontend/.env.local`)

| Variable                              | Description                    |
|---------------------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`                 | Backend API base URL           |
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | Firebase Web API key           |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | Firebase Auth domain           |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | Firebase project ID            |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`     | Google Maps JS API key         |

---

## 🌿 Branch Strategy

```
main                    ← production deployments
├── frontend/main       ← frontend stable
│   └── frontend/feat/* ← frontend feature branches
├── backend/main        ← backend stable
│   └── backend/feat/*  ← backend feature branches
├── flutter/main        ← mobile stable
│   └── flutter/feat/*  ← mobile feature branches
└── integration/main    ← CI/CD and shared config
```

**Rules:**
1. Never push directly to `main` — all changes via Pull Requests
2. Each member works in their service-specific branch
3. PRs require at least 1 approval before merge
4. Integration Lead merges service branches into `main`

---

## 📄 License

This project is built for the Google Solution Challenge 2026.

---

## 🔗 Live Demo

> **[Live Demo URL — Coming Soon](#)**

---

*Built with ❤️ using Google technologies*
