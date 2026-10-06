# Python Universal Video & Audio Downloader

A lightweight, CLI-based video and audio downloader powered by [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) and `tqdm`. Supports video downloads in best MP4 quality as well as high-quality MP3 audio extraction.

## Features

- **Multi-Platform Support**: Works with YouTube, Twitter/X, TikTok, Vimeo, and hundreds of other sites supported by `yt-dlp`.
- **Real-Time Progress Bar**: Terminal progress bar displaying speed, downloaded size, and ETA.
- **Audio Extraction**: Easily extract audio in MP3 format with automatic FFmpeg post-processing.
- **Custom Output Path**: Specify custom directories for output files.

## Prerequisites

- **Python 3.8+**
- **FFmpeg**: Required for merging video+audio streams and for MP3 extraction.
  - **macOS**: `brew install ffmpeg`
  - **Ubuntu/Debian**: `sudo apt install ffmpeg`
  - **Windows**: Install via `winget install ffmpeg` or Chocolatey (`choco install ffmpeg`).

## Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
   cd YOUR_REPOSITORY_NAME
