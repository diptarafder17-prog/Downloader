import React, { useState } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Users, 
  User, 
  Loader2, 
  Music, 
  RotateCcw,
  Sliders,
  Check,
  Radio
} from 'lucide-react';
import { GeneratedSpeechItem } from '../types.ts';

interface TtsStudioProps {
  initialText?: string;
  onClearInitialText?: () => void;
}

export const TtsStudio: React.FC<TtsStudioProps> = ({ initialText = '' }) => {
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);

  // Single speaker state
  const [textInput, setTextInput] = useState(
    initialText ||
      'Welcome back to our channel! In today\'s deep dive, we are breaking down the internal mechanics of media extraction and streaming codecs.'
  );
  const [voiceName, setVoiceName] = useState('Kore');
  const [voiceStyle, setVoiceStyle] = useState('Energetic, clear documentary narrator');

  // Multi speaker state (Voice Design & Backchanneling with gemini-3.8-flash-tts)
  const [s1Name, setS1Name] = useState('Alex');
  const [s1Voice, setS1Voice] = useState('Puck');
  const [s1Style, setS1Style] = useState('Enthusiastic podcast host');
  const [s1Text, setS1Text] = useState('Alex: Welcome back! <breath> Today we are diving into video codecs and audio extraction.');

  const [s2Name, setS2Name] = useState('Sam');
  const [s2Voice, setS2Voice] = useState('Kore');
  const [s2Style, setS2Style] = useState('Curious, articulate co-host');
  const [s2Text, setS2Text] = useState("Sam: That's right, |yeah| it has been a huge week for media streaming models. <laugh>");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedSpeechItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);

  const availableVoices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

  const quickBursts = ['<breath>', '<laugh>', '<gasp>', '|yeah|', '|mhm|', '|right|'];

  const handleInsertBurst = (burst: string) => {
    if (isMultiSpeaker) {
      setS2Text((prev) => prev + ' ' + burst);
    } else {
      setTextInput((prev) => prev + ' ' + burst);
    }
  };

  const handleGenerateSpeech = async () => {
    setGenerating(true);
    setErrorMsg(null);

    try {
      const payload = isMultiSpeaker
        ? {
            isMultiSpeaker: true,
            speaker1Name: s1Name,
            speaker1Text: s1Text,
            speaker1Voice: s1Voice,
            speaker1Style: s1Style,
            speaker2Name: s2Name,
            speaker2Text: s2Text,
            speaker2Voice: s2Voice,
            speaker2Style: s2Style,
          }
        : {
            isMultiSpeaker: false,
            text: textInput,
            voiceName,
            style: voiceStyle,
          };

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Speech generation failed.');
      }

      const result = await res.json();
      if (!result.audioBase64) {
        throw new Error('No audio returned by server.');
      }

      // Format as playable data URL (unary complete WAV)
      const wavUrl = `data:audio/wav;base64,${result.audioBase64}`;
      setCurrentAudioUrl(wavUrl);
      setIsPlaying(true);

      // Add to history
      const newItem: GeneratedSpeechItem = {
        id: `tts-${Date.now()}`,
        text: isMultiSpeaker ? `${s1Text} | ${s2Text}` : textInput,
        audioBase64: result.audioBase64,
        mimeType: 'audio/wav',
        voiceName: isMultiSpeaker ? `${s1Voice} & ${s2Voice}` : voiceName,
        style: isMultiSpeaker ? 'Dual-Speaker Dialogue' : voiceStyle,
        timestamp: Date.now(),
        isMultiSpeaker,
        speaker1: s1Name,
        speaker2: s2Name,
      };
      setHistory((prev) => [newItem, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred during speech synthesis.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Voice Model: gemini-3.8-flash-tts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Voiceover & Speech Synthesis Studio
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Turn video descriptions, transcripts, or custom screenplays into high-fidelity speech with voice personas, natural backchanneling, and vocal burst tags.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setIsMultiSpeaker(false)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                !isMultiSpeaker
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Single Narrator</span>
            </button>
            <button
              onClick={() => setIsMultiSpeaker(true)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                isMultiSpeaker
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dual Podcast Host</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Editor & Voice Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Tag Inserter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center">
                <Radio className="w-3 h-3 text-indigo-400 mr-1" />
                Vocal Bursts:
              </span>
              {quickBursts.map((b) => (
                <button
                  key={b}
                  onClick={() => handleInsertBurst(b)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition"
                  title={`Insert ${b} into script`}
                >
                  {b}
                </button>
              ))}
            </div>

            {!isMultiSpeaker ? (
              /* Single Speaker Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Narration Script / Video Text
                  </label>
                  <textarea
                    rows={5}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter narration text for your video or media..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Prebuilt Voice Persona
                    </label>
                    <select
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      {availableVoices.map((v) => (
                        <option key={v} value={v}>
                          {v} {v === 'Kore' ? '(Clear & Articulate)' : v === 'Puck' ? '(Energetic)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Voice Tone & Style
                    </label>
                    <input
                      type="text"
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value)}
                      placeholder="e.g. Crisp podcast narrator, relaxed..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Dual Speaker Dialogue Form */
              <div className="space-y-4">
                {/* Speaker 1 */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Speaker 1 (Lead Host)
                    </span>
                    <select
                      value={s1Voice}
                      onChange={(e) => setS1Voice(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-white text-xs px-2 py-1 rounded"
                    >
                      {availableVoices.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={s1Text}
                    onChange={(e) => setS1Text(e.target.value)}
                    placeholder="Alex: What's up everyone!"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs"
                  />
                </div>

                {/* Speaker 2 */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Speaker 2 (Co-Host)
                    </span>
                    <select
                      value={s2Voice}
                      onChange={(e) => setS2Voice(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-white text-xs px-2 py-1 rounded"
                    >
                      {availableVoices.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={s2Text}
                    onChange={(e) => setS2Text(e.target.value)}
                    placeholder="Sam: |yeah| super excited to be here! <laugh>"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateSpeech}
              disabled={generating || (!isMultiSpeaker && !textInput.trim())}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Audio (gemini-3.8-flash-tts)...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Generate WAV Speech</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Audio Playback & History */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Audio Player Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Music className="w-4 h-4 text-indigo-400" />
                  <span>Master Audio Output (24kHz WAV)</span>
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  RIFF WAV
                </span>
              </div>

              {currentAudioUrl ? (
                <div className="mt-5 space-y-4">
                  {/* Visualizer animation bar */}
                  <div className="h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center px-4 space-x-1 overflow-hidden">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 bg-gradient-to-t from-indigo-500 to-rose-500 rounded-full transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : 'h-3 opacity-30'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.sin(i * 0.5) * 20 + 26}px` : '10px',
                          animationDelay: `${i * 40}ms`,
                        }}
                      ></span>
                    ))}
                  </div>

                  {/* Native HTML5 Audio */}
                  <audio
                    src={currentAudioUrl}
                    controls
                    autoPlay
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-10 accent-indigo-500"
                  />

                  {/* Playback speed selector */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Speed:</span>
                    <div className="flex items-center space-x-1">
                      {[0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => {
                            setAudioSpeed(speed);
                            const audios = document.querySelectorAll('audio');
                            audios.forEach((a) => (a.playbackRate = speed));
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            audioSpeed === speed
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Download Audio File */}
                  <div className="pt-2">
                    <a
                      href={currentAudioUrl}
                      download={`gemini_speech_${Date.now()}.wav`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Uncompressed WAV</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Volume2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium">No audio generated yet</p>
                  <p className="text-[11px] text-slate-600">
                    Click "Generate WAV Speech" above to invoke gemini-3.8-flash-tts
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Generated Audio Clips ({history.length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-indigo-400">{item.voiceName}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-2">{item.text}</p>
                    <audio
                      src={`data:audio/wav;base64,${item.audioBase64}`}
                      controls
                      className="w-full h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
