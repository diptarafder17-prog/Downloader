export interface RepoFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PYTHON_REPO_FILES: RepoFile[] = [
  {
    name: 'main.py',
    path: 'video-downloader/main.py',
    language: 'python',
    description: 'CLI entry point with argparse, tqdm progress hooks, and yt-dlp integration',
    content: `import os
import sys
import argparse
import yt_dlp
from tqdm import tqdm

class TqdmProgressHook:
    """Progress hook for yt-dlp using tqdm for terminal visualization."""
    def __init__(self):
        self.pbar = None

    def __call__(self, d):
        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate')
            downloaded = d.get('downloaded_bytes', 0)

            if self.pbar is None and total:
                self.pbar = tqdm(
                    total=total,
                    unit='B',
                    unit_scale=True,
                    unit_divisor=1024,
                    desc="Downloading",
                    ncols=80
                )

            if self.pbar:
                self.pbar.n = downloaded
                self.pbar.refresh()

        elif d['status'] == 'finished':
            if self.pbar:
                self.pbar.close()
                self.pbar = None


def get_ydl_options(download_audio: bool = False, output_dir: str = "downloads") -> dict:
    """Generates yt-dlp configuration options."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    progress_hook = TqdmProgressHook()

    options = {
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        'progress_hooks': [progress_hook],
    }

    if download_audio:
        options.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
    else:
        options.update({
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'merge_output_format': 'mp4',
        })

    return options


def download(url: str, audio_only: bool = False, output_dir: str = "downloads"):
    """Executes the video or audio download."""
    print(f"\\n[+] Fetching media information...")
    ydl_opts = get_ydl_options(download_audio=audio_only, output_dir=output_dir)

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print(f"\\n[✓] Download complete! Saved to '{output_dir}' directory.")
    except Exception as e:
        print(f"\\n[!] Error during download: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Download videos or audio from supported sites.")
    parser.add_argument("url", nargs="?", help="URL of the video to download")
    parser.add_argument("-a", "--audio", action="store_true", help="Extract audio only (MP3)")
    parser.add_argument("-o", "--output", default="downloads", help="Output directory (default: downloads)")

    args = parser.parse_args()

    url = args.url
    if not url:
        url = input("Enter video URL: ").strip()

    if url:
        download(url, audio_only=args.audio, output_dir=args.output)
    else:
        print("[!] No URL provided. Exiting.")


if __name__ == "__main__":
    main()`,
  },
  {
    name: 'requirements.txt',
    path: 'video-downloader/requirements.txt',
    language: 'plaintext',
    description: 'Python package dependencies (yt-dlp, tqdm)',
    content: `yt-dlp>=2024.0.0
tqdm>=4.65.0`,
  },
  {
    name: '.gitignore',
    path: 'video-downloader/.gitignore',
    language: 'gitignore',
    description: 'Git ignore rules for Python artifacts, virtualenvs, and download folder',
    content: `# Python artifacts
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Environments
.venv/
env/
venv/
ENV/

# Output folder for downloaded media
downloads/

# IDE files
.vscode/
.idea/
*.swp`,
  },
  {
    name: 'README.md',
    path: 'video-downloader/README.md',
    language: 'markdown',
    description: 'Documentation with usage instructions and prerequisites',
    content: `# Python Universal Video & Audio Downloader

A lightweight, CLI-based video and audio downloader powered by [\`yt-dlp\`](https://github.com/yt-dlp/yt-dlp) and \`tqdm\`. Supports video downloads in best MP4 quality as well as high-quality MP3 audio extraction.

## Features

- **Multi-Platform Support**: Works with YouTube, Twitter/X, TikTok, Vimeo, and hundreds of other sites supported by \`yt-dlp\`.
- **Real-Time Progress Bar**: Terminal progress bar displaying speed, downloaded size, and ETA.
- **Audio Extraction**: Easily extract audio in MP3 format with automatic FFmpeg post-processing.
- **Custom Output Path**: Specify custom directories for output files.

## Prerequisites

- **Python 3.8+**
- **FFmpeg**: Required for merging video+audio streams and for MP3 extraction.
  - **macOS**: \`brew install ffmpeg\`
  - **Ubuntu/Debian**: \`sudo apt install ffmpeg\`
  - **Windows**: Install via \`winget install ffmpeg\` or Chocolatey (\`choco install ffmpeg\`).

## Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   \`\`\`

2. **Set up virtual environment**:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   pip install -r requirements.txt
   \`\`\`

3. **Usage**:
   \`\`\`bash
   # Download best quality MP4
   python main.py "https://www.youtube.com/watch?v=EXAMPLE"

   # Extract MP3 audio (192kbps)
   python main.py "https://www.youtube.com/watch?v=EXAMPLE" -a

   # Save to custom directory
   python main.py "https://www.youtube.com/watch?v=EXAMPLE" -o "my_podcasts"
   \`\`\`
`,
  },
];

export interface SampleVideo {
  id: string;
  title: string;
  platform: string;
  author: string;
  url: string;
  thumbnail: string;
  previewVideoUrl: string;
  duration: string;
  size: string;
  category: string;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny (Open Source 4K CGI Film)',
    platform: 'Blender Open Movie',
    author: 'Blender Animation Studio',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '09:56',
    size: '158 MB',
    category: 'Animation',
  },
  {
    id: 'sample-2',
    title: 'Tears of Steel (Sci-Fi VFX Project)',
    platform: 'Vimeo Open Project',
    author: 'Ian Hubert & Blender Foundation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '12:14',
    size: '224 MB',
    category: 'Sci-Fi / Film',
  },
  {
    id: 'sample-3',
    title: 'Sintel (Fantasy Cinematic Animation)',
    platform: 'YouTube / Blender',
    author: 'Durian Open Film Team',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '14:48',
    size: '190 MB',
    category: 'Cinematic',
  },
  {
    id: 'sample-4',
    title: 'For Bigger Blazes (Action Drone Reel)',
    platform: 'Direct Stream',
    author: 'Chromecast High-Def Reel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '00:15',
    size: '15 MB',
    category: 'Nature / Drone',
  },
];
