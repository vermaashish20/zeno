import sys
import os

# Add the parent directory to sys.path to import downloader
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from downloader import extract_playlist_info

def test_extraction():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" # Never gonna give you up
    print(f"Testing extraction for: {url}")
    info = extract_playlist_info(url)
    if info:
        print(f"Success! Extracted info for: {info[0]['title']}")
    else:
        print("Failed to extract info.")

if __name__ == "__main__":
    test_extraction()
