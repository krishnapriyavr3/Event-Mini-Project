# 🎯 Smart Event Frontend

Modern React frontend for an AI-powered Event Management System.

This app supports conversational event creation, attendance prediction, venue recommendation, volunteer/resource workflows, and feedback sentiment insights.

## ✨ Key Features

- Conversational Create Event page (chat-style flow)
- AI attendance prediction using event context
- AI venue recommendation using event type + description
- Feedback sentiment analysis with score and label
- Student Event Explorer with live/upcoming filters
- Recommended-for-you events based on department + interest
- Detailed student event page with AI crowd estimate and similar events
- Responsive glassmorphic UI with animated particle backgrounds
- Dark mode support

## 📄 Pages

- Home
- Create Event
- Attendance
- Venue
- Resources
- Volunteers
- Feedback
- Participants
- Student Events Explorer
- Student Event Details

## 🛠 Tech Stack

- React 19
- Vite
- Framer Motion
- Lucide React
- Tailwind CSS

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on port 5000

## 🔗 Repository

GitHub: https://github.com/krishnapriyavr3/Event-Mini-Project

## 🚀 Setup (Full Project)

1) Clone repository

git clone https://github.com/krishnapriyavr3/Event-Mini-Project.git

2) Start backend

cd ASIET-MINI-PROJECT/backend
npm install
npm run start

3) Start frontend (new terminal)

cd ASIET-MINI-PROJECT/smart-event-frontend
npm install
npm run dev

4) Open in browser

http://localhost:5173

If 5173 is busy, Vite automatically uses another port (for example 5174).

## 🔌 APIs Used

Frontend expects backend base URL:

http://localhost:5000/api

Main integrated endpoints:

- POST /events
- POST /ai/predict-event
- GET /attendance-prediction/:eventName
- POST /feedback
- GET /feedback/trends/:eventId
- GET /model-health
- GET /participants
- GET /events/discover?mode=&limit=
- GET /events/recommended?department=&interest=&limit=
- GET /events/:eventId/details
- GET /volunteers
- GET /resources
- POST /resources/request/:id

Purpose of important APIs:

- POST /events
	- Creates new event from chat-style Create Event page
- POST /ai/predict-event
	- Returns predicted attendance, confidence, and recommended venue
- GET /attendance-prediction/:eventName
	- Legacy compatibility endpoint for attendance-only usage
- POST /feedback
	- Saves feedback and returns sentiment analysis (label + score + cue words)
- GET /events/discover
	- Student-facing event feed with timeline + AI attendance/crowd insight
- GET /events/recommended
	- Student recommendation feed based on department and interests
- GET /events/:eventId/details
	- Event detail payload with AI venue/crowd suggestion + related events

## 🧠 AI Modules in Use

- Attendance + Venue model
	- Predicts expected attendance from event name, type, description, and budget
	- Recommends venue based on predicted attendance + learned historical patterns

- Sentiment model
	- Analyzes feedback comments
	- Returns sentiment label (Positive/Neutral/Negative) and score (0-100)

## 🧪 AI Training Data & Inputs

Attendance + Venue model is trained from historical campus data in MySQL:

- `events` table
	- `event_name`
	- `type`
	- `expected_attendance` (if available)
	- `budget` (used as fallback signal)
	- `venue_id`
	- `description` (if available)
- `venues` table
	- `venue_id`
	- `venue_name`
	- `location`
	- `capacity`
	- `type`

Prediction-time inputs:

- Event name
- Event type
- Event description
- Budget

Feedback sentiment model uses:

- `sentiment` NLP scoring engine (with fallback lexicon)
- Feedback comment tokens and weighted polarity

## 📜 Available Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint

## 🎬 Demo Flow (Quick)

1) Create event in chat-style page (`/create`)
2) Run prediction in Attendance page (`/attendance`)
3) Verify recommended venue in Venue page (`/venue`)
4) Submit feedback and check sentiment + trend bars (`/feedback`)
5) Assign volunteers and request resources (`/volunteers`, `/resources`)

## 🐞 Troubleshooting

- Backend port already in use (5000)
	- Stop old process on port 5000, then rerun backend

- Frontend cannot call API
	- Confirm backend is running and .env DB values are correct
	- Confirm API URL is http://localhost:5000/api

- Vite starts on another port
	- Use URL shown in terminal output

## 👤 Author

[Ajwin](https://github.com/Ajwinks)

---

Version: 1.1.0  
Updated: Feb 2026
