import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative my-3 rounded-control overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)]">
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[var(--text)] transition-colors duration-150 p-1 rounded"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} strokeWidth={1.75} className="text-[var(--accent)]" />
              <span className="text-[11px] text-[var(--accent)]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={1.5} />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-[var(--text)]">
        <code>{value}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
