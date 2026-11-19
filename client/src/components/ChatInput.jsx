import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

const TONES = ['Professional', 'Casual', 'Concise'];

export const ChatInput = ({
  inputText = '',
  setInputText,
  onSendMessage,
  onStopStreaming,
  selectedTone = 'Professional',
  onSelectTone,
  isStreaming = false,
  disabled = false
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

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
    <div className="p-4 bg-[var(--bg)] sticky bottom-0 z-10">
      <div className="max-w-[768px] mx-auto w-full">
        {/* Large Rounded Composer Card */}
        <div className="relative rounded-composer bg-[var(--surface)] border border-[var(--border)] shadow-sm focus-within:border-[var(--accent)] transition-colors duration-150 p-3">
          {/* Auto-growing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText && setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant..."
            disabled={disabled}
            className="w-full bg-transparent text-[var(--text)] placeholder-[var(--muted)] text-[15px] leading-relaxed resize-none focus:outline-none max-h-48 overflow-y-auto px-1 py-0.5"
          />

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50 mt-1">
            {/* Tone Selector: Compact Segmented Control */}
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-control bg-[var(--surface-2)] border border-[var(--border)]/60 text-xs">
              {TONES.map((tone) => {
                const isActive = tone === selectedTone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => onSelectTone(tone)}
                    className={`px-2.5 py-1 rounded-[8px] text-xs font-normal transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-xs font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>

            {/* Circular Send / Square Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="w-8 h-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-colors duration-150 shadow-xs"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <Square size={13} strokeWidth={2} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputText.trim() || disabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 ${
                  inputText.trim() && !disabled
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xs cursor-pointer'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] cursor-not-allowed'
                }`}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Muted Hint Under Card */}
        <p className="text-[11px] text-[var(--muted)] text-center mt-2 font-normal select-none">
          Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
