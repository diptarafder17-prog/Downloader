import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar.tsx';
import { DownloaderStudio } from './components/DownloaderStudio.tsx';
import { PythonCliLab } from './components/PythonCliLab.tsx';
import { TtsStudio } from './components/TtsStudio.tsx';
import { ImageAnalyzerStudio } from './components/ImageAnalyzerStudio.tsx';
import { GeminiChatbot } from './components/GeminiChatbot.tsx';
import { DownloadItem } from './types.ts';
import { SAMPLE_VIDEOS } from './data/pythonRepoData.ts';
import { Film, ShieldCheck, Heart, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('downloader');

  // Shared state across tabs
  const [targetTtsText, setTargetTtsText] = useState<string>('');
  const [targetImageUrl, setTargetImageUrl] = useState<string>('');

  // Initial downloads list with sample items
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: 'dl-seed-1',
      title: 'Big Buck Bunny (Open Source 4K CGI Film)',
      platform: 'Blender Open Movie',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      fileExt: 'mp4',
      formatId: 'bestvideo+bestaudio/best',
      isAudioOnly: false,
      outputDir: 'downloads',
      totalSize: '48.2 MB',
      downloadedBytes: 48200000,
      totalBytes: 48200000,
      speed: '14.8 MB/s',
      progress: 100,
      status: 'completed',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      timestamp: Date.now() - 360000,
    },
    {
      id: 'dl-seed-2',
      title: 'Cinematic Nature Showcase: The Architecture of Light',
      platform: 'Vimeo Open Project',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      fileExt: 'mp3',
      formatId: 'bestaudio-mp3-192',
      isAudioOnly: true,
      outputDir: 'podcasts',
      totalSize: '6.4 MB',
      downloadedBytes: 6400000,
      totalBytes: 6400000,
      speed: '8.2 MB/s',
      progress: 100,
      status: 'completed',
      downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      timestamp: Date.now() - 120000,
    },
  ]);

  // Handle cross-navigation
  const handleSendToAnalyzer = (imageUrl: string) => {
    setTargetImageUrl(imageUrl);
    setActiveTab('image-analyzer');
  };

  const handleSendToTts = (text: string) => {
    setTargetTtsText(text);
    setActiveTab('tts');
  };

  // Add new download
  const handleStartDownload = (
    itemData: Omit<DownloadItem, 'id' | 'timestamp' | 'progress' | 'downloadedBytes' | 'totalBytes' | 'speed' | 'status'>
  ) => {
    const newId = `dl-${Date.now()}`;
    const totalBytes = 48 * 1024 * 1024;
    const newItem: DownloadItem = {
      ...itemData,
      id: newId,
      progress: 0,
      downloadedBytes: 0,
      totalBytes,
      speed: '12.4 MB/s',
      status: 'downloading',
      timestamp: Date.now(),
    };

    setDownloads((prev) => [newItem, ...prev]);

    // Simulate realistic progress updates
    let currProgress = 0;
    const timer = setInterval(() => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id === newId) {
            if (item.status === 'paused') return item;
            currProgress += Math.floor(Math.random() * 8) + 6;
            if (currProgress >= 100) {
              clearInterval(timer);
              return {
                ...item,
                progress: 100,
                status: 'completed',
                downloadedBytes: totalBytes,
                speed: '15.2 MB/s',
              };
            }
            const currentSpeed = `${(10 + Math.random() * 6).toFixed(1)} MB/s`;
            return {
              ...item,
              progress: currProgress,
              downloadedBytes: Math.floor((currProgress / 100) * totalBytes),
              speed: currentSpeed,
            };
          }
          return item;
        })
      );
    }, 400);
  };

  const handlePauseResume = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'downloading' ? 'paused' : 'downloading';
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleCancelDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeDownloadsCount={activeDownloadsCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'downloader' && (
          <DownloaderStudio
            downloads={downloads}
            onStartDownload={handleStartDownload}
            onPauseResumeDownload={handlePauseResume}
            onCancelDownload={handleCancelDownload}
            onDeleteDownload={handleDeleteDownload}
            onSendToAnalyzer={handleSendToAnalyzer}
            onSendToTts={handleSendToTts}
          />
        )}

        {activeTab === 'python-cli' && <PythonCliLab />}

        {activeTab === 'tts' && (
          <TtsStudio
            initialText={targetTtsText}
            onClearInitialText={() => setTargetTtsText('')}
          />
        )}

        {activeTab === 'image-analyzer' && (
          <ImageAnalyzerStudio
            initialImageUrl={targetImageUrl}
            onClearInitialImage={() => setTargetImageUrl('')}
          />
        )}

        {activeTab === 'chatbot' && <GeminiChatbot />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-300">StreamForge Studio</span>
            <span>• Universal Video & Audio Downloader + Gemini AI</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full-Stack Verified</span>
            </span>
            <span className="flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>yt-dlp + FFmpeg</span>
            </span>
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>gemini-3.8-flash-tts & 3.1-pro</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
