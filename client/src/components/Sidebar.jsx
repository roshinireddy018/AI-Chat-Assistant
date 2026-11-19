import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

export const Sidebar = ({
  isOpen,
  onClose,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  searchQuery,
  onSearchChange,
  isLoadingList,
  isHealthy,
  theme,
  onToggleTheme
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (id, e) => {
    e?.stopPropagation();
    if (editingTitle.trim()) {
      await onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  // Group conversations by date: Today, Yesterday, Previous 7 days, Older
  const groupConversations = (items) => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 days': [],
      Older: []
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOf7Days = new Date(startOfToday);
    startOf7Days.setDate(startOf7Days.getDate() - 7);

    items.forEach((conv) => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      if (date >= startOfToday) {
        groups.Today.push(conv);
      } else if (date >= startOfYesterday) {
        groups.Yesterday.push(conv);
      } else if (date >= startOf7Days) {
        groups['Previous 7 days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  };

  const grouped = groupConversations(conversations);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col transition-transform duration-150 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Wordmark & Mobile Close */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <span className="font-serif text-lg tracking-tight text-[var(--text)] font-semibold select-none">
            AI Chat
          </span>
          <button
            onClick={onClose}
            className="p-1 text-[var(--muted)] hover:text-[var(--text)] md:hidden rounded"
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* New Chat Plain Row */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)]/40 rounded-control transition-colors duration-150 text-left font-normal"
          >
            <Plus size={16} strokeWidth={1.75} className="text-[var(--accent)]" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="px-3 pb-3">
          <div className="relative flex items-center">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute left-2.5 text-[var(--muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] text-xs pl-8 pr-3 py-1.5 rounded-control border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {isLoadingList && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-[var(--muted)] text-xs gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-[var(--muted)] text-xs">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-0.5">
                  <div className="px-2 py-1 text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
                    {category}
                  </div>

                  {items.map((conv) => {
                    const isActive = conv._id === activeConversationId;
                    const isEditing = conv._id === editingId;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => {
                          if (!isEditing) {
                            onSelectConversation(conv._id);
                            onClose();
                          }
                        }}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-control text-xs cursor-pointer transition-colors duration-150 ${
                          isActive
                            ? 'bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm'
                            : 'text-[var(--text)] hover:bg-[var(--border)]/40'
                        }`}
                      >
                        {isEditing ? (
                          <div
                            className="flex items-center gap-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(conv._id, e);
                                if (e.key === 'Escape') handleCancelRename(e);
                              }}
                              autoFocus
                              className="w-full bg-[var(--surface)] text-[var(--text)] text-xs px-1.5 py-0.5 border border-[var(--accent)] rounded focus:outline-none"
                            />
                            <button
                              onClick={(e) => handleSaveRename(conv._id, e)}
                              className="p-1 text-[var(--accent)] hover:opacity-80"
                              title="Save"
                            >
                              <Check size={14} strokeWidth={1.75} />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                              title="Cancel"
                            >
                              <X size={14} strokeWidth={1.75} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="truncate pr-2 text-left flex-1" title={conv.title}>
                              {conv.title}
                            </span>

                            {/* Actions on hover */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                              <button
                                onClick={(e) => startEditing(conv, e)}
                                className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded"
                                title="Rename"
                              >
                                <Pencil size={13} strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conv._id);
                                }}
                                className="p-1 text-[var(--muted)] hover:text-rose-500 rounded"
                                title="Delete"
                              >
                                <Trash2 size={13} strokeWidth={1.5} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: Theme Toggle & Server Status */}
        <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 p-1.5 rounded-control hover:bg-[var(--border)]/40 text-[var(--text)] transition-colors duration-150"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={1.5} />
            ) : (
              <Moon size={16} strokeWidth={1.5} />
            )}
            <span className="text-xs">Theme</span>
          </button>

          {/* Minimal Server Status */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-normal">
              {isHealthy ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
