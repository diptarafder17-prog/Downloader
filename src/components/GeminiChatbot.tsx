import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Cpu, 
  Zap, 
  Wrench, 
  Video, 
  Archive,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, ChatRole, ChatRoleConfig } from '../types.ts';

const CHAT_ROLES: ChatRoleConfig[] = [
  {
    id: 'engineer',
    name: 'Video Engineer & yt-dlp Guru',
    icon: '🛠️',
    tagline: 'Codecs, FFmpeg pipelines, yt-dlp scraping, and bitrate optimization',
    systemInstruction:
      'You are a senior video systems engineer and yt-dlp core developer. You specialize in stream extraction, container formats (MP4, MKV, WebM), audio transcode pipelines (FFmpegExtractAudio, AAC, Opus, MP3), CLI arguments, error debugging, and hardware encoding.',
  },
  {
    id: 'creator',
    name: 'Content Creator & Scriptwriter',
    icon: '🎬',
    tagline: 'Viral video hooks, titles, SEO tags, and narration scripts',
    systemInstruction:
      'You are a creative director and video growth strategist for YouTube, TikTok, and social media. You help creators write viral video hooks, high-CTR titles, engaging narration scripts, and chapter timestamps.',
  },
  {
    id: 'archivist',
    name: 'Media Archival & Transcoder',
    icon: '📦',
    tagline: 'Lossless audio, H.265/AV1 compression, and media preservation',
    systemInstruction:
      'You are a digital preservationist and media archival engineer. You advise on lossless master storage (FLAC, PCM WAV), modern high-efficiency compression (AV1, HEVC), color spaces, and subtitling standards.',
  },
  {
    id: 'general',
    name: 'General Assistant',
    icon: '💡',
    tagline: 'All-round helper for media, audio, and video workflows',
    systemInstruction:
      'You are an intelligent, friendly AI media assistant capable of answering questions, troubleshooting issues, and guiding users through video and audio workflows.',
  },
];

const MODEL_OPTIONS = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'General Tasks',
    desc: 'Balanced speed and intelligence',
    icon: Zap,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'Complex Reasoning',
    desc: 'Deep logic, script analysis, and code synthesis',
    icon: Cpu,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast',
    desc: 'Lowest latency for instant replies',
    icon: Sparkles,
  },
];

export const GeminiChatbot: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>('engineer');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Hello! I am your AI Video & Media Engineer. I can help you craft custom yt-dlp extraction commands, write FFmpeg pipelines, optimize audio bitrates, or script voiceovers for your media projects. How can I help you today?',
      timestamp: Date.now(),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const currentRoleConfig = CHAT_ROLES.find((r) => r.id === selectedRole) || CHAT_ROLES[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation history + chosen role's system instruction + chosen model
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          systemInstruction: currentRoleConfig.systemInstruction,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Chat request failed.');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: Date.now(),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Error: ${err.message || 'Unable to connect to the Gemini model. Please verify your connection.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        content: `Switched context to ${currentRoleConfig.name}. How can I assist with your media workflow?`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      },
    ]);
  };

  const starterQuestions: Record<ChatRole, string[]> = {
    engineer: [
      'How do I extract only audio in 320kbps MP3 using yt-dlp and ffmpeg?',
      'Explain the difference between bestvideo+bestaudio and /best in yt-dlp',
      'How does TqdmProgressHook calculate real-time download speed in Python?',
    ],
    creator: [
      'Generate 5 viral YouTube titles for a video about AI media tools',
      'Write a punchy 30-second script hook with vocal bursts for TTS',
      'What are the best thumbnail design principles for high CTR?',
    ],
    archivist: [
      'Should I store masters in FLAC or uncompressed WAV?',
      'What is the optimal AV1 preset for preserving 1080p video archives?',
      'How do I embed metadata and chapter markers into an MP4 container?',
    ],
    general: [
      'What formats does StreamForge support?',
      'How do I run main.py on Windows vs macOS?',
      'Summarize best practices for video downloads and speech synthesis',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header: Role + Model Selectors */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <MessageSquareCode className="w-4 h-4" />
              <span>Multi-Turn Gemini Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Video & Media Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Role: <strong className="text-slate-200">{currentRoleConfig.name}</strong> • Powered by Gemini
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            {MODEL_OPTIONS.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={m.desc}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.name.split(' ')[1]} {m.name.split(' ')[2] || ''}</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">({m.badge.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Roles Selector Chips */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Specialist Role:</span>
          {CHAT_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                handleClearChat();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                selectedRole === role.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{role.icon}</span>
              <span>{role.name}</span>
            </button>
          ))}

          <button
            onClick={handleClearChat}
            className="ml-auto text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 px-2 py-1"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
        {/* Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white'
                      : 'bg-gradient-to-tr from-indigo-600 to-rose-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-[10px] text-slate-400">
                      <span className="font-mono text-indigo-400">
                        {msg.modelUsed || selectedModel}
                      </span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>Generating thoughtful response with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Questions */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">Suggested:</span>
          {starterQuestions[selectedRole].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Ask ${currentRoleConfig.name}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
