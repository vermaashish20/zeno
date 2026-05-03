# Zeno: Omni-Channel Knowledge Base

Zeno is a full-stack, AI-powered knowledge base management system. It allows users to ingest raw media (YouTube videos, entire playlists, or channels), transcribe them using state-of-the-art open-source speech-to-text, and group them into structured Knowledge Bases. These Knowledge Bases can then be interactively queried using LLMs to extract insights, answer questions, or generate new content.

## 🚀 Features

- **Omni-Channel Ingestion:** Import single YouTube videos or entire Playlists and Channels.
- **Asynchronous Background Processing:** Heavy video downloading and transcription processes run safely in the background without blocking the API.
- **State-of-the-Art Transcription:** Powered by OpenAI's `faster-whisper` for blazing-fast, highly accurate speech-to-text.
- **Knowledge Base Organization:** Group related videos into semantic folders (Knowledge Bases) for cross-referencing.
- **Contextual RAG Chat:** Chat with a single video transcript, or query the entire Knowledge Base for comprehensive insights.
- **Strictly Typed Architecture:** Built on a highly scalable Controller-Service-Repository pattern with strict Pydantic schemas.

## 🛠️ Tech Stack

**Frontend (`/frontend`)**
- Framework: Next.js 16
- UI Library: React 19
- Styling: Tailwind CSS v4
- Language: TypeScript
- Architecture: Custom Hooks (Controllers) & Service Wrappers

**Backend (`/backend`)**
- Framework: FastAPI
- Database: MongoDB (PyMongo)
- Media Processing: `yt-dlp` and `faster-whisper`
- Environment Management: `uv`

## 📁 Project Structure

```text
zeno/
├── backend/                  # FastAPI Application
│   ├── config.py             # DB and Environment config
│   ├── main.py               # Application entrypoint
│   ├── controllers/          # FastAPI Route handlers
│   ├── models/               # Strict Pydantic Data Models
│   ├── repositories/         # MongoDB Database Interactions
│   └── services/             # Core Business Logic (YT-dlp, Whisper, Chat)
│
└── frontend/                 # Next.js Application
    ├── app/
    │   ├── ClientVideoAnswerEngine.tsx # Main Interactive Dashboard
    │   ├── controllers/      # React Custom Hooks
    │   ├── services/         # API fetch wrappers
    │   └── types/            # TypeScript Interface Definitions
    └── package.json
```

## 💻 Getting Started

### Prerequisites
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Node.js / [Bun](https://bun.sh/)
- FFmpeg (Required for audio processing)
- MongoDB instance running locally (default: `mongodb://localhost:27017/`)

### 1. Start the Backend

Navigate to the `backend` directory, install dependencies, and start the FastAPI server:

```bash
cd backend
# Install dependencies using uv
uv sync
# Run the FastAPI server (Runs on port 8000)
uvicorn main:app --reload
```

### 2. Start the Frontend

Navigate to the `frontend` directory, install packages, and start the development server:

```bash
cd frontend
# Install dependencies
npm install  # or bun install
# Start the Next.js dev server
npm run dev  # or bun dev
```

### 3. Usage
Open your browser and navigate to `http://localhost:3000` to access the Zeno dashboard. The frontend will communicate with the backend API at `http://localhost:8000`.
