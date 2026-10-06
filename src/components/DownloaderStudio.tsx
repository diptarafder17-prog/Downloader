import React, { useState, useRef } from 'react';
import { 
  Download, 
  Search, 
  Play, 
  Pause, 
  Music, 
  Film, 
  Folder, 
  Copy, 
  Check, 
  Sparkles, 
  Volume2, 
  Trash2, 
  Camera,
  ExternalLink,
  ChevronRight,
  Loader2,
  HardDrive
} from 'lucide-react';
import { DownloadItem, MediaInspectResult, MediaFormat } from '../types.ts';
import { SAMPLE_VIDEOS } from '../data/pythonRepoData.ts';

interface DownloaderStudioProps {
  downloads: DownloadItem[];
  onStartDownload: (item: Omit<DownloadItem, 'id' | 'timestamp' | 'progress' | 'downloadedBytes' | 'totalBytes' | 'speed' | 'status'>) => void;
  onPauseResumeDownload: (id: string) => void;
  onCancelDownload: (id: string) => void;
  onDeleteDownload: (id: string) => void;
  onSendToAnalyzer: (imageUrl: string) => void;
  onSendToTts: (text: string) => void;
}

export const DownloaderStudio: React.FC<DownloaderStudioProps> = ({
  downloads,
  onStartDownload,
  onPauseResumeDownload,
  onCancelDownload,
  onDeleteDownload,
  onSendToAnalyzer,
  onSendToTts,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [outputDir, setOutputDir] = useState('downloads');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('bestvideo+bestaudio/best');
  const [inspecting, setInspecting] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInspectResult | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-inspect on sample click or search
  const handleInspectUrl = async (urlToInspect: string) => {
    if (!urlToInspect.trim()) return;
    setInspecting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/media/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToInspect.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to inspect media stream.');
      }

      const data: MediaInspectResult = await res.json();
      setMediaInfo(data);
      // Pick first matching format
      if (isAudioOnly) {
        const audioFmt = data.formats.find(f => f.type === 'audio');
        if (audioFmt) setSelectedFormat(audioFmt.formatId);
      } else {
        const videoFmt = data.formats.find(f => f.type === 'video');
        if (videoFmt) setSelectedFormat(videoFmt.formatId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not fetch media streams for this URL. Please verify the URL format.');
    } finally {
      setInspecting(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    handleInspectUrl(sampleUrl);
  };

  // Generate equivalent yt-dlp command
  const generatedCommand = `python main.py "${urlInput || 'https://www.youtube.com/watch?v=EXAMPLE'}" ${
    isAudioOnly ? '-a ' : ''
  }-o "${outputDir || 'downloads'}"`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleTriggerDownload = () => {
    if (!mediaInfo && !urlInput) return;

    const chosenFormatObj = mediaInfo?.formats.find(f => f.formatId === selectedFormat);
    const title = mediaInfo ? mediaInfo.title : 'Downloaded Stream';
    const platform = mediaInfo ? mediaInfo.platform : 'Web Media';
    const thumb = mediaInfo ? mediaInfo.thumbnail : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
    const fileExt = isAudioOnly ? 'mp3' : (chosenFormatObj?.ext || 'mp4');
    const totalSize = chosenFormatObj?.approxSize || (isAudioOnly ? '12.4 MB' : '48.2 MB');

    onStartDownload({
      title,
      platform,
      url: urlInput,
      thumbnail: thumb,
      fileExt,
      formatId: selectedFormat,
      isAudioOnly,
      outputDir: outputDir || 'downloads',
      totalSize,
      downloadUrl: mediaInfo?.previewVideoUrl,
    });
  };

  // Capture frame from video preview
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onSendToAnalyzer(dataUrl);
      }
    } catch (e) {
      // Fallback: send thumbnail
      if (mediaInfo?.thumbnail) {
        onSendToAnalyzer(mediaInfo.thumbnail);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>Universal Python yt-dlp Core</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Universal Video Downloader & Media Studio
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Download high-definition videos, extract 192/320kbps MP3 audio, inspect stream manifests, or run yt-dlp commands with real-time tqdm progress metrics.
          </p>

          {/* Quick Preset Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Test Samples:</span>
            {SAMPLE_VIDEOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s.url)}
                className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition flex items-center space-x-1"
              >
                <span>{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input & Inspection Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInspectUrl(urlInput)}
              placeholder="Paste video URL (YouTube, Vimeo, TikTok, Twitter/X, Instagram, or Direct Stream)..."
              className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            />
            {urlInput && (
              <button
                onClick={() => setUrlInput('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleInspectUrl(urlInput)}
            disabled={inspecting || !urlInput.trim()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {inspecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inspecting Stream...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Inspect & Fetch</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Options Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Toggle: Video vs Audio */}
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setIsAudioOnly(false);
                  if (mediaInfo) {
                    const vf = mediaInfo.formats.find(f => f.type === 'video');
                    if (vf) setSelectedFormat(vf.formatId);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  !isAudioOnly ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Full Video (MP4)</span>
              </button>
              <button
                onClick={() => {
                  setIsAudioOnly(true);
                  if (mediaInfo) {
                    const af = mediaInfo.formats.find(f => f.type === 'audio');
                    if (af) setSelectedFormat(af.formatId);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  isAudioOnly ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio Extraction (-a MP3)</span>
              </button>
            </div>

            {/* Custom Output Directory */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Dir:</span>
              <input
                type="text"
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
                placeholder="downloads"
                className="bg-transparent text-white w-24 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* CLI Command Copy preview */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCommand}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition"
              title="Copy corresponding CLI command"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCli ? 'Copied CLI Command!' : 'Copy CLI Command'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Inspection Details Card (When Loaded) */}
      {mediaInfo && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Video Preview & Thumbnail */}
          <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-inner">
                {mediaInfo.previewVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={mediaInfo.previewVideoUrl}
                    controls
                    poster={mediaInfo.thumbnail}
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaInfo.thumbnail}
                    alt={mediaInfo.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[11px] font-medium text-white">
                  {mediaInfo.platform}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white">
                  {mediaInfo.duration}
                </div>
              </div>

              {/* Quick AI Action Buttons on video */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleCaptureFrame}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
                  title="Send current frame to Gemini 3.1 Pro Image Analyzer"
                >
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  <span>Analyze Frame AI</span>
                </button>
                <button
                  onClick={() => onSendToTts(`Now summarizing media content: "${mediaInfo.title}" by ${mediaInfo.author}. High quality media stream parsed successfully.`)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
                  title="Generate audio narration with Gemini 3.8 Flash TTS"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Narrate with TTS</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Channel / Creator:</span>
                <span className="text-white font-medium">{mediaInfo.author}</span>
              </div>
              <div className="flex justify-between">
                <span>Stream Duration:</span>
                <span className="text-white font-mono">{mediaInfo.duration}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stream Format Selector & Download Action */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-2">{mediaInfo.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select streams to download or extract using yt-dlp / FFmpeg pipeline
                  </p>
                </div>
              </div>

              {/* Format Selection List */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Available Streams & Formats:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {mediaInfo.formats
                    .filter((f) => (isAudioOnly ? f.type === 'audio' : true))
                    .map((fmt) => {
                      const isSelected = selectedFormat === fmt.formatId;
                      return (
                        <div
                          key={fmt.formatId}
                          onClick={() => setSelectedFormat(fmt.formatId)}
                          className={`p-3 rounded-xl border cursor-pointer transition text-xs flex flex-col justify-between ${
                            isSelected
                              ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white flex items-center space-x-1.5">
                              {fmt.type === 'audio' ? (
                                <Music className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Film className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              <span>{fmt.resolution}</span>
                            </span>
                            <span className="font-mono text-slate-400 font-bold">{fmt.ext.toUpperCase()}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{fmt.bitrate}</span>
                            <span className="font-mono text-slate-300 font-medium">{fmt.approxSize}</span>
                          </div>
                          {fmt.recommended && (
                            <div className="mt-1 text-[10px] text-emerald-400 font-medium">
                              ★ Recommended
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Saving to: </span>
                <span className="font-mono text-amber-400">{outputDir}/</span>
              </div>
              <button
                onClick={handleTriggerDownload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isAudioOnly ? 'Extract & Download Audio' : 'Download Video Stream'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Downloads & Queue Tracker (Tqdm Style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Download Queue & Manager</h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {downloads.length} total
            </span>
          </div>
        </div>

        {downloads.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
            <Download className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No active or completed downloads</p>
            <p className="text-xs text-slate-500 mt-1">
              Paste a URL above or click one of the quick test samples to start your first download.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map((item) => {
              const isCompleted = item.status === 'completed';
              const isDownloading = item.status === 'downloading';
              const isPaused = item.status === 'paused';

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md transition hover:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    {/* Thumbnail & Title */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="relative w-16 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white">
                          .{item.fileExt}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {item.platform}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{item.totalSize}</span>
                          <span>•</span>
                          <span className="font-mono text-amber-400">{item.outputDir}/</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Action Buttons */}
                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                      {isDownloading && (
                        <button
                          onClick={() => onPauseResumeDownload(item.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {isPaused && (
                        <button
                          onClick={() => onPauseResumeDownload(item.id)}
                          className="p-2 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 transition"
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {isCompleted && (
                        <>
                          <a
                            href={item.downloadUrl || '#'}
                            download={`${item.title}.${item.fileExt}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save to Disk</span>
                          </a>
                          <button
                            onClick={() => onSendToAnalyzer(item.thumbnail)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Analyze thumbnail with Gemini 3.1 Pro"
                          >
                            <Sparkles className="w-4 h-4 text-rose-400" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteDownload(item.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tqdm Progress Bar & Terminal Visualizer */}
                  <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">
                          {isCompleted ? '[✓] Finished' : isPaused ? '[||] Paused' : '[+] Downloading'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {Math.round(item.progress)}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span>Speed: <strong className="text-emerald-400 font-mono">{item.speed}</strong></span>
                        <span>Size: <strong className="text-slate-200">{item.totalSize}</strong></span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isPaused
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-rose-500 to-amber-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>

                    {/* Tqdm Terminal Style Line */}
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-mono">
                          100%|████████████████████| {item.totalSize}/{item.totalSize} [00:04&lt;00:00, {item.speed}]
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">
                          {Math.round(item.progress)}%|{Array(Math.floor(item.progress / 5)).fill('█').join('')}{Array(20 - Math.floor(item.progress / 5)).fill(' ').join('')}| {item.speed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
