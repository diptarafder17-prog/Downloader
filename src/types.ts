export interface MediaFormat {
  formatId: string;
  ext: string;
  resolution: string;
  fps: number | null;
  vcodec: string;
  acodec: string;
  bitrate: string;
  approxSize: string;
  type: 'video' | 'audio';
  label: string;
  recommended?: boolean;
}

export interface MediaInspectResult {
  url: string;
  title: string;
  author: string;
  platform: string;
  duration: string;
  durationSec: number;
  thumbnail: string;
  previewVideoUrl: string;
  formats: MediaFormat[];
}

export interface DownloadItem {
  id: string;
  title: string;
  platform: string;
  url: string;
  thumbnail: string;
  fileExt: string;
  formatId: string;
  isAudioOnly: boolean;
  outputDir: string;
  totalSize: string;
  downloadedBytes: number;
  totalBytes: number;
  speed: string;
  progress: number; // 0 to 100
  status: 'queued' | 'downloading' | 'completed' | 'paused' | 'failed';
  downloadUrl?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export type ChatRole = 'engineer' | 'creator' | 'archivist' | 'general';

export interface ChatRoleConfig {
  id: ChatRole;
  name: string;
  icon: string;
  tagline: string;
  systemInstruction: string;
}

export interface GeneratedSpeechItem {
  id: string;
  text: string;
  audioBase64: string;
  mimeType: string;
  voiceName: string;
  style: string;
  timestamp: number;
  isMultiSpeaker?: boolean;
  speaker1?: string;
  speaker2?: string;
}

export interface ImageAnalysisRecord {
  id: string;
  imageUrl: string;
  analysis: string;
  analysisType: string;
  prompt: string;
  timestamp: number;
}
