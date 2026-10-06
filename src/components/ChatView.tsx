import React, { useRef, useEffect } from 'react';
import { Conversation, ChatMessage, AttachmentItem, ResponseMode, QuickResponseSpeed } from '../types.ts';
import { HomeScreen } from './HomeScreen.tsx';
import { ChatMessageItem } from './ChatMessageItem.tsx';
import { ChatInput } from './ChatInput.tsx';

interface ChatViewProps {
  conversation: Conversation | null;
  onSendMessage: (text: string, attachments: AttachmentItem[], enableSearch: boolean) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onRegenerateMessage: (msgId: string) => void;
  onEditMessage: (msgId: string, newContent: string) => void;
  onLikeMessage: (msgId: string) => void;
  onDislikeMessage: (msgId: string) => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  activeMode: ResponseMode;
  onChangeMode: (mode: ResponseMode) => void;
  quickResponseSpeed: QuickResponseSpeed;
  onCycleQuickResponse: () => void;
  enterToSend: boolean;
  onOpenSettings: () => void;
  onOpenCanvas: () => void;
  onOpenImageStudio: () => void;
  onOpenDataAnalysis: () => void;
  onOpenFileUpload: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  onRegenerateMessage,
  onEditMessage,
  onLikeMessage,
  onDislikeMessage,
  webSearchEnabled,
  onToggleWebSearch,
  activeMode,
  onChangeMode,
  quickResponseSpeed,
  onCycleQuickResponse,
  enterToSend,
  onOpenSettings,
  onOpenCanvas,
  onOpenImageStudio,
  onOpenDataAnalysis,
  onOpenFileUpload,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message or stream chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isStreaming]);

  const hasMessages = conversation && conversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto chat-scroll-area">
        {!hasMessages ? (
          <HomeScreen
            onSelectSuggestion={(prompt, mode, enableSearch) => {
              if (mode) onChangeMode(mode);
              onSendMessage(prompt, [], Boolean(enableSearch));
            }}
            onOpenCanvas={onOpenCanvas}
            onOpenImageStudio={onOpenImageStudio}
            onOpenDataAnalysis={onOpenDataAnalysis}
            onOpenFileUpload={onOpenFileUpload}
          />
        ) : (
          <div className="max-w-4xl mx-auto w-full py-4 space-y-1">
            {conversation.messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                onRegenerate={() => onRegenerateMessage(message.id)}
                onEdit={(newContent) => onEditMessage(message.id, newContent)}
                onLike={() => onLikeMessage(message.id)}
                onDislike={() => onDislikeMessage(message.id)}
                onOpenSettings={onOpenSettings}
              />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Dock at Bottom */}
      <div className="p-3 md:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent no-print">
        <ChatInput
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={onStopStreaming}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={onToggleWebSearch}
          activeMode={activeMode}
          onChangeMode={onChangeMode}
          quickResponseSpeed={quickResponseSpeed}
          onCycleQuickResponse={onCycleQuickResponse}
          enterToSend={enterToSend}
        />
      </div>
    </div>
  );
};
