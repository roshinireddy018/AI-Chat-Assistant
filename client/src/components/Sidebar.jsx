import React from 'react';
import { Plus, MessageSquare, Database, Server, X } from 'lucide-react';

export const Sidebar = ({
  isOpen,
  onClose,
  onNewChat,
  healthData,
  isHealthy
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation History Area (GENUINE Empty State - NO Mock Data) */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Conversations
          </div>

          <div className="mt-4 px-3 py-6 rounded-xl border border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-400">No conversations yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[170px]">
              Start typing below to begin a new session.
            </p>
          </div>
        </div>

        {/* Sidebar Footer: System Architecture & Database Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            System Infrastructure
          </div>

          {/* Database Status Row */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px]">MongoDB Atlas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
                }`}
              />
              <span className="text-[10px] font-medium text-slate-400">
                {isHealthy ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Backend API Status Row */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Express API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
                }`}
              />
              <span className="text-[10px] font-medium text-slate-400">
                {isHealthy ? 'Online' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Stack Summary */}
          <div className="pt-1 text-[10px] text-slate-400 text-center">
            Vibe Coding Stack &bull; Vite &bull; Tailwind &bull; Zod
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
