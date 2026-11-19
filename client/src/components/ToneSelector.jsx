import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';

export const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Clear, structured, and formal' },
  { id: 'casual', label: 'Casual', desc: 'Friendly, warm, and conversational' },
  { id: 'concise', label: 'Concise', desc: 'Direct, brief, and bullet-pointed' },
  { id: 'creative', label: 'Creative', desc: 'Imaginative and engaging' }
];

export const ToneSelector = ({ selectedTone, onSelectTone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTone = TONES.find((t) => t.id === selectedTone) || TONES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-lg shadow-sm hover:border-slate-600 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Tone:</span>
        <span className="text-white font-semibold">{currentTone.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/60 focus:outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Response Tone
            </div>
            {TONES.map((tone) => {
              const isSelected = tone.id === currentTone.id;
              return (
                <button
                  key={tone.id}
                  onClick={() => {
                    onSelectTone(tone.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-1.5">
                      {tone.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tone.desc}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToneSelector;
