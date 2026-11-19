import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft, Info } from 'lucide-react';
import { TONES } from './ToneSelector.jsx';

export const ChatInput = ({
  inputText = '',
  setInputText,
  onSendMessage,
  selectedTone,
  isLoading = false
}) => {
  const textareaRef = useRef(null);
  const currentTone = TONES.find((t) => t.id === selectedTone) || TONES[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed, selectedTone);
    if (setInputText) setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-2">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg shadow-black/40 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all"
        >
          {/* Active Tone Indicator Pill */}
          <div className="pt-2 px-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Responding in <strong className="text-indigo-300">{currentTone.label}</strong> tone
            </span>
            <span className="hidden sm:inline text-slate-500 text-[10px]">
              Shift + Enter for new line
            </span>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText && setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or request assistance..."
            disabled={isLoading}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-4 pt-2.5 pb-12 text-sm focus:outline-none resize-none max-h-48 overflow-y-auto"
          />

          {/* Bottom Action Bar inside input */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                inputText.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Phase notification footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-indigo-400" />
            <span>Phase 1 Foundation: Input validated &bull; Express API connected</span>
          </div>
          <span className="text-[10px] hidden sm:inline">OpenAI SDK Ready</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
