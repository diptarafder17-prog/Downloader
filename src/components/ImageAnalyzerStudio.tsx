import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Copy, 
  Check, 
  Eye, 
  Sliders, 
  Film, 
  Layers, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { ImageAnalysisRecord } from '../types.ts';
import { SAMPLE_VIDEOS } from '../data/pythonRepoData.ts';

interface ImageAnalyzerStudioProps {
  initialImageUrl?: string;
  onClearInitialImage?: () => void;
}

export const ImageAnalyzerStudio: React.FC<ImageAnalyzerStudioProps> = ({
  initialImageUrl = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    initialImageUrl ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'
  );
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analysisType, setAnalysisType] = useState<'thumbnail_ctr' | 'scene_breakdown' | 'ocr_text' | 'custom'>('thumbnail_ctr');
  const [customPrompt, setCustomPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ImageAnalysisRecord[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setAnalysisResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      let promptToSend = customPrompt;
      if (analysisType === 'thumbnail_ctr') {
        promptToSend = `You are a world-class YouTube & video packaging strategist. Analyze this video thumbnail in rigorous detail for Click-Through Rate (CTR):
1. Visual Hook & Focal Point: What captures attention first? Is there a clear subject?
2. Mobile Legibility: Will this thumbnail stand out at 150px width on smartphones?
3. Color & Contrast Dynamics: How effectively do the colors pop against dark/light platforms?
4. Text & Typography (if present): Is the font crisp and punchy?
5. Strategic Improvements: Give 3 specific, actionable recommendations to maximize CTR.`;
      } else if (analysisType === 'scene_breakdown') {
        promptToSend = `Perform a cinematic video frame breakdown:
1. Scene composition and framing rule (rule of thirds, center-weighted, golden ratio).
2. Lighting atmosphere, color temperature, and grading.
3. Camera angle, lens perspective, and depth of field.
4. Mood, emotional tone, and narrative context.
5. Overall aesthetic production score out of 10.`;
      } else if (analysisType === 'ocr_text') {
        promptToSend = `Extract all visible text, logos, badges, watermarks, timestamps, and graphic overlays in this image. For each text element found, assess font style, legibility, and contrast against the background.`;
      }

      // Convert image to base64 if it's a remote URL
      let base64Data = selectedImage;
      if (selectedImage.startsWith('http://') || selectedImage.startsWith('https://')) {
        const fetchRes = await fetch(selectedImage);
        const blob = await fetchRes.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
          prompt: promptToSend,
          analysisType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze image with gemini-3.1-pro-preview.');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);

      setHistory((prev) => [
        {
          id: `ana-${Date.now()}`,
          imageUrl: selectedImage,
          analysis: data.analysis,
          analysisType,
          prompt: promptToSend,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Image analysis encountered an error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vision Engine: gemini-3.1-pro-preview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Video Frame & Thumbnail Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload any image, inspect extracted video frames, or audit thumbnails for Click-Through Rate (CTR), composition, lighting, and typography using Gemini 3.1 Pro Preview.
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selection & Config */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Visual Subject / Frame
              </span>
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group shadow-inner">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected for analysis"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-center text-slate-500 p-6">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">Select or upload an image</p>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Or pick from sample video frames:</span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_VIDEOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedImage(s.thumbnail);
                      setAnalysisResult(null);
                    }}
                    className={`relative rounded-lg overflow-hidden border aspect-video transition ${
                      selectedImage === s.thumbnail ? 'ring-2 ring-rose-500 border-rose-500' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Analysis Mode:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setAnalysisType('thumbnail_ctr')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                    analysisType === 'thumbnail_ctr'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 mb-1 text-rose-400" />
                  <div className="font-semibold text-white">Thumbnail CTR</div>
                  <div className="text-[10px] text-slate-400">Clickability audit</div>
                </button>

                <button
                  onClick={() => setAnalysisType('scene_breakdown')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                    analysisType === 'scene_breakdown'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 mb-1 text-amber-400" />
                  <div className="font-semibold text-white">Scene Frame</div>
                  <div className="text-[10px] text-slate-400">Lighting & angles</div>
                </button>

                <button
                  onClick={() => setAnalysisType('ocr_text')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                    analysisType === 'ocr_text'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 mb-1 text-indigo-400" />
                  <div className="font-semibold text-white">OCR & Badges</div>
                  <div className="text-[10px] text-slate-400">Text legibility</div>
                </button>
              </div>

              {analysisType === 'custom' && (
                <div className="mt-2">
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter custom query for Gemini 3.1 Pro Preview..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !selectedImage}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with gemini-3.1-pro-preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Vision Intelligence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Findings & Report Card */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-white">Vision Inspection Report</span>
              </div>
              {analysisResult && (
                <button
                  onClick={handleCopyAnalysis}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
              )}
            </div>

            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-sm font-medium text-slate-200">
                  Gemini 3.1 Pro Preview is inspecting pixels, composition, and contrast...
                </p>
                <p className="text-xs text-slate-500">Multimodal reasoning in progress</p>
              </div>
            ) : analysisResult ? (
              <div className="mt-4 flex-1 prose prose-invert prose-sm max-w-none text-slate-200 space-y-3 whitespace-pre-wrap leading-relaxed font-sans">
                {analysisResult}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
                <Eye className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm text-slate-400 font-medium">Ready for Visual Audit</p>
                <p className="text-xs text-slate-600 max-w-xs">
                  Select an image or frame on the left and click "Run Vision Intelligence" to get a detailed breakdown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
