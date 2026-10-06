import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Play, 
  RotateCcw,
  Sparkles,
  BookOpen,
  FolderGit2
} from 'lucide-react';
import { PYTHON_REPO_FILES, RepoFile, SAMPLE_VIDEOS } from '../data/pythonRepoData.ts';

export const PythonCliLab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(PYTHON_REPO_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'code'>('terminal');

  // Terminal state
  const [commandInput, setCommandInput] = useState('python main.py "https://www.youtube.com/watch?v=BigBuckBunny" -a -o downloads');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'StreamForge Universal Video Downloader [Python 3.11 Runtime]',
    'Loaded yt-dlp version 2024.08.06 & tqdm 4.66.4',
    'Type a command below or select an example to run the CLI script.',
    '',
  ]);
  const [tqdmProgress, setTqdmProgress] = useState<number | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFile = (file: RepoFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunCommand = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTqdmProgress(0);

    const cmd = commandInput.trim();
    setTerminalLogs((prev) => [
      ...prev,
      `$ ${cmd}`,
      '[+] Initializing yt-dlp options and TqdmProgressHook...',
      '[+] Fetching media information & resolving formats...',
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTqdmProgress(100);
        setIsRunning(false);
        const isAudio = cmd.includes('-a') || cmd.includes('--audio');
        const outputDir = cmd.match(/-o\s+([^\s]+)/)?.[1] || 'downloads';

        setTimeout(() => {
          setTerminalLogs((prev) => [
            ...prev,
            isAudio
              ? `[+] Postprocessing: FFmpegExtractAudio -> preferredcodec: mp3, quality: 192k`
              : `[+] Postprocessing: Merging bestvideo+bestaudio -> mp4 container`,
            `[✓] Download complete! Saved to '${outputDir}' directory.`,
            '',
          ]);
          setTqdmProgress(null);
        }, 500);
      } else {
        setTqdmProgress(progress);
      }
    }, 280);
  };

  const handleClearTerminal = () => {
    setTerminalLogs([
      'StreamForge Universal Video Downloader [Python 3.11 Runtime]',
      'Terminal reset. Ready for next command.',
      '',
    ]);
    setTqdmProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Python yt-dlp & tqdm Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Universal CLI & Python Source Code
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore the exact Python codebase (`main.py`, `requirements.txt`, `README.md`) and run simulated CLI executions in the virtual terminal.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'terminal'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Terminal Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'code'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Source Code Explorer</span>
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        /* Terminal View */
        <div className="space-y-4">
          {/* Quick command buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Command Presets:</span>
            <button
              onClick={() => setCommandInput('python main.py "https://www.youtube.com/watch?v=Sintel"')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition font-mono"
            >
              MP4 Best Video
            </button>
            <button
              onClick={() => setCommandInput('python main.py "https://www.youtube.com/watch?v=BigBuckBunny" -a')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition font-mono"
            >
              -a (Extract MP3 192k)
            </button>
            <button
              onClick={() => setCommandInput('python main.py "https://vimeo.com/TearsOfSteel" -o "my_vfx_archive"')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition font-mono"
            >
              -o custom_dir
            </button>
          </div>

          {/* Terminal Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-xs text-slate-400 ml-2">bash - StreamForge Virtual CLI</span>
              </div>
              <button
                onClick={handleClearTerminal}
                className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                title="Reset terminal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Terminal Screen */}
            <div className="p-4 sm:p-6 min-h-[320px] max-h-[460px] overflow-y-auto text-xs sm:text-sm text-slate-200 space-y-1">
              {terminalLogs.map((log, index) => {
                const isCmd = log.startsWith('$');
                const isSuccess = log.includes('[✓]');
                const isHook = log.includes('[+]');
                return (
                  <div
                    key={index}
                    className={`${
                      isCmd
                        ? 'text-emerald-400 font-bold'
                        : isSuccess
                        ? 'text-emerald-300'
                        : isHook
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}

              {/* Live tqdm progress visualization if running */}
              {tqdmProgress !== null && (
                <div className="py-2 text-amber-300 font-mono">
                  <div>
                    Downloading: {tqdmProgress}%|
                    {Array(Math.floor(tqdmProgress / 5)).fill('█').join('')}
                    {Array(20 - Math.floor(tqdmProgress / 5)).fill(' ').join('')}|{' '}
                    {Math.round((tqdmProgress / 100) * 48.2 * 10) / 10}M/48.2M [00:03&lt;00:00, 14.8MB/s]
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <span className="text-emerald-400 font-bold pl-2">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
                disabled={isRunning}
                placeholder="python main.py <url> [-a] [-o dir]"
                className="flex-1 bg-transparent text-white text-xs sm:text-sm focus:outline-none font-mono"
              />
              <button
                onClick={handleRunCommand}
                disabled={isRunning || !commandInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Source Code Explorer View */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* File Selector Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Repository Files (video-downloader/)
            </div>
            {PYTHON_REPO_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/80 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      <span>{file.name}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {file.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{file.description}</p>
                </div>
              );
            })}

            <div className="pt-3">
              <button
                onClick={() => {
                  PYTHON_REPO_FILES.forEach((f) => handleDownloadFile(f));
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download All Files</span>
              </button>
            </div>
          </div>

          {/* File Code Display */}
          <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-rose-400" />
                <span>{selectedFile.path}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <pre className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 leading-relaxed bg-slate-950 max-h-[550px] overflow-y-auto">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
