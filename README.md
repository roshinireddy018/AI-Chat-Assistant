# Full-Stack AI Chat Assistant

Full-stack architecture for an AI Chat Assistant built with React, Vite, Tailwind CSS v3, Node.js, Express, MongoDB Atlas, Mongoose, Zod, and the OpenAI SDK.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Reactive user interface |
| **Styling** | Tailwind CSS v3 | Editorial warm theme |
| **Icons** | Lucide React | Line icons |
| **HTTP Client** | Native Fetch API | Centralized API client (client/src/api/client.js) with streaming helper |
| **Backend** | Node.js + Express | RESTful API server with modular layered architecture |
| **Database** | MongoDB Atlas + Mongoose | Cloud document database with Mongoose ODM |
| **Validation** | Zod | Runtime schema validation for env variables & requests |
| **AI Integration**| OpenAI SDK (openai) | OpenAI SDK configured with model default gpt-4o-mini |
| **Security** | Helmet + CORS | HTTP security headers and configurable CORS origins |

---

## Project Architecture & Directory Structure

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
│       │   ├── conversation.model.js # Conversation schema (title, tone)
│       │   ├── message.model.js      # Message schema (conversationId, sender, content, tone)
│       │   └── index.js       # Model registry
│       ├── routes/
│       │   ├── health.routes.js       # Route for GET /api/health
│       │   ├── conversation.routes.js # Routes for conversation CRUD
│       │   ├── chat.routes.js         # Route for POST /api/chat/stream
│       │   └── index.js       # Central router aggregation
│       ├── controllers/
│       │   ├── health.controller.js       # Trimmed health check (status, uptime, timestamp, database)
│       │   ├── conversation.controller.js # Conversation handlers (list, create, get, rename, delete)
│       │   └── chat.controller.js         # SSE streaming chat handler
│       ├── services/
│       │   ├── ai.service.js  # OpenAI completion streaming service
│       │   └── index.js       # Domain services registry
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
    ├── index.html             # HTML entry point with Google Fonts (Source Serif 4)
    ├── .env                   # Frontend environment variables (git-ignored)
    ├── .env.example           # Frontend environment template
    └── src/
        ├── api/
        │   ├── client.js      # Centralized Fetch API client with SSE ReadableStream helper
        │   ├── conversations.api.js # Conversation API methods
        │   └── health.api.js  # API call for GET /api/health
        ├── components/
        │   ├── Header.jsx     # Minimal header with editable title and markdown export
        │   ├── Sidebar.jsx    # Editorial sidebar with search, grouped list, inline rename, delete
        │   ├── WelcomeScreen.jsx # Centered serif greeting
        │   ├── MessageArea.jsx# Chat viewport with auto-scroll detection
        │   ├── MessageItem.jsx# Individual bubble with copy, regenerate, tone label
        │   ├── CodeBlock.jsx  # Monospace code block with copy button
        │   └── ChatInput.jsx  # Composer card with segmented tone toggle and circular send/stop button
        ├── hooks/
        │   └── useHealthCheck.js # Polling hook for server & DB connectivity
        ├── pages/
        │   └── ChatPage.jsx   # Master page orchestrating sidebar, header, and chat state
        ├── App.jsx            # Application root
        ├── main.jsx           # React DOM mounting point
        └── index.css          # CSS variables for light/dark editorial warm themes
```

---

## Quick Start

### 1. Prerequisites
- Node.js: v18.0.0 or higher
- MongoDB: Active MongoDB Atlas cluster URI

### 2. Install Dependencies
Install all root, server, and client dependencies:
```bash
npm run install:all
```

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

## Running the Application

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

## API Reference

### Health Check: `GET /api/health`
Returns the status of the server and MongoDB Atlas connection.

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

### Conversations: `GET /api/conversations?q=`
Returns list of conversations matching optional query, sorted by `updatedAt` descending.

### Chat Streaming: `POST /api/chat/stream`
Streams completions via Server-Sent Events (SSE).
Request Body:
```json
{
  "conversationId": "optional_existing_id",
  "message": "User query",
  "tone": "Professional"
}
```

### Standard Error Response Format
All errors consistently return:
```json
{
  "error": {
    "message": "Specific error description",
    "code": "ERROR_CODE"
  }
}
```
