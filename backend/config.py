import os
from dotenv import load_dotenv

load_dotenv()


MONGO_URI = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "zeno")

# LLM Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "nvidia")  # options: ollama, openai, gemini, nvidia
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

# NVIDIA Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "mistralai/mistral-nemotron")

# ChromaDB Configuration
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAME = "zeno_transcripts"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
 