import React from 'react';
import { Bot, Sparkles, Terminal, Code2, Cpu, ArrowUpRight } from 'lucide-react';

export const WelcomeScreen = ({ onPromptSelect }) => {
  const suggestions = [
    {
      title: 'Analyze Code Architecture',
      description: 'Review full-stack design patterns and data models',
      prompt: 'Can you review the architectural separation of concerns between our Express controllers, routes, and services?',
      icon: Code2
    },
    {
      title: 'Explain Viva Concepts',
      description: 'Prepare concise explanations for viva questions',
      prompt: 'Explain how centralized error handling in Express with Zod validation works for a technical viva.',
      icon: Terminal
    },
    {
      title: 'Database Design Strategy',
      description: 'Explore Mongoose schemas and connection lifecycles',
      prompt: 'How does Mongoose handle connection retry and state tracking in MongoDB Atlas?',
      icon: Cpu
    },
    {
      title: 'OpenAI SDK Integration',
      description: 'Best practices for streaming responses with OpenAI gpt-4o-mini',
      prompt: 'What are the recommended streaming practices using the openai SDK in Node Express?',
      icon: Sparkles
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full text-center select-none animate-in fade-in duration-300">
      {/* AI Bot Badge with gradient */}
      <div className="relative mb-6">
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-lg animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
          <Bot className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        How can I help you today?
      </h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        Your full-stack AI development companion. Ready to assist with coding, debugging, and architecture explanations.
      </p>

      {/* Prompt Starter Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onPromptSelect(item.prompt)}
              className="group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Phase 1 Status Banner */}
      <div className="mt-8 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        <span>Phase 1 Project Foundation: Architecture configured &amp; verified.</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
