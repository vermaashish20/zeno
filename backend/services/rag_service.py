import chromadb
from chromadb.utils import embedding_functions
from config import CHROMA_DB_PATH, COLLECTION_NAME, EMBEDDING_MODEL
from services.llm_service import LLMService
import uuid

class RAGService:
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self.client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        # Use a simple embedding function. You can switch to SentenceTransformer if preferred.
        self.emb_fn = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.emb_fn
        )

    async def summarize_transcript(self, transcript: str) -> str:
        if not transcript or transcript.strip() == "No speech detected.":
            return "No content to summarize."
            
        prompt = f"""Summarize the following transcript in a clear and concise manner for later retrieval. 
Focus on the main topics, key points, and any specific terminology used.

Transcript:
{transcript[:4000]}

Summary:"""
        summary = await self.llm_service.generate_response(prompt, stream=False)
        return summary

    async def generate_kb_summary(self, video_summaries: list) -> str:
        """Generates a high-level index/summary of all videos in a KB."""
        if not video_summaries:
            return "No video transcriptions available yet."
            
        summary_list = "\n".join([f"- {s}" for s in video_summaries if s])
        prompt = f"""Create a high-level index and summary of the following video knowledge base. 
List the key topics covered across all videos and provide a 2-3 sentence overview of what this knowledge base is about.

Individual Video Summaries:
{summary_list[:8000]}

Knowledge Base Index & Summary:"""
        
        return await self.llm_service.generate_response(prompt, stream=False)

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200):
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def index_source(self, source_id: str, kb_id: str, transcript: str, summary: str):
        # Index summary
        self.collection.add(
            documents=[summary],
            metadatas=[{"source_id": source_id, "kb_id": kb_id, "type": "summary"}],
            ids=[f"summary_{source_id}"]
        )

        # Index transcript chunks
        chunks = self._chunk_text(transcript)
        ids = [f"chunk_{source_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"source_id": source_id, "kb_id": kb_id, "type": "chunk"} for _ in range(len(chunks))]
        
        if chunks:
            self.collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
    def query_context(self, query: str, target_type: str, target_id: str, n_results: int = 5) -> str:
        where = {}
        if target_type == "source":
            where = {"source_id": target_id}
        elif target_type == "kb":
            where = {"kb_id": target_id}

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where
        )

        docs = results.get("documents", [[]])[0]
        return "\n\n".join(docs)
