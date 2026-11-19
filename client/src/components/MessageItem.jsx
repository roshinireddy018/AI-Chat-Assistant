import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkle, Copy, Check, RotateCw, AlertCircle } from 'lucide-react';
import CodeBlock from './CodeBlock.jsx';

export const MessageItem = ({
  message,
  isStreaming = false,
  onRegenerate,
  onRetry
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user' || message.sender === 'user';

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  if (isUser) {
    return (
      <div className="flex flex-col items-end group w-full mb-6">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-[18px] px-4 py-3 bg-[var(--user-bubble)] text-[var(--text)] text-[15px] leading-relaxed break-words">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {formattedTime && (
          <span className="text-[11px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-1 px-1">
            {formattedTime}
          </span>
        )}
      </div>
    );
  }

  // AI Message
  return (
    <div className="flex items-start gap-3 w-full group mb-6">
      {/* Small muted accent icon */}
      <div className="pt-2 flex-shrink-0 text-[var(--accent)] opacity-80">
        <Sparkle size={16} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-[80%]">
        {/* Surface bubble with hairline border */}
        <div className="rounded-[18px] px-4 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[15px] leading-relaxed break-words shadow-sm">
          {message.error ? (
            <div className="flex items-center gap-2 text-rose-500 text-xs py-1">
              <AlertCircle size={15} strokeWidth={1.5} />
              <span>{message.error}</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="ml-2 inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <RotateCw size={12} strokeWidth={1.5} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-[var(--text)]">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (!inline && (match || codeString.includes('\n'))) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={codeString}
                        />
                      );
                    }

                    return (
                      <code
                        className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-xs font-mono text-[var(--text)]"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
                  },
                  h1({ children }) {
                    return <h1 className="font-serif text-lg font-semibold my-2">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="font-serif text-base font-semibold my-2">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="font-serif text-sm font-semibold my-1">{children}</h3>;
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>

              {isStreaming && <span className="streaming-cursor" />}
            </div>
          )}
        </div>

        {/* Footer controls under AI message */}
        <div className="flex items-center gap-3 mt-1.5 px-1 text-xs text-[var(--muted)]">
          {/* Tone label in plain text (not a colored badge) */}
          {message.tone && (
            <span className="text-[11px] text-[var(--muted)]">{message.tone}</span>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopyText}
            className="p-1 hover:text-[var(--text)] transition-colors duration-150"
            title="Copy response"
            aria-label="Copy response"
          >
            {copied ? (
              <Check size={14} strokeWidth={1.75} className="text-[var(--accent)]" />
            ) : (
              <Copy size={14} strokeWidth={1.5} />
            )}
          </button>

          {/* Regenerate Button */}
          {onRegenerate && !isStreaming && (
            <button
              onClick={onRegenerate}
              className="p-1 hover:text-[var(--text)] transition-colors duration-150"
              title="Regenerate response"
              aria-label="Regenerate response"
            >
              <RotateCw size={14} strokeWidth={1.5} />
            </button>
          )}

          {/* Muted timestamp shown on hover */}
          {formattedTime && (
            <span className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">
              {formattedTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
