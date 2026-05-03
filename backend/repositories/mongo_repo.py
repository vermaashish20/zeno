from pymongo import MongoClient
from bson import ObjectId
from typing import List, Optional, Dict, Any
from config import MONGO_URI, DB_NAME
from models.schemas import Source, KnowledgeBase

class MongoRepository:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            self.db = self.client[DB_NAME]
            self.kb_col = self.db["knowledge_bases"]
            self.sources_col = self.db["sources"]
        except Exception as e:
            print(f"MongoDB connection failed: {e}")

    def _serialize(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        if not doc:
            return doc
        if "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        if "kb_id" in doc and doc["kb_id"]:
            doc["kb_id"] = str(doc["kb_id"])
        return doc

    # Knowledge Base Methods
    def create_kb(self, kb: KnowledgeBase) -> str:
        doc = kb.dict(exclude={'id', 'sources'})
        res = self.kb_col.insert_one(doc)
        return str(res.inserted_id)

    def get_all_kbs(self) -> List[KnowledgeBase]:
        kbs_cursor = self.kb_col.find().sort("created_at", -1)
        kbs = []
        for doc in kbs_cursor:
            serialized = self._serialize(doc)
            sources = self.get_sources_by_kb(serialized["id"])
            serialized["sources"] = [s.dict() for s in sources]
            kbs.append(KnowledgeBase(**serialized))
        return kbs

    def get_kb(self, kb_id: str) -> Optional[KnowledgeBase]:
        doc = self.kb_col.find_one({"_id": ObjectId(kb_id)})
        if not doc: return None
        serialized = self._serialize(doc)
        return KnowledgeBase(**serialized)

    # Source Methods
    def create_source(self, source: Source) -> str:
        doc = source.dict(exclude={'id'})
        if doc.get("kb_id"):
            doc["kb_id"] = ObjectId(doc["kb_id"])
        res = self.sources_col.insert_one(doc)
        return str(res.inserted_id)

    def get_source(self, source_id: str) -> Optional[Source]:
        doc = self.sources_col.find_one({"_id": ObjectId(source_id)})
        if not doc: return None
        return Source(**self._serialize(doc))

    def get_sources_by_kb(self, kb_id: Optional[str]) -> List[Source]:
        query = {"kb_id": ObjectId(kb_id)} if kb_id else {"kb_id": None}
        cursor = self.sources_col.find(query).sort("created_at", -1)
        return [Source(**self._serialize(doc)) for doc in cursor]

    def update_source_status(self, source_id: str, status: str, transcription: str = None):
        update_data = {"status": status}
        if transcription is not None:
            update_data["transcription"] = transcription
        self.sources_col.update_one({"_id": ObjectId(source_id)}, {"$set": update_data})
