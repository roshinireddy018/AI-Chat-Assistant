# Full-Stack AI Chat Assistant (Foundation)

> **90-Minute Vibe Coding Assessment Foundation**  
> A full-stack architecture foundation for an AI Chat Assistant built with React, Vite, Tailwind CSS v3, Node.js, Express, MongoDB Atlas, Mongoose, Zod, and the OpenAI SDK.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Reactive user interface |
| **Styling** | Tailwind CSS v3 | Modern dark AI-product theme |
| **Icons** | Lucide React | Iconography |
| **HTTP Client** | Native Fetch API | Centralized API client (`client/src/api/client.js`) |
| **Backend** | Node.js + Express | RESTful API server with modular layered architecture |
| **Database** | MongoDB Atlas + Mongoose | Cloud document database with Mongoose ODM |
| **Validation** | Zod | Runtime schema validation for env variables & requests |
| **AI Integration**| OpenAI SDK (`openai`) | OpenAI SDK configured with model default `gpt-4o-mini` |
| **Security** | Helmet + CORS | HTTP security headers and configurable CORS origins |

---

## 📁 Project Architecture & Directory Structure

```text
quantiphi/
├── package.json               # Root scripts to orchestrate client and server concurrently
├── .gitignore                 # Excludes node_modules, .env files, and build outputs
├── README.md                  # Project documentation
│
├── server/
│   ├── package.json           # Backend dependencies and scripts
│   ├── .env                   # Server environment variables (git-ignored)
│   ├── .env.example           # Environment template without secrets
│   └── src/
│       ├── config/
│       │   ├── env.js         # Zod runtime validation of environment variables
│       │   └── db.js          # Mongoose connection targeting ai_chat_assistant
│       ├── models/
│       │   └── index.js       # Model registry
│       ├── routes/
│       │   ├── health.routes.js # Route for GET /api/health
│       │   └── index.js       # Central router aggregation
│       ├── controllers/
│       │   └── health.controller.js # Trimmed health check (status, uptime, timestamp, database)
│       ├── services/
│       │   └── index.js       # Domain services registry (ready for OpenAI service)
│       ├── middleware/
│       │   ├── errorHandler.js   # Centralized error handler returning { error: { message, code } }
│       │   ├── notFoundHandler.js# 404 handler returning { error: { message, code: 'NOT_FOUND' } }
│       │   └── validate.js       # Generic Zod request schema validator
│       ├── utils/
│       │   ├── logger.js         # Structured timestamped logging utility
│       │   └── apiResponse.js    # Uniform API response helper
│       ├── app.js             # Express app (Helmet, CORS, JSON parsing, routes, error handlers)
│       └── server.js          # Startup bootstrap: verifies DB before listening, handles graceful shutdown
│
└── client/
    ├── package.json           # Frontend dependencies and Vite scripts
    ├── vite.config.js         # Vite configuration with React plugin
    ├── tailwind.config.js     # Tailwind CSS theme extension
    ├── postcss.config.js      # PostCSS configuration
    ├── index.html             # HTML entry point with dark mode default
    ├── .env                   # Frontend environment variables (git-ignored)
    ├── .env.example           # Frontend environment template
    └── src/
        ├── api/
        │   ├── client.js      # Centralized Fetch API client with streaming helper placeholder
        │   └── health.api.js  # API call for GET /api/health
        ├── components/
        │   ├── Header.jsx     # App bar with live DB status badge & tone selector
        │   ├── Sidebar.jsx    # Collapsible sidebar with New Chat & system status
        │   ├── WelcomeScreen.jsx # Genuine empty state with prompt starter chips
        │   ├── MessageArea.jsx# Chat viewport rendering WelcomeScreen or messages
        │   ├── ChatInput.jsx  # Multi-line input, tone indicator, send action
        │   └── ToneSelector.jsx# Interactive tone picker (Professional, Casual, etc.)
        ├── hooks/
        │   └── useHealthCheck.js # Polling hook for server & DB connectivity
        ├── pages/
        │   └── ChatPage.jsx   # Master page orchestrating sidebar, header, and chat
        ├── App.jsx            # Application root
        ├── main.jsx           # React DOM mounting point
        └── index.css          # Tailwind directives & dark scrollbars
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Active MongoDB Atlas cluster URI

### 2. Install Dependencies
Install all root, server, and client dependencies:
```bash
npm run install:all
```
*(Or run `npm install` in root, `server/`, and `client/`)*

### 3. Configure Environment Variables

**Backend (`server/.env`)**:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ai_chat_assistant?retryWrites=true&w=majority
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
```
*(Note: Port 5001 is used by default because macOS AirPlay Receiver reserves Port 5000).*

**Frontend (`client/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=AI Chat Assistant
```

---

## 🚀 Running the Application

### Option A: Run Both Concurrently
From the root directory:
```bash
npm run dev
```

### Option B: Run Individually

**Backend**:
```bash
npm run dev:server     # Runs server with nodemon
# or
npm run start:server   # Runs node src/server.js
```

**Frontend**:
```bash
npm run dev:client     # Runs Vite development server on http://localhost:5173
# or
npm run build:client   # Compiles production assets into client/dist/
```

---

## 📡 API Reference

### Health Check: `GET /api/health`
Returns the trimmed status of the server and MongoDB Atlas connection.

**Sample Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "uptime": 42,
  "timestamp": "2026-11-19T05:03:29.060Z",
  "database": "connected"
}
```

**Sample Response When Database Disconnected (`503 Service Unavailable`)**:
```json
{
  "status": "degraded",
  "uptime": 42,
  "timestamp": "2026-11-19T05:03:29.060Z",
  "database": "disconnected"
}
```

### Standard Error Response Format
All errors (including 404, Zod validation, and unhandled server errors) consistently return:
```json
{
  "error": {
    "message": "Specific error description",
    "code": "ERROR_CODE"
  }
}
```

---

## 🎓 Viva & Technical Architecture Highlights

1. **Database Refusal Policy**:
   - In `server/src/server.js`, `connectDB()` is awaited before `app.listen()` is invoked.
   - If MongoDB fails to connect, the process logs `❌ FATAL: BACKEND STARTUP ABORTED!` and exits with code 1.
   - In `server/src/config/db.js`, `dbName: 'ai_chat_assistant'` is explicitly set with no local fallback.

2. **Zod Environment Validation**:
   - `server/src/config/env.js` validates environment variables (`PORT`, `NODE_ENV`, `MONGODB_URI`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `CLIENT_URL`) at process startup.

3. **Centralized Error Handling**:
   - `server/src/middleware/errorHandler.js` returns `{ error: { message, code } }` across Zod validation (`VALIDATION_ERROR`), Mongoose errors, and unhandled exceptions.
   - Graceful shutdown handlers (`SIGINT`, `SIGTERM`) and `unhandledRejection` / `uncaughtException` listeners are registered in `server.js`.

4. **Centralized Frontend API Client**:
   - `client/src/api/client.js` encapsulates the native Fetch API with base URL resolution, JSON parsing, error transformation into `{ message, code }`, and a `streamRequest` helper for future streaming.

5. **Genuine Empty State & Interactive Prompt Chips**:
   - No mock conversations or hardcoded chat history.
   - Clicking a welcome screen prompt chip populates the chat input without auto-submitting.
