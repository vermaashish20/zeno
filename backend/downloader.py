import yt_dlp
import os
import uuid

COOKIES_FILE = os.path.join(os.path.dirname(__file__), "youtube_cook.txt")

def extract_playlist_info(url: str):
    """
    Checks if a URL is a playlist or single video without downloading.
    Returns a list of dicts with 'title' and 'url'.
    """
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'remote_components': ['ejs:github'],
        'jsruntimes': ['deno', 'node'],
    }
    
    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE
    

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if 'entries' in info:
                # It's a playlist or channel
                entries = []
                for entry in info['entries']:
                    # some entries might be None if private/deleted
                    if entry and entry.get('url'):
                        entries.append({'title': entry.get('title', 'Unknown'), 'url': entry.get('url')})
                return entries
            else:
                # Single video
                return [{'title': info.get('title', 'Unknown Title'), 'url': url}]
    except Exception as e:
        print(f"Error extracting info: {e}")
        return []

def download_youtube_video(url: str, output_dir: str = "downloads"):
    os.makedirs(output_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio', 
        'outtmpl': os.path.join(output_dir, f'{file_id}.%(ext)s'),
        'remote_components': ['ejs:github'],
        'jsruntimes': ['deno', 'node'],
    }

    if os.path.exists(COOKIES_FILE):
        ydl_opts['cookiefile'] = COOKIES_FILE



    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading: {url}")
            info = ydl.extract_info(url, download=True)
            
            # Get the actual extension downloaded (e.g., m4a or webm)
            ext = info.get('ext', 'm4a') 
            filepath = os.path.join(output_dir, f"{file_id}.{ext}")
            
            print(f"Download complete: {filepath}")
            return {
                "success": True,
                "title": info.get('title', 'Unknown Title'),
                "id": info.get('id', 'Unknown ID'),
                "filepath": filepath
            }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"success": False, "error": str(e)}
