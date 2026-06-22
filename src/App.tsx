import React, { useState, useEffect, useRef } from "react";
import {
  Music,
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  Trash2,
  Heart,
  Sliders,
  AlertTriangle,
  Check,
  Share2,
  FileAudio,
  Activity,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Clock,
  Video,
  Database
} from "lucide-react";
import { MusicParams, Track, UseCase } from "./types";
import { USE_CASE_PRESETS, PROMPT_ASSIST_SUGGESTIONS } from "./presets";
import { ProceduralSynth } from "./proceduralSynth";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { PromptEngineer } from "./components/PromptEngineer";
import { TrackItem } from "./components/TrackItem";

export default function App() {
  // --- STATE ---
  const [useCase, setUseCase] = useState<UseCase>("soundtrack");
  const [model, setModel] = useState<"lyria-3-clip-preview" | "lyria-3-pro-preview">("lyria-3-clip-preview");
  const [prompt, setPrompt] = useState<string>("An epic synthwave track for a space exploration game with heavy bass and celestial pads.");
  const [genre, setGenre] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [tempo, setTempo] = useState<number>(120);
  const [duration, setDuration] = useState<number>(30);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  
  // Reference Image Visual-to-Audio state
  const [imageData, setImageData] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Status & List state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [errorStatus, setErrorStatus] = useState<string>("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Audio Context & Analyser
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSynthRef = useRef<ProceduralSynth | null>(null);

  // --- PRESET ADJUSTER ---
  // Shift inputs, fine-tuners, lists and options when preset changes
  useEffect(() => {
    const p = USE_CASE_PRESETS[useCase];
    if (p) {
      setGenre(p.defaultGenre);
      setMood(p.defaultMood);
      setTempo(p.defaultTempo);
      setDuration(p.defaultDuration);
      setSelectedInstruments(p.defaultInstruments);
    }
  }, [useCase]);

  // Read initial cache or load elegant seed tracks during first load
  useEffect(() => {
    const saved = localStorage.getItem("lyria_composer_tracks");
    if (saved) {
      try {
        setTracks(JSON.parse(saved));
      } catch (e) {
        loadMockTracks();
      }
    } else {
      loadMockTracks();
    }
  }, []);

  // Save changes to client LocalStorage automatically
  const saveTracksToLocalStorage = (updated: Track[]) => {
    setTracks(updated);
    localStorage.setItem("lyria_composer_tracks", JSON.stringify(updated));
  };

  const loadMockTracks = () => {
    const seeds: Track[] = [
      {
        id: "demo-1",
        title: "Ambient Dream Soundtrack",
        createdAt: new Date().toLocaleString(),
        prompt: "A majestic sunrise slowly lighting up a misty mountain range, starting quiet and swelling to an epic orchestral crescendo.",
        lyrics: "[System Orchestration]\nIntroducing celestial pads sweeping in warm E Minor.\nDynamic piano notes begin to dance lazily over an ambient drone.\n\n[Bridge]\nStrings crescendo with triumphant brass building momentum.",
        isSimulated: true,
        warning: "Demo showcase track using client procedural audio generator.",
        likes: 12,
        isFavorite: true,
        spec: {
          model: "lyria-3-pro-preview",
          useCase: "soundtrack",
          genre: "Cinematic Orchestral",
          mood: "Dramatic / Epic",
          tempo: 95,
          instrumentation: ["Violin Section", "French Horn", "Timpani", "Cinema Pad", "Concert Grand Piano"],
          duration: 30
        }
      },
      {
        id: "demo-2",
        title: "Modern Retro Swing Jingle",
        createdAt: new Date(Date.now() - 3600000).toLocaleString(),
        prompt: "Upbeat, bounce-heavy tech-startup advertisement with crispy synth, modern lo-fi rhythm and acoustic energy.",
        lyrics: "[Verse 1]\nFrequencies humming high up in the blue,\nBuilding the future for me and for you.\n\n[Chorus]\nMoving on up with a digital beat,\nHappy-go-lucky, we're taking the street!",
        isSimulated: true,
        warning: "Demo marketing jingle showing rapid 15s commercial preset structure.",
        likes: 5,
        isFavorite: false,
        spec: {
          model: "lyria-3-clip-preview",
          useCase: "jingle",
          genre: "Modern Electro Swing",
          mood: "Bright / Energetic",
          tempo: 125,
          instrumentation: ["Brass Section", "Slap Bass", "Modern Drum Machine", "Chippy Synths"],
          duration: 15
        }
      }
    ];
    saveTracksToLocalStorage(seeds);
  };

  // --- AUDIO SYNTH TRIGGERS ---
  const handlePlayToggle = (track: Track) => {
    // If we're toggling the already active track
    if (activeTrackId === track.id) {
      if (isPlaying) {
        stopSynth();
      } else {
        startSynth(track);
      }
    } else {
      // Switching tracks
      stopSynth();
      startSynth(track);
    }
  };

  const startSynth = (track: Track) => {
    try {
      const synth = new ProceduralSynth(track.spec);
      synth.play();
      
      // Pull the coupled analyser node directly from the playing synth instance
      const analyserNode = synth.getAnalyser();
      setAnalyser(analyserNode);

      activeSynthRef.current = synth;
      setActiveTrackId(track.id);
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio trigger failed:", err);
    }
  };

  const stopSynth = () => {
    if (activeSynthRef.current) {
      activeSynthRef.current.stop();
      activeSynthRef.current = null;
    }
    setAnalyser(null);
    setIsPlaying(false);
  };

  // Clean up Web Audio units on destruct
  useEffect(() => {
    return () => {
      if (activeSynthRef.current) {
        activeSynthRef.current.stop();
      }
    };
  }, []);

  // --- IMAGE UPLOADS ---
  const handleImageFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please supply a valid image format (PNG, JPEG, WebP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("File exceeds 5MB size limit.");
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
        setImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageData("");
    setImageName("");
    setImageError("");
  };

  // --- LYRIA MUSIC PIPELINE GENERATION ---
  const triggerGenerateTrack = async () => {
    if (!prompt.trim()) {
      setErrorStatus("A textual prompt or idea description is required to generate custom scores.");
      return;
    }

    setErrorStatus("");
    setIsGenerating(true);
    setGenerationProgress(10);

    // Emulate progress bar transitions to delight user
    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 85) {
          clearInterval(interval);
          return 85;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 450);

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          useCase,
          genre,
          mood,
          tempo,
          instrumentation: selectedInstruments,
          duration,
          imageData: imageData || undefined,
        }),
      });

      const result = await response.json();
      clearInterval(interval);
      setGenerationProgress(100);

      if (result.success) {
        const newTrack: Track = {
          id: `track-${Date.now()}`,
          title: result.title || `${mood} ${genre} Theme`,
          createdAt: new Date().toLocaleString(),
          prompt: prompt,
          lyrics: result.lyrics || "Continuous sound loop.",
          isSimulated: !!result.isSimulated,
          warning: result.warning,
          audioData: result.audioData,
          spec: {
            model: result.spec.model || model,
            useCase: result.spec.useCase || useCase,
            genre: result.spec.genre || genre,
            mood: result.spec.mood || mood,
            tempo: Number(result.spec.tempo) || tempo,
            instrumentation: result.spec.instrumentation || selectedInstruments,
            duration: Number(result.spec.duration) || duration,
          },
          imageThumbnail: imageData ? imageData : undefined,
          likes: 0,
          isFavorite: false,
        };

        const updatedTracks = [newTrack, ...tracks];
        saveTracksToLocalStorage(updatedTracks);
        
        // Auto-play the freshly minted Lyria track
        setTimeout(() => {
          handlePlayToggle(newTrack);
        }, 300);
      } else {
        throw new Error(result.error || "Unknown pipeline generation anomaly occurred.");
      }

    } catch (e: any) {
      setErrorStatus(e.message || "Failed to establish a network handshake with the Lyria API. Running local mock state instead.");
      console.error(e);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 700);
    }
  };

  // --- ACTIONS ---
  const toggleFavorite = (trackId: string) => {
    const updated = tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    });
    saveTracksToLocalStorage(updated);
  };

  const deleteTrack = (trackId: string) => {
    if (activeTrackId === trackId) {
      stopSynth();
    }
    const updated = tracks.filter((t) => t.id !== trackId);
    saveTracksToLocalStorage(updated);
  };

  const handleInstrumentCheckbox = (inst: string) => {
    if (selectedInstruments.includes(inst)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== inst));
    } else {
      setSelectedInstruments([...selectedInstruments, inst]);
    }
  };

  const currentPreset = USE_CASE_PRESETS[useCase];

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-200 font-sans p-4 sm:p-6 md:p-8 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* 1. TOP NAV HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/10 p-4 rounded-2xl border border-slate-900/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg italic tracking-wider">
            L
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Lyria <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Studio</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Advanced High-Fidelity Music Orchestration v3.5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="px-3.5 py-1.5 bg-slate-950/60 border border-slate-900 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Lyria Engine Ready
            </span>
          </div>
          
          <button
            type="button"
            onClick={triggerGenerateTrack}
            disabled={isGenerating}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              isGenerating
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 hover:scale-105 active:scale-95"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Generate custom music
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. CORE BENTO GRID */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* BENTO SLOT 1 (Col Span 8, Row Span 3): Composition & visual drop input */}
        <div className="lg:col-span-8 flex flex-col gap-5 bg-gradient-to-b from-slate-900/35 to-slate-900/10 rounded-3xl border border-slate-900 p-5 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle light leak decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex justify-between items-center border-b border-slate-900/80 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" />
              Composition Canvas
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-slate-950/40 border border-slate-900 px-2 py-0.5 rounded-md font-mono">
                {prompt.length}/250 Chars
              </span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="bg-slate-950 border border-slate-900 px-2 py-1 rounded text-[11px] text-slate-300 outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                <option value="lyria-3-clip-preview">lyria-3-clip-preview (up to 30s)</option>
                <option value="lyria-3-pro-preview">lyria-3-pro-preview (full-length tracks)</option>
              </select>
            </div>
          </div>

          {/* Interactive Prompt Designer */}
          <PromptEngineer
            promptValue={prompt}
            onPromptChange={setPrompt}
            onApplyTemplate={(val) => setPrompt(val)}
          />

          {/* Reference Image Drag and Drop block & active layers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-1">
            
            {/* Visual-to-Audio Dropper */}
            <div className="md:col-span-8 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none">
                Reference Image (Visual-to-Audio)
              </span>
              
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleImageFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`flex-1 min-h-[110px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all relative ${
                  isDragging 
                    ? "border-cyan-400 bg-cyan-950/10" 
                    : imageData 
                      ? "border-slate-800/80 bg-slate-950/30" 
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/10 hover:bg-slate-950/30"
                }`}
              >
                <input
                  type="file"
                  id="image-picker"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {imageData ? (
                  <div className="flex items-center gap-4 w-full">
                    <img 
                      src={imageData} 
                      alt="visual theme" 
                      className="w-16 h-16 rounded-lg object-cover ring-2 ring-indigo-500/20 shadow-lg shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{imageName}</p>
                      <p className="text-[10px] text-slate-500">Image analysis loaded for audio synthesis</p>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold mt-1 flex items-center gap-1 hover:underline"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="image-picker" className="flex flex-col items-center gap-1.5 cursor-pointer w-full text-center">
                    <Upload size={20} className="text-slate-500 hover:text-slate-300 transition-colors" />
                    <div>
                      <span className="text-xs font-semibold text-slate-300 hover:underline">Click to upload</span>
                      <span className="text-xs text-slate-500"> or drag imagery here</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Supports PNG, JPG, WEBP for image-themed soundtrack generation</span>
                  </label>
                )}
              </div>
              {imageError && (
                <span className="text-[11px] text-rose-500 font-semibold">{imageError}</span>
              )}
            </div>

            {/* Micro Layers Representation Panel */}
            <div className="md:col-span-4 bg-slate-950/35 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block mb-2 select-none">
                  Active Harmonizer Layer
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Music Flow
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      Visual Seed
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{imageData ? "Active" : "Unused"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-900/50 flex justify-between items-center text-[11px] text-slate-500">
                <span>Output Depth:</span>
                <span className="font-mono text-indigo-400 font-bold">24-bit PCM</span>
              </div>
            </div>

          </div>
        </div>

        {/* BENTO SLOT 2 (Col Span 4, Row Span 2): Parameter Presets */}
        <div className="lg:col-span-4 bg-[#0d0e11] rounded-3xl border border-slate-900 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sliders size={13} className="text-cyan-400" />
              Sound Use Case Preset
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(USE_CASE_PRESETS) as Array<keyof typeof USE_CASE_PRESETS>).map((key) => {
                const item = USE_CASE_PRESETS[key];
                const isActive = useCase === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUseCase(key)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white shadow-[0_0_15px_-4px_rgba(99,102,241,0.25)]"
                        : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:bg-slate-950/80"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">{item.title}</span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest font-extrabold scale-90">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal font-sans">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/80 mt-4 text-[11px] text-slate-400 leading-relaxed font-sans">
            Choosing a preset recalibrates recommended genres, moods, target BPM configurations, and default instruments.
          </div>
        </div>

        {/* BENTO SLOT 3 (Col Span 4, Row Span 4): Fine-Tuning controls */}
        <div className="lg:col-span-4 bg-[#090a0d] rounded-3xl border border-slate-900 p-5 flex flex-col justify-between shadow-2xl relative">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <span>🎛️</span>
              Technical Precision controls
            </h3>

            <div className="space-y-4">
              {/* Tempo BPM Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">BPM / Tempo Speed</span>
                  <span className="text-cyan-400 font-mono font-bold">{tempo} BPM</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                  <span>Slow (50)</span>
                  <span>Average (120)</span>
                  <span>Fast (200)</span>
                </div>
              </div>

              {/* Music Duration Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 font-medium font-sans">Sequence Duration</span>
                  <span className="text-cyan-400 font-mono font-bold">{duration} seconds</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                  <span>Short clips (5)</span>
                  <span>Mid (30s)</span>
                  <span>Full loop (60s)</span>
                </div>
              </div>

              {/* Genre Selection */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Genre Style</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-xs rounded-xl p-2 text-slate-200 outline-none focus:border-indigo-500/50"
                >
                  {currentPreset?.allowedGenres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Acoustic Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-xs rounded-xl p-2 text-slate-200 outline-none focus:border-indigo-500/50"
                >
                  {currentPreset?.allowedMoods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Instrumentation Checklist */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5 select-none uppercase tracking-wider text-[10px] font-bold">
                  Recommended Instrumentation ({selectedInstruments.length})
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {currentPreset?.allowedInstruments.map((inst) => {
                    const isChecked = selectedInstruments.includes(inst);
                    return (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => handleInstrumentCheckbox(inst)}
                        className={`text-left text-[11px] p-2 rounded-lg border transition-all truncate flex items-center gap-1.5 ${
                          isChecked
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                            : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                          isChecked ? "bg-cyan-400 border-cyan-400 text-slate-950" : "border-slate-800"
                        }`}>
                          {isChecked && <Check size={8} strokeWidth={4} />}
                        </div>
                        <span className="truncate">{inst}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-900/60 select-none">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-900/80 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Orchestrator ID</span>
              <span className="text-xs font-mono font-semibold text-slate-300">#LYR-3.5-X</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-900/80 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-600 block">Licensing</span>
              <span className="text-xs font-mono font-semibold text-emerald-500">Developer</span>
            </div>
          </div>
        </div>

        {/* BENTO SLOT 4 (Col Span 8, Row Span 3): Generation Library */}
        <div className="lg:col-span-8 flex flex-col gap-4 bg-slate-900/25 rounded-3xl border border-slate-900 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex-1">
          <div className="flex justify-between items-center border-b border-slate-900/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database size={15} className="text-indigo-400" />
              Generation Library & Archive ({tracks.length})
            </h3>
            <button
              type="button"
              onClick={loadMockTracks}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase transition-all"
            >
              Reset Seed Files
            </button>
          </div>

          {/* Generative Progress Bar overlay */}
          {isGenerating && (
            <div className="bg-slate-950/90 border border-indigo-500/20 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden animate-pulse">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  Generating New Lyria Track Layers ({generationProgress}%)
                </span>
                <span className="text-indigo-400 font-mono text-[11px]">Processing Spectrum...</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Synthesizing multi-track layers, calculating instrument weights, and writing corresponding narrative metadata...
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorStatus && (
            <div className="bg-amber-500/5 text-amber-300 border border-amber-500/15 p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-semibold">Workspace Warning Status</p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {errorStatus}. Double check if your API token is placed correctly inside Key Manager. Using standard synthesizer fallback.
                </p>
              </div>
            </div>
          )}

          {/* Tracks List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {tracks.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-sans flex flex-col items-center gap-2">
                <Music size={24} className="text-slate-600 animate-bounce" />
                <p className="text-sm font-semibold">No soundtracks active yet.</p>
                <p className="text-xs">Configure parameters above and click 'Generate custom music' to roll your first track.</p>
              </div>
            ) : (
              tracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  isActive={activeTrackId === track.id}
                  isPlaying={isPlaying}
                  onPlayToggle={() => handlePlayToggle(track)}
                  onFavoriteToggle={() => toggleFavorite(track.id)}
                  onDelete={() => deleteTrack(track.id)}
                />
              ))
            )}
          </div>
          
        </div>

      </main>

      {/* 3. ACTIVE STUDIO BOTTOM PREVIEW SLIDER CARD */}
      <footer className="mt-6 flex flex-col gap-4">
        
        {/* Dynamic Studio Monitor Player */}
        <div className="bg-[#0b0c0f] rounded-2xl border border-indigo-500/20 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden">
          {/* Neon side border highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500" />
          
          <button
            type="button"
            onClick={() => {
              if (tracks.length > 0) {
                // Toggle play of the active or first track in archive
                const currentOrFirstTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];
                handlePlayToggle(currentOrFirstTrack);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
              isPlaying
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 scale-105"
                : "bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
            }`}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="translate-x-0.5" fill="currentColor" />}
          </button>

          <div className="flex-1 w-full flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">
                {activeTrackId 
                  ? `Active Monitoring: ${tracks.find(t => t.id === activeTrackId)?.title}`
                  : "Studio Idle - Choose a generated waveform above"
                }
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isPlaying ? "Live Oscilloscope Processing" : "00:00 / --:--"}
              </span>
            </div>

            {/* Integrated Spectral Visualizer Card */}
            <AudioVisualizer
              analyser={analyser}
              isPlaying={isPlaying}
              tempo={tempo}
              colorPreset={useCase === "jingle" ? "purple" : useCase === "background" ? "emerald" : "cyan"}
            />
          </div>

        </div>

        {/* Professional Footer Metadata compliance */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] uppercase tracking-wider text-slate-600 font-bold border-t border-slate-900/85 pt-4">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full" />
              System ID: LYRIA_COMPOSE_992
            </span>
            <span>Local Context Time: 2026-06-22</span>
          </div>
          <div>
            © 2026 Lyria AI Technologies • Non-Commercial Preview Session
          </div>
        </div>

      </footer>

    </div>
  );
}
