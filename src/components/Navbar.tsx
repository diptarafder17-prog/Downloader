import React from 'react';
import { 
  Download, 
  Terminal, 
  Volume2, 
  Sparkles, 
  MessageSquareCode, 
  Film,
  Zap
} from 'lucide-react';

export type NavTab = 'downloader' | 'python-cli' | 'tts' | 'image-analyzer' | 'chatbot';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeDownloadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeDownloadsCount,
}) => {
  const tabs = [
    {
      id: 'downloader' as NavTab,
      label: 'Downloader Studio',
      icon: Download,
      badge: activeDownloadsCount > 0 ? `${activeDownloadsCount} active` : null,
    },
    {
      id: 'python-cli' as NavTab,
      label: 'Python CLI Lab',
      icon: Terminal,
    },
    {
      id: 'tts' as NavTab,
      label: 'TTS Studio',
      icon: Volume2,
      modelBadge: 'gemini-3.8-flash-tts',
    },
    {
      id: 'image-analyzer' as NavTab,
      label: 'Frame & Thumbnail AI',
      icon: Sparkles,
      modelBadge: 'gemini-3.1-pro',
    },
    {
      id: 'chatbot' as NavTab,
      label: 'Gemini Assistant',
      icon: MessageSquareCode,
      modelBadge: 'Multi-Role',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('downloader')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">StreamForge</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  yt-dlp + Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Universal Media & Intelligence Suite</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {tab.modelBadge && (
                    <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 font-mono hidden xl:inline">
                      {tab.modelBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Engine Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[11px] text-slate-300">Engine Active</span>
              <Zap className="w-3.5 h-3.5 text-amber-400 ml-1" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-900/50 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
