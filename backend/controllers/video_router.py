from fastapi import APIRouter, BackgroundTasks, Depends
from typing import List
from models.schemas import ImportRequest, ImportResponse, ChatRequest, ChatResponse, KnowledgeBase, Source
from repositories.mongo_repo import MongoRepository
from services.import_service import ImportService
from services.chat_service import ChatService

router = APIRouter(prefix="/api/video", tags=["video"])

def get_repo():
    return MongoRepository()

def get_import_service(repo: MongoRepository = Depends(get_repo)):
    return ImportService(repo)

def get_chat_service(repo: MongoRepository = Depends(get_repo)):
    return ChatService(repo)

@router.post("/import", response_model=ImportResponse)
async def import_videos(req: ImportRequest, background_tasks: BackgroundTasks, service: ImportService = Depends(get_import_service)):
    return service.handle_import(req, background_tasks)

@router.get("/knowledge_bases", response_model=List[KnowledgeBase])
async def list_knowledge_bases(repo: MongoRepository = Depends(get_repo)):
    return repo.get_all_kbs()

@router.get("/standalone_sources", response_model=List[Source])
async def list_standalone_sources(repo: MongoRepository = Depends(get_repo)):
    return repo.get_sources_by_kb(None)

@router.post("/chat", response_model=ChatResponse)
async def chat_engine(req: ChatRequest, service: ChatService = Depends(get_chat_service)):
    return service.handle_chat(req)
