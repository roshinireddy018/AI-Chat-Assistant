import React, { useState } from 'react';
import { Menu, Download, Check, X, Pencil } from 'lucide-react';

export const Header = ({
  title = 'New conversation',
  conversationId,
  onToggleSidebar,
  onRename,
  onExportMarkdown
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  const handleStartEdit = () => {
    setCurrentTitle(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (currentTitle.trim() && currentTitle !== title) {
      onRename(currentTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentTitle(title);
    setIsEditing(false);
  };

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)] px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Conversation Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
              className="bg-[var(--surface)] text-[var(--text)] text-sm px-2 py-0.5 rounded border border-[var(--accent)] focus:outline-none"
            />
            <button
              onClick={handleSave}
              className="p-1 text-[var(--accent)] hover:opacity-80"
              title="Save"
            >
              <Check size={16} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
              title="Cancel"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="group flex items-center gap-1.5 text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-150 truncate text-left max-w-[280px] sm:max-w-md"
            title="Click to rename"
          >
            <span className="truncate">{title}</span>
            <Pencil
              size={13}
              strokeWidth={1.5}
              className="opacity-0 group-hover:opacity-100 text-[var(--muted)] flex-shrink-0 transition-opacity duration-150"
            />
          </button>
        )}
      </div>

      {/* Right: Export Icon Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportMarkdown}
          className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-control border border-transparent hover:border-[var(--border)] transition-colors duration-150"
          title="Export chat as Markdown"
          aria-label="Export chat as Markdown"
        >
          <Download size={17} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};

export default Header;
