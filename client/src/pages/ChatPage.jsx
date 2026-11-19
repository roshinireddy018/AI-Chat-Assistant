import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import MessageArea from '../components/MessageArea.jsx';
import ChatInput from '../components/ChatInput.jsx';
import useHealthCheck from '../hooks/useHealthCheck.js';
import {
  getConversations,
  getConversation,
  createConversation,
  renameConversation,
  deleteConversation
} from '../api/conversations.api.js';
import { streamConversationMessage, API_BASE_URL } from '../api/client.js';

export const ChatPage = () => {
  // Theme state: defaults to prefers-color-scheme or saved preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ai_chat_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Tone state: persisted in localStorage (Professional/Casual/Concise)
  const [selectedTone, setSelectedTone] = useState(() => {
    const saved = localStorage.getItem('ai_chat_tone');
    return ['Professional', 'Casual', 'Concise'].includes(saved) ? saved : 'Professional';
  });

  // Sidebar & Navigation states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Active chat state
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeTitle, setActiveTitle] = useState('New conversation');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef(null);

  // Health check
  const { isHealthy } = useHealthCheck(30000);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ai_chat_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    localStorage.setItem('ai_chat_tone', tone);
  };

  // Load conversation list from server
  const loadConversations = useCallback(async (query = '') => {
    try {
      setIsLoadingConversations(true);
      const data = await getConversations(query);
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(searchQuery);
  }, [loadConversations, searchQuery]);

  // Select a conversation from sidebar
  const handleSelectConversation = async (id) => {
    if (isStreaming) {
      handleStopStreaming();
    }
    try {
      const data = await getConversation(id);
      setActiveConversationId(data._id);
      setActiveTitle(data.title || 'Conversation');
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  // New Chat action
  const handleNewChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveConversationId(null);
    setActiveTitle('New conversation');
    setMessages([]);
    setInputText('');
  };

  // Rename active conversation
  const handleRename = async (id, newTitle) => {
    try {
      const updated = await renameConversation(id, newTitle);
      if (updated) {
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? { ...c, title: updated.title } : c))
        );
        if (activeConversationId === id) {
          setActiveTitle(updated.title);
        }
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  // Delete conversation
  const handleDelete = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Stop streaming response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingContent.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: streamingContent,
          tone: selectedTone.toLowerCase(),
          createdAt: new Date().toISOString()
        }
      ]);
    }
    setIsStreaming(false);
    setStreamingContent('');
  };

  // Send message and stream response
  const handleSendMessage = async (text, tone) => {
    if (!text.trim() || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      try {
        const newConv = await createConversation(text.trim().slice(0, 40));
        convId = newConv._id;
        setActiveConversationId(newConv._id);
        setActiveTitle(newConv.title);
        loadConversations(searchQuery);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        return;
      }
    }

    const userMessage = {
      role: 'user',
      content: text,
      tone: tone.toLowerCase(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    try {
      await streamConversationMessage({
        conversationId: convId,
        content: text,
        tone: tone.toLowerCase(),
        signal: controller.signal,
        onDelta: (delta) => {
          accumulatedText += delta;
          setStreamingContent(accumulatedText);
        },
        onDone: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: accumulatedText,
              tone: data?.tone || tone.toLowerCase(),
              createdAt: new Date().toISOString()
            }
          ]);
          setStreamingContent('');
          setIsStreaming(false);
          abortControllerRef.current = null;
          loadConversations(searchQuery);
        },
        onError: (err) => {
          console.error('Stream error:', err);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: accumulatedText,
              error: err?.message || 'Error generating response',
              tone: tone.toLowerCase(),
              createdAt: new Date().toISOString()
            }
          ]);
          setStreamingContent('');
          setIsStreaming(false);
          abortControllerRef.current = null;
        }
      });
    } catch (err) {
      if (!controller.signal.aborted) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: accumulatedText,
            error: err?.message || 'Failed to complete request',
            tone: tone.toLowerCase(),
            createdAt: new Date().toISOString()
          }
        ]);
        setStreamingContent('');
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    }
  };

  // Regenerate last AI response
  const handleRegenerate = () => {
    if (isStreaming || messages.length === 0) return;

    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user' || messages[i].sender === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userPrompt = messages[lastUserIndex].content;
    setMessages((prev) => prev.slice(0, lastUserIndex + 1));
    handleSendMessage(userPrompt, selectedTone);
  };

  // Export current chat as Markdown
  const handleExportMarkdown = async () => {
    if (!activeConversationId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${activeConversationId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTitle.replace(/[^a-z0-9_-]/gi, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Failed to export markdown:', e);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans">
      {/* Editorial Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRename}
        onDeleteConversation={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoadingList={isLoadingConversations}
        isHealthy={isHealthy}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Minimal Header */}
        <Header
          title={activeTitle}
          conversationId={activeConversationId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onRename={(newTitle) => {
            if (activeConversationId) {
              handleRename(activeConversationId, newTitle);
            } else {
              setActiveTitle(newTitle);
            }
          }}
          onExportMarkdown={handleExportMarkdown}
        />

        {/* Message Area */}
        <MessageArea
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onRegenerate={handleRegenerate}
          onRetry={handleRegenerate}
        />

        {/* Composer */}
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          onStopStreaming={handleStopStreaming}
          selectedTone={selectedTone}
          onSelectTone={handleToneChange}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
};

export default ChatPage;
