import React from "react";
import { Sparkles, HelpCircle, AudioLines, RefreshCw } from "lucide-react";
import { PROMPT_ASSIST_SUGGESTIONS } from "../presets";

interface PromptEngineerProps {
  promptValue: string;
  onPromptChange: (val: string) => void;
  onApplyTemplate: (val: string) => void;
}

export const PromptEngineer: React.FC<PromptEngineerProps> = ({
  promptValue,
  onPromptChange,
  onApplyTemplate,
}) => {
  const rollRandomPrompt = () => {
    const suggestions = PROMPT_ASSIST_SUGGESTIONS;
    const currentIdx = suggestions.indexOf(promptValue);
    let randomIdx = Math.floor(Math.random() * suggestions.length);
    // Prevent Rolling the exact same prompt twice
    if (randomIdx === currentIdx) {
      randomIdx = (randomIdx + 1) % suggestions.length;
    }
    onApplyTemplate(suggestions[randomIdx]);
  };

  const tips = [
    { title: "Define Structure", desc: "e.g., 'starts with quiet piano, swells into aggressive brass.'" },
    { title: "Set the Scene", desc: "e.g., 'sunlight cutting through pine forests' or 'cyberpunk rain-soaked alleys'." },
    { title: "Avoid Fluff", desc: "Focus on musical textures rather than meta descriptors like 'best song ever'." },
  ];

  return (
    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <AudioLines size={16} className="text-cyan-400" />
          Music Generation Prompt
        </label>
        
        <button
          type="button"
          onClick={rollRandomPrompt}
          className="text-xs bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles size={12} />
          Roll Prompt Suggestion
        </button>
      </div>

      <textarea
        value={promptValue}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Describe the sonic atmosphere, progression, structure, and emotional journey of your track..."
        className="w-full h-32 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 text-slate-200 placeholder-slate-500 text-sm p-3.5 rounded-lg font-sans outline-none resize-none transition-all shadow-inner leading-relaxed"
      />

      <div className="mt-4 pt-3 border-t border-slate-800/50">
        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
          <HelpCircle size={13} className="text-slate-400" />
          Lyria Prompt Engineering Tips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-950">
              <span className="block text-xs font-semibold text-cyan-400/90 mb-0.5">{tip.title}</span>
              <span className="block text-[11px] text-slate-400 leading-normal">{tip.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
