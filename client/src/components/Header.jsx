import React from 'react';
import { Menu, Bot, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import ToneSelector from './ToneSelector.jsx';

export const Header = ({
  onToggleSidebar,
  selectedTone,
  onSelectTone,
  healthData,
  isHealthy,
  isLoadingHealth,
  onRefreshHealth
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm sm:text-base text-white tracking-tight">
                AI Chat Assistant
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                Foundation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Full-Stack Architecture &bull; Node &bull; Express &bull; MongoDB Atlas &bull; OpenAI SDK
            </p>
          </div>
        </div>
      </div>

      {/* Right: Health Status & Tone Selector */}
      <div className="flex items-center gap-3">
        {/* Backend / Database Connection Status Badge */}
        <div
          onClick={onRefreshHealth}
          title={
            isLoadingHealth
              ? 'Checking status...'
              : isHealthy
              ? 'Connected to MongoDB Atlas'
              : 'Backend or MongoDB Atlas not reachable. Click to retry.'
          }
          className={`cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            isLoadingHealth
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : isHealthy
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/15'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/15'
          }`}
        >
          {isLoadingHealth ? (
            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
          ) : isHealthy ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <AlertCircle className="w-3 h-3 text-rose-400" />
          )}

          <span className="hidden md:inline">
            {isLoadingHealth
              ? 'Connecting...'
              : isHealthy
              ? 'DB & API Connected'
              : 'Offline'}
          </span>
          <span className="md:hidden">
            {isHealthy ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Tone Selector */}
        <ToneSelector selectedTone={selectedTone} onSelectTone={onSelectTone} />
      </div>
    </header>
  );
};

export default Header;
