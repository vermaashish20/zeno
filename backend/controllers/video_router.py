from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from typing import List
from models.schemas import ImportRequest, ImportResponse, ChatRequest, ChatResponse, KnowledgeBase, Source, CreateKBRequest, PreviewRequest, PreviewResponse
from repositories.mongo_repo import MongoRepository
from services.import_service import ImportService
from services.chat_service import ChatService
from services.llm_service import LLMService
from services.rag_service import RAGService
from services.agent_service import AgentService

router = APIRouter(prefix="/api/video", tags=["video"])

def get_repo():
    return MongoRepository()

def get_llm_service():
    return LLMService()

def get_rag_service(llm: LLMService = Depends(get_llm_service)):
    return RAGService(llm)

def get_import_service(repo: MongoRepository = Depends(get_repo), rag: RAGService = Depends(get_rag_service)):
    return ImportService(repo, rag)

def get_agent_service(repo: MongoRepository = Depends(get_repo), llm: LLMService = Depends(get_llm_service), rag: RAGService = Depends(get_rag_service)):
    return AgentService(llm, rag, repo)

def get_chat_service(repo: MongoRepository = Depends(get_repo), llm: LLMService = Depends(get_llm_service), agent: AgentService = Depends(get_agent_service)):
    return ChatService(repo, llm, agent)

@router.post("/import", response_model=ImportResponse)
async def import_videos(req: ImportRequest, background_tasks: BackgroundTasks, service: ImportService = Depends(get_import_service)):
    return service.handle_import(req, background_tasks)

@router.post("/preview", response_model=PreviewResponse)
async def preview_import(req: PreviewRequest, service: ImportService = Depends(get_import_service)):
    return service.get_preview(req)

@router.get("/knowledge_bases", response_model=List[KnowledgeBase])
async def list_knowledge_bases(repo: MongoRepository = Depends(get_repo)):
    return repo.get_all_kbs()

@router.get("/standalone_sources", response_model=List[Source])
async def list_standalone_sources(repo: MongoRepository = Depends(get_repo)):
    return repo.get_sources_by_kb(None)

@router.post("/chat")
async def chat_engine(req: ChatRequest, service: ChatService = Depends(get_chat_service)):
    return StreamingResponse(service.handle_chat(req), media_type="text/event-stream")

@router.post("/knowledge_bases", response_model=KnowledgeBase)
async def create_knowledge_base(req: CreateKBRequest, repo: MongoRepository = Depends(get_repo)):
    kb = KnowledgeBase(title=req.title)
    kb_id = repo.create_kb(kb)
    new_kb = repo.get_kb(kb_id)
    return new_kb

@router.patch("/knowledge_bases/{kb_id}")
async def update_kb(kb_id: str, req: CreateKBRequest, repo: MongoRepository = Depends(get_repo)):
    repo.update_kb_title(kb_id, req.title)
    return {"status": "success"}
