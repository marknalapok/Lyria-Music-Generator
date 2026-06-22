import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  Heart, 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Music, 
  Clock, 
  AlertTriangle,
  Flame,
  Globe,
  FileMusic,
  Share2
} from "lucide-react";
import { Track } from "../types";

interface TrackItemProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onFavoriteToggle: () => void;
  onDelete: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isActive,
  isPlaying,
  onPlayToggle,
  onFavoriteToggle,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Trigger download of the audio (either local blob or simulated recipe data)
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    let url = track.audioUrl;
    let filename = `${track.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.wav`;

    if (track.isSimulated) {
      // Create a virtual WAV file or text descriptor file for the user to download if it's simulated
      const descriptionText = `Lyria Music Generator - Simulated Track Record\n\nTitle: ${track.title}\nPrompt: ${track.prompt}\n\nParameters:\n- Model: ${track.spec.model}\n- Use Case: ${track.spec.useCase}\n- Genre: ${track.spec.genre}\n- Mood: ${track.spec.mood}\n- Tempo: ${track.spec.tempo} BPM\n- Instrumentation: ${track.spec.instrumentation.join(", ")}\n\nGenerated Lyrics:\n${track.lyrics}`;
      const blob = new Blob([descriptionText], { type: "text/plain" });
      url = URL.createObjectURL(blob);
      filename = `${track.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-spec.txt`;
    }

    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const shareTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out my generated track: "${track.title}" - ${track.prompt}`);
      alert("Track details copied to clipboard!");
    }
  };

  return (
    <div 
      className={`group bg-slate-900/40 rounded-xl border transition-all ${
        isActive 
          ? "border-cyan-500/60 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20" 
          : "border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60"
      }`}
    >
      {/* Primary Row */}
      <div 
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start md:items-center gap-4 flex-1">
          {/* Play Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isActive && isPlaying
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-slate-800 hover:bg-slate-700 text-slate-100 hover:scale-105"
            }`}
          >
            {isActive && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="translate-x-0.5" fill="currentColor" />}
          </button>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-xs">{track.title}</h3>
              {track.isSimulated ? (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Procedural Fallback
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                  <Globe size={10} />
                  Lyria Stream
                </span>
              )}
              <span className="text-slate-500 text-[11px] font-mono select-none md:ml-auto">{track.createdAt}</span>
            </div>

            <p className="text-xs text-slate-400 italic mt-1 line-clamp-1 truncate max-w-sm sm:max-w-md md:max-w-lg">
              "{track.prompt}"
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-slate-950/80 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider">
                {track.spec.useCase}
              </span>
              <span className="bg-slate-950/80 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono">
                {track.spec.genre}
              </span>
              <span className="bg-slate-950/80 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1">
                <Clock size={10} />
                {track.spec.duration}s
              </span>
              {track.imageThumbnail && (
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1">
                  🖼️ Image Assisted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={`p-2 rounded-lg border transition-all ${
              track.isFavorite
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart size={16} fill={track.isFavorite ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title={track.isSimulated ? "Download Spec Sheet" : "Download Audio (WAV)"}
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            onClick={shareTrack}
            className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all md:inline-flex hidden"
            title="Copy Info"
          >
            <Share2 size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-400 transition-all"
          >
            <Trash2 size={16} />
          </button>

          <div className="w-px h-6 bg-slate-800 mx-1 md:block hidden" />

          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-slate-200"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Metadata & Details Row */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-850 bg-slate-950/20 rounded-b-xl text-slate-300 text-xs animate-fade-in">
          {/* Warning Banner if API fail / key was unconfigured */}
          {track.isSimulated && track.warning && (
            <div className="bg-amber-500/5 text-amber-400 border border-amber-500/15 p-2.5 rounded-lg mb-4 mt-3 flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-300">Procedural Synthesis Fallback</p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {track.warning} You can still configure your Google Lyria api token in Settings &gt; Secrets &gt; GEMINI_API_KEY.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Spec Panel */}
            <div className="space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-800/60 pb-1.5">
                <Music size={13} className="text-cyan-400" />
                Track Specifications
              </h4>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Engine:</span>
                  <span className="text-slate-300 font-mono">{track.spec.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tempo / BPM:</span>
                  <span className="text-slate-300 font-mono">{track.spec.tempo} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Genre:</span>
                  <span className="text-slate-300">{track.spec.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mood:</span>
                  <span className="text-slate-300">{track.spec.mood}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Instrumentation:</span>
                  <div className="flex flex-wrap gap-1">
                    {track.spec.instrumentation.map((inst, index) => (
                      <span key={index} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Lyrics / Metadata Panel */}
            <div className="md:col-span-2 space-y-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-800/60 pb-1.5">
                <FileMusic size={13} className="text-cyan-400" />
                Lyria Generated Lyrics & Story
              </h4>

              <div className="max-h-36 overflow-y-auto pr-1 text-slate-400 space-y-1.5 font-sans leading-relaxed text-[11px] whitespace-pre-line select-text">
                {track.lyrics}
              </div>
            </div>
          </div>

          {/* Compliance License terms display footer */}
          <div className="border-t border-slate-800/40 mt-4 pt-2.5 flex items-center justify-between text-[10px] text-slate-500 select-none">
            <span className="flex items-center gap-1">
              <Flame size={11} className="text-cyan-500" />
              Licensing terms: Lyria Developer Preview License
            </span>
            <span>Non-commercial prototyping & testing only</span>
          </div>
        </div>
      )}
    </div>
  );
};
