import React, { useRef, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import MessageItem from './MessageItem.jsx';

export const MessageArea = ({
  messages = [],
  isStreaming = false,
  streamingContent = '',
  onRegenerate,
  onRetry
}) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const userHasScrolledUp = useRef(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    userHasScrolledUp.current = !isAtBottom;
  };

  useEffect(() => {
    if (!userHasScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  if (!messages.length && !isStreaming) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="max-w-[720px] mx-auto w-full">
        {messages.map((message, idx) => {
          const isLast = idx === messages.length - 1;
          const isAi = message.role === 'assistant' || message.sender === 'assistant';

          return (
            <MessageItem
              key={message.id || message._id || idx}
              message={message}
              isStreaming={false}
              onRegenerate={isLast && isAi ? onRegenerate : undefined}
              onRetry={isLast && message.error ? onRetry : undefined}
            />
          );
        })}

        {/* Transient streaming message */}
        {isStreaming && (
          <MessageItem
            message={{
              sender: 'assistant',
              content: streamingContent || '',
              tone: messages[messages.length - 1]?.tone || 'Professional',
              createdAt: new Date().toISOString()
            }}
            isStreaming={true}
          />
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default MessageArea;
