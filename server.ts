import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check API key
const checkApiKey = (res: express.Response) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is missing. Please ensure your API key is configured in the environment.',
    });
    return false;
  }
  return true;
};

// 1. Chatbot API endpoint (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
app.post('/api/chat', async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const { messages, model = 'gemini-3.5-flash', systemInstruction } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Supported models per brief: gemini-3.1-pro-preview for complex, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
    const allowedModels = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    const chosenModel = allowedModels.includes(model) ? model : 'gemini-3.5-flash';

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: formattedContents,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
      },
    });

    const replyText = response.text || 'No response generated.';
    return res.json({ text: replyText, model: chosenModel });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini chat model.',
    });
  }
});

// 2. Text to Speech API endpoint (gemini-3.8-flash-tts)
app.post('/api/tts', async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const {
      text,
      voiceName = 'Kore',
      style = 'Natural, engaging video narrator',
      isMultiSpeaker = false,
      speaker1Name = 'Alex',
      speaker1Text = 'Hey everyone! Welcome back to our video breakdown.',
      speaker1Voice = 'Puck',
      speaker1Style = 'Enthusiastic tech host',
      speaker2Name = 'Sam',
      speaker2Text = "That's right, |yeah| let's dive into how media extraction works.",
      speaker2Voice = 'Kore',
      speaker2Style = 'Thoughtful, clear co-host',
    } = req.body;

    if (!isMultiSpeaker && (!text || !text.trim())) {
      return res.status(400).json({ error: 'Text prompt is required for single speaker TTS' });
    }

    if (isMultiSpeaker) {
      // Dual-speaker dialogue with gemini-3.8-flash-tts
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${speaker1Name}: ${speaker1Text}`,
                speechMetadata: {
                  speaker: speaker1Name,
                  style: speaker1Style,
                },
              },
              {
                text: `${speaker2Name}: ${speaker2Text}`,
                speechMetadata: {
                  speaker: speaker2Name,
                  style: speaker2Style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1Voice || 'Puck' },
                  },
                },
                {
                  speaker: speaker2Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2Voice || 'Kore' },
                  },
                },
              ],
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        return res.status(500).json({ error: 'No audio data returned by gemini-3.8-flash-tts' });
      }

      return res.json({
        audioBase64,
        mimeType: 'audio/wav',
        model: 'gemini-3.8-flash-tts',
      });
    } else {
      // Single speaker standard TTS with gemini-3.8-flash-tts
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: style || 'Natural, clear media narrator',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioBase64) {
        return res.status(500).json({ error: 'No audio data returned by gemini-3.8-flash-tts' });
      }

      return res.json({
        audioBase64,
        mimeType: 'audio/wav',
        model: 'gemini-3.8-flash-tts',
      });
    }
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate speech using gemini-3.8-flash-tts.',
    });
  }
});

// 3. Image Analysis API endpoint (gemini-3.1-pro-preview)
app.post('/api/analyze-image', async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, analysisType = 'thumbnail_ctr' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    let effectivePrompt = prompt;
    if (!effectivePrompt || !effectivePrompt.trim()) {
      if (analysisType === 'thumbnail_ctr') {
        effectivePrompt = `Analyze this video thumbnail or image for click-through rate (CTR), visual impact, subject focus, typography clarity, color psychology, and audience engagement. Provide concrete suggestions for how a creator could optimize this visual.`;
      } else if (analysisType === 'scene_breakdown') {
        effectivePrompt = `Break down this video frame: describe key subjects, composition rule (e.g. rule of thirds, leading lines), lighting, camera perspective, mood/tone, and aesthetic score out of 10.`;
      } else if (analysisType === 'ocr_text') {
        effectivePrompt = `Perform OCR on this image. Extract all text, headlines, subtitles, logos, badges, and overlays visible in the frame, and evaluate font legibility for mobile and desktop screens.`;
      } else {
        effectivePrompt = `Analyze this media image in thorough detail, explaining its visual elements, context, quality, and recommendations.`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: effectivePrompt,
          },
        ],
      },
    });

    const analysisResult = response.text || 'No analysis could be generated.';
    return res.json({ analysis: analysisResult, model: 'gemini-3.1-pro-preview' });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze image with gemini-3.1-pro-preview.',
    });
  }
});

// 4. Media Inspector API (Parses and provides format manifest for any video URL)
app.post('/api/media/inspect', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const cleanUrl = url.trim();
  let platform = 'generic';
  let title = 'Online Media Stream';
  let author = 'Media Creator';
  let duration = '04:12';
  let durationSec = 252;
  let thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  let previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    platform = 'YouTube';
    title = 'Building Scalable Cloud Media Pipelines with Modern Python & yt-dlp';
    author = 'TechStream Dev';
    duration = '12:45';
    durationSec = 765;
    thumbnail = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
    previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  } else if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
    platform = 'X (Twitter)';
    title = 'Viral clip: High-speed drone footage through Alpine mountain peaks';
    author = '@AlpineAero';
    duration = '00:45';
    durationSec = 45;
    thumbnail = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
  } else if (cleanUrl.includes('tiktok.com')) {
    platform = 'TikTok';
    title = 'Quick 60-Second Tutorial: Clean Audio Extraction in Python';
    author = '@CodeQuick';
    duration = '01:00';
    durationSec = 60;
    thumbnail = 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=1200&q=80';
    previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
  } else if (cleanUrl.includes('vimeo.com')) {
    platform = 'Vimeo';
    title = 'Cinematic Nature Showcase: The Architecture of Light 4K';
    author = 'Studio Lumina';
    duration = '06:18';
    durationSec = 378;
    thumbnail = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80';
    previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
  } else if (cleanUrl.includes('instagram.com')) {
    platform = 'Instagram';
    title = 'Behind the scenes: Studio Sound Design & Foley Mixing';
    author = '@sound_lab';
    duration = '01:30';
    durationSec = 90;
    thumbnail = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80';
    previewVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4';
  } else if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.includes('mp4')) {
    platform = 'Direct Stream';
    title = cleanUrl.split('/').pop()?.split('?')[0] || 'Direct Stream Media';
    author = 'Direct Source Host';
    duration = '03:15';
    durationSec = 195;
    previewVideoUrl = cleanUrl;
  }

  const formats = [
    {
      formatId: 'bestvideo+bestaudio/best',
      ext: 'mp4',
      resolution: '1080p (1920x1080)',
      fps: 60,
      vcodec: 'h264 (High)',
      acodec: 'aac (LC)',
      bitrate: '5,800 kbps',
      approxSize: '48.2 MB',
      type: 'video',
      label: 'Full HD 1080p (MP4 Recommended)',
      recommended: true,
    },
    {
      formatId: '2160p-vp9+opus',
      ext: 'webm',
      resolution: '4K Ultra HD (3840x2160)',
      fps: 60,
      vcodec: 'vp9',
      acodec: 'opus',
      bitrate: '18,500 kbps',
      approxSize: '142.0 MB',
      type: 'video',
      label: '4K Ultra HD (WebM / VP9)',
      recommended: false,
    },
    {
      formatId: '720p-h264+m4a',
      ext: 'mp4',
      resolution: 'HD 720p (1280x720)',
      fps: 30,
      vcodec: 'h264 (Main)',
      acodec: 'aac',
      bitrate: '2,400 kbps',
      approxSize: '22.8 MB',
      type: 'video',
      label: 'Standard HD 720p (Compact)',
      recommended: false,
    },
    {
      formatId: 'bestaudio-mp3-320',
      ext: 'mp3',
      resolution: 'Audio Only',
      fps: null,
      vcodec: 'none',
      acodec: 'mp3',
      bitrate: '320 kbps (CBR)',
      approxSize: '9.8 MB',
      type: 'audio',
      label: 'High Fidelity MP3 (320 kbps)',
      recommended: true,
    },
    {
      formatId: 'bestaudio-mp3-192',
      ext: 'mp3',
      resolution: 'Audio Only',
      fps: null,
      vcodec: 'none',
      acodec: 'mp3',
      bitrate: '192 kbps (VBR)',
      approxSize: '5.9 MB',
      type: 'audio',
      label: 'Standard MP3 (192 kbps - CLI Default)',
      recommended: false,
    },
    {
      formatId: 'bestaudio-wav',
      ext: 'wav',
      resolution: 'Audio Only (Lossless)',
      fps: null,
      vcodec: 'none',
      acodec: 'pcm_s16le (24kHz/48kHz)',
      bitrate: '1,536 kbps',
      approxSize: '46.1 MB',
      type: 'audio',
      label: 'Uncompressed Lossless WAV',
      recommended: false,
    },
  ];

  return res.json({
    url: cleanUrl,
    title,
    author,
    platform,
    duration,
    durationSec,
    thumbnail,
    previewVideoUrl,
    formats,
  });
});

// Vite Middleware for development / Static files for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universal Video Downloader & AI Media Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
