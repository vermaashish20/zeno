from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Common Models
class MongoBaseModel(BaseModel):
    id: Optional[str] = None
    
    class Config:
        populate_by_name = True

# DB Entity Models
class Source(MongoBaseModel):
    kb_id: Optional[str] = None
    title: str
    url: str
    status: str = "idle"
    type: str = "video"
    transcription: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeBase(MongoBaseModel):
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sources: Optional[List[Source]] = []

# Request Models
class ImportRequest(BaseModel):
    url: str
    target: str # "standalone", "new_kb", or a kb_id string
    new_kb_name: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    target_type: str # "source" or "kb"
    target_id: str

# Response Models
class ChatResponse(BaseModel):
    reply: str

class ImportResponse(BaseModel):
    status: str
    message: str
    kb_id: Optional[str] = None
    source_ids: Optional[List[str]] = []
