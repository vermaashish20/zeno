from fastapi import HTTPException
from repositories.mongo_repo import MongoRepository
from models.schemas import ChatRequest, ChatResponse

class ChatService:
    def __init__(self, repo: MongoRepository):
        self.repo = repo

    def handle_chat(self, req: ChatRequest) -> ChatResponse:
        context_text = ""
        
        try:
            if req.target_type == "source":
                source = self.repo.get_source(req.target_id)
                if not source:
                    raise HTTPException(status_code=404, detail="Source not found")
                context_text = source.transcription or ""
            elif req.target_type == "kb":
                sources = self.repo.get_sources_by_kb(req.target_id)
                for s in sources:
                    context_text += f"\n\n--- Video: {s.title} ---\n"
                    context_text += (s.transcription or "")[:2000]
            else:
                raise HTTPException(status_code=400, detail="Invalid target_type. Must be 'source' or 'kb'.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
        return ChatResponse(
            reply=f"Based on the Knowledge Base, here is a mock response to: '{req.query}'. Context length parsed: {len(context_text)} characters."
        )
