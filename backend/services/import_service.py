from fastapi import BackgroundTasks, HTTPException
from repositories.mongo_repo import MongoRepository
from models.schemas import ImportRequest, ImportResponse, Source, KnowledgeBase
from downloader import extract_playlist_info, download_youtube_video
from faster_whisper import WhisperModel
import traceback

class ImportService:
    def __init__(self, repo: MongoRepository):
        self.repo = repo
        self.model = None

    def load_video_model(self):
        if self.model is not None:
            return
        model_size = "distil-large-v3"
        try:
            self.model = WhisperModel(model_size)
            print(f"Successfully loaded {model_size} on CUDA.")
        except Exception as e:
            print(f"Failed to load on CUDA, falling back to CPU. Error: {e}")
            self.model = WhisperModel(model_size, device="cpu", compute_type="int8")

    def process_source_background(self, source_id: str):
        source = self.repo.get_source(source_id)
        if not source:
            return
        
        self.repo.update_source_status(source_id, "progress")
        
        download_result = download_youtube_video(source.url)
        if not download_result.get("success"):
            self.repo.update_source_status(source_id, "error", f"Download failed: {download_result.get('error')}")
            return
            
        file_path = download_result["filepath"]
        
        try:
            self.load_video_model()
            segments, info = self.model.transcribe(file_path, beam_size=5, vad_filter=True)
            
            transcription_lines = []
            for segment in segments:
                transcription_lines.append(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
                
            final_transcription = "\n".join(transcription_lines)
            self.repo.update_source_status(source_id, "done", final_transcription if final_transcription else "No speech detected.")
        except Exception as e:
            traceback.print_exc()
            self.repo.update_source_status(source_id, "error", f"Transcription failed: {str(e)}")

    def handle_import(self, req: ImportRequest, background_tasks: BackgroundTasks) -> ImportResponse:
        videos_to_import = extract_playlist_info(req.url)
        if not videos_to_import:
            raise HTTPException(status_code=400, detail="Could not extract info from URL")
            
        kb_id = None
        if req.target == "new_kb":
            kb = KnowledgeBase(title=req.new_kb_name or "Untitled KB")
            kb_id = self.repo.create_kb(kb)
        elif req.target != "standalone":
            kb_id = req.target
            
        created_sources = []
        
        for vid in videos_to_import:
            source = Source(
                kb_id=kb_id,
                title=vid["title"],
                url=vid["url"],
                type="video"
            )
            source_id = self.repo.create_source(source)
            created_sources.append(source_id)
            background_tasks.add_task(self.process_source_background, source_id)
            
        return ImportResponse(
            status="success",
            message=f"Queued {len(videos_to_import)} videos for processing.",
            kb_id=kb_id,
            source_ids=created_sources
        )
