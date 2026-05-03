import yt_dlp
import os
import uuid

def extract_playlist_info(url: str):
    """
    Checks if a URL is a playlist or single video without downloading.
    Returns a list of dicts with 'title' and 'url'.
    """
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
    }
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
    """
    Downloads a YouTube video to the output_dir. 
    Returns a dict with 'success', 'title', 'filepath', and 'id'.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    ydl_opts = {
        'format': 'bestaudio/best',  # Get best audio only
        'outtmpl': os.path.join(output_dir, f'{file_id}.%(ext)s'), # Use random ID to prevent file path issues
        'postprocessors': [{         # Extract audio and convert to mp3
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading: {url}")
            
            # extract_info performs the download and returns metadata
            info = ydl.extract_info(url, download=True)
            
            print("Download complete!")
            
            return {
                "success": True,
                "title": info.get('title', 'Unknown Title'),
                "id": info.get('id', 'Unknown ID'),
                # Since we used file_id in outtmpl, it is strictly this random string
                "filepath": os.path.join(output_dir, f"{file_id}.mp3")
            }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "success": False,
            "error": str(e)
        }
