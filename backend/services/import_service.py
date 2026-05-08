from fastapi import BackgroundTasks, HTTPException
from repositories.mongo_repo import MongoRepository
from models.schemas import ImportRequest, ImportResponse, Source, KnowledgeBase, PreviewRequest, PreviewResponse, VideoPreview
from downloader import extract_playlist_info, download_youtube_video
from faster_whisper import WhisperModel
import traceback
import gc
import time
import asyncio

from services.rag_service import RAGService

class ImportService:
    def __init__(self, repo: MongoRepository, rag_service: RAGService):
        self.repo = repo
        self.rag_service = rag_service
        self.model = None

    def load_video_model(self):
        if self.model is not None:
            return
        # model_size = "distil-large-v3"
        model_size = "tiny"
        try:
            self.model = WhisperModel(model_size, compute_type='int8')
            print(f"Successfully loaded {model_size} on CUDA.")
        except Exception as e:
            print(f"Failed to load on CUDA, falling back to CPU. Error: {e}")
            self.model = WhisperModel(model_size, compute_type="int8")

    async def process_source_background(self, source_id: str):
        source = self.repo.get_source(source_id)
        if not source:
            return
        
        self.repo.update_source_status(source_id, "progress")
        
        # Download is still sync but runs in background thread pool via BackgroundTasks
        # For simplicity we keep it sync here as yt-dlp is blocking anyway
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
            if not final_transcription:
                final_transcription = "No speech detected."
            
            # Release Whisper model resources before starting LLM tasks
            del segments
            gc.collect()
            print("--- CLEANED UP WHISPER RESOURCES ---")
            
            # Step 1: Save transcription
            self.repo.update_source_status(source_id, "done", final_transcription)
            
            # Step 2: Summarize and Vectorize
            try:
                await asyncio.sleep(2) # Give system a breather after heavy transcription
                print(f"--- STARTING SUMMARY FOR SOURCE {source_id} ---")
                summary = await self.rag_service.summarize_transcript(final_transcription)
                print(f"--- SUMMARY GENERATED (Length: {len(summary) if summary else 0}) ---")
                
                if not summary or "Ollama Error" in summary:
                    print(f"Summary generation failed or returned error: {summary}")
                
                self.repo.update_source_status(source_id, "done", final_transcription, summary)
                self.rag_service.index_source(source_id, source.kb_id, final_transcription, summary)
                print(f"Successfully indexed source {source_id}")
                
                # Step 3: Update KB-level summary if applicable
                if source.kb_id:
                    print(f"--- UPDATING KB SUMMARY FOR {source.kb_id} ---")
                    sources = self.repo.get_sources_by_kb(source.kb_id)
                    summaries = [s.summary for s in sources if s.summary and "Ollama Error" not in s.summary]
                    
                    if summaries:
                        kb_summary = await self.rag_service.generate_kb_summary(summaries)
                        print(f"--- KB SUMMARY GENERATED (Length: {len(kb_summary) if kb_summary else 0}) ---")
                        self.repo.update_kb_summary(source.kb_id, kb_summary)
                    else:
                        print("No valid video summaries found to generate KB summary.")
                    
            except Exception as e:
                print(f"RAG indexing/KB summary update failed for {source_id}: {e}")
                traceback.print_exc()
                
        except Exception as e:
            traceback.print_exc()
            self.repo.update_source_status(source_id, "error", f"Transcription failed: {str(e)}")

    def get_preview(self, req: PreviewRequest) -> PreviewResponse:
        videos = extract_playlist_info(req.url)
        return PreviewResponse(
            videos=[VideoPreview(title=v["title"], url=v["url"]) for v in videos]
        )

    def handle_import(self, req: ImportRequest, background_tasks: BackgroundTasks) -> ImportResponse:
        videos_to_import = extract_playlist_info(req.url)
        if not videos_to_import:
            raise HTTPException(status_code=400, detail="Could not extract info from URL")
            
        # Filter if selected_urls provided
        if req.selected_urls:
            selected_set = set(req.selected_urls)
            videos_to_import = [v for v in videos_to_import if v["url"] in selected_set]
            
        if not videos_to_import:
            raise HTTPException(status_code=400, detail="No videos selected or found for import")

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
