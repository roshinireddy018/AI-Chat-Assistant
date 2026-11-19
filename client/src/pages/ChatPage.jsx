import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import MessageArea from '../components/MessageArea.jsx';
import ChatInput from '../components/ChatInput.jsx';
import useHealthCheck from '../hooks/useHealthCheck.js';

export const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  // Genuine empty state: no mock messages or fake history
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bannerNotice, setBannerNotice] = useState(null);

  // Poll /api/health to track live backend & database connection
  const {
    healthData,
    isHealthy,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useHealthCheck(20000);

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    setBannerNotice(null);
  };

  // Requirement 7: Clicking a prompt chip must fill the chat input
  const handlePromptSelect = (promptText) => {
    setInputText(promptText);
  };

  const handleSendMessage = (content, tone) => {
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      tone,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);

    // Notice per requirements: Do not use fake AI responses. AI endpoint to be integrated in next phase.
    setBannerNotice({
      type: 'info',
      message:
        'Foundation Phase 1: User message captured. The OpenAI chat endpoint will be connected in Phase 2.'
    });
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        healthData={healthData}
        isHealthy={isHealthy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navigation Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedTone={selectedTone}
          onSelectTone={setSelectedTone}
          healthData={healthData}
          isHealthy={isHealthy}
          isLoadingHealth={isLoadingHealth}
          onRefreshHealth={refetchHealth}
        />

        {/* Phase Notification Banner (if any) */}
        {bannerNotice && (
          <div className="bg-indigo-950/40 border-b border-indigo-800/40 px-4 py-2 flex items-center justify-between text-xs text-indigo-300 animate-in fade-in">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {bannerNotice.message}
            </span>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Message / Welcome Area */}
        <MessageArea
          messages={messages}
          onPromptSelect={handlePromptSelect}
        />

        {/* Chat Input Container */}
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          selectedTone={selectedTone}
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
};

export default ChatPage;
