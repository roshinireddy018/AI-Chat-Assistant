import React, { useRef, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import { User, Bot, Sparkles, Clock } from 'lucide-react';

export const MessageArea = ({ messages = [], onPromptSelect }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Genuine empty state: render WelcomeScreen
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <WelcomeScreen onPromptSelect={onPromptSelect} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
      {messages.map((message) => {
        const isUser = message.sender === 'user';

        return (
          <div
            key={message.id || message.timestamp}
            className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isUser
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-400 border border-slate-700/80 shadow-sm'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-800/70 text-slate-100 rounded-tl-none border border-slate-750/70 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Tone tag if specified */}
                {message.tone && !isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Tone: {message.tone}</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`flex items-center gap-1 text-[10px] text-slate-500 px-1 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageArea;
