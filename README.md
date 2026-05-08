# Zeno: Omni-Channel Knowledge Base

Zeno is a full-stack, AI-powered knowledge base management system. It allows users to ingest raw media (YouTube videos, entire playlists, or channels), transcribe them using state-of-the-art open-source speech-to-text, and group them into structured Knowledge Bases. These Knowledge Bases can then be interactively queried using LLMs to extract insights, answer questions, or generate new content.

## 🚀 Features

- **Omni-Channel Ingestion:** Import single YouTube videos or entire Playlists and Channels.
- **Asynchronous Background Processing:** Heavy video downloading and transcription processes run safely in the background without blocking the API.
- **State-of-the-Art Transcription:** Powered by OpenAI's `faster-whisper` for blazing-fast, highly accurate speech-to-text.
- **Knowledge Base Organization:** Group related videos into semantic folders (Knowledge Bases) for cross-referencing.
- **Contextual RAG Chat:** Chat with a single video transcript, or query the entire Knowledge Base for comprehensive insights.
- **Agentic RAG Workflow:** Powered by `LangGraph`, the system uses a stateful agent to analyze queries, decide on retrieval strategies, and ensure grounded responses.
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
- Media Processing: `yt-dlp` (configured with Deno/Node for JS challenges) and `faster-whisper`
- LLM Engine: Multi-provider support (Ollama, OpenAI, Gemini)
- Orchestration: LangGraph (for Agentic RAG)
- Execution Model: Fully Asynchronous (`asyncio` + `httpx`)
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
│   └── services/             # Core Business Logic (Agentic RAG, Whisper, YT-dlp)
│
└── frontend/                 # Next.js Application
    ├── app/
    │   ├── ClientVideoAnswerEngine.tsx # Main Interactive Dashboard
    │   ├── controllers/      # React Custom Hooks
    │   ├── services/         # API fetch wrappers
    │   └── types/            # TypeScript Interface Definitions
    └── package.json
```

## 🧠 Agentic RAG Architecture

Zeno implements a production-grade Agentic RAG pipeline using **LangGraph**. This ensures high accuracy, low latency, and efficient token usage.

```text
+-----------------------------------------------------------------------+
|                       Fetch Workspace Context                         |
|           (Identifies workspace title, summaries, and index)          |
+--------------------------+--------------------------------------------+
                           |
                           v
+-----------------------------------------------------------------------+
|                         Decision Router                               |
|           (Analyzes query: Does it need knowledge base?)              |
+--------+------------------------------+-------------------------------+
         |                              |
         | [Needs Context]              | [General Chat]
         v                              v
+-----------------------+      +-----------------------+
|  ChromaDB Retriever   |      |   Direct Generator    |
| (Fetches transcripts) |      |   (General knowledge) |
+--------+--------------+      +----------+------------+
         |                                |
         v                                |
+-----------------------+                 |
|    Document Grader    |                 |
| (Checks relevance)    |                 |
+--------+-------+------+                 |
         |       |                        |
 [Relevant]      | [Irrelevant]           |
         |       v                        |
         |   +-----------------------+    |
         |   |    Query Rewriter     |    |
         |   | (Refines search query)|    |
         |   +-----------+-----------+    |
         |               |                |
         +---------------+----------------+
                         |
                         v
             +-----------------------+
             |    Response Generator |
             |  (Grounded in context)|
             +-----------+-----------+
                         |
                         v
             +-----------------------+
             |  Hallucination Check  |
             | (Final verification)  |
             +-----------+-----------+
                         |
                         v
                  [Final Response]
```

### Key Components:
- **Asynchronous Execution:** Entire pipeline built on `httpx` and `async/await` for non-blocking, low-latency processing of LLM requests.
- **Workspace-Aware Intelligence:** Every query starts by fetching the high-level workspace index, providing the agent with "Big Picture" context of all transcripts.
- **Stateful Management:** Uses LangGraph's `MemorySaver` to persist conversation state across interactions.
- **Self-Correction & Routing:** Intelligent routing decides between direct answers and RAG retrieval, with a grading loop to ensure context relevance.

## 💻 Getting Started

### Prerequisites
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Node.js / [Bun](https://bun.sh/)
- [Deno](https://deno.com/) (Highly recommended for `yt-dlp` to bypass JS-based bot detection)
- [Ollama](https://ollama.com/) (Running `gemma2:2b` or similar for local RAG)
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
