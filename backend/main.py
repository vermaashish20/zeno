from fastapi import FastAPI
from controllers.video_router import router as video_router
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging for faster-whisper
logging.basicConfig()
logging.getLogger("faster_whisper").setLevel(logging.DEBUG)

app = FastAPI(title="Omni-Channel Knowledge Base API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(video_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Omni-Channel Knowledge Base Gateway"}

if __name__ == "__main__":
    import uvicorn
    # Make sure this runs on the gateway port or specifically 8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
