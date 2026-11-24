import React, { useRef, useEffect } from 'react';
import { Message, VoiceChapter, TypingStatus, PerspectiveMode } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { VoiceNoteBubble } from './VoiceNoteBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  perspective: PerspectiveMode;
  typingStatus: TypingStatus;
  onOpenChapterReply: (chapter: VoiceChapter, message: Message) => void;
  onAddReaction: (messageId: string, emoji: string, chapterId?: string) => void;
  onReplyToMessage: (message: Message) => void;
  onQuoteCardClick: (voiceNoteId?: string, timestampStart?: number) => void;
  seekTimestamp?: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  perspective,
  typingStatus,
  onOpenChapterReply,
  onAddReaction,
  onReplyToMessage,
  onQuoteCardClick,
  seekTimestamp,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full overflow-y-auto px-2 py-3 relative bg-[#EFEAE2] flex flex-col space-y-1"
      style={{
        backgroundImage: `url('/assets/wallpaper.png')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '393px auto',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Background tint overlay */}
      <div className="absolute inset-0 bg-[#EFEAE2]/92 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Encryption notice pill */}
        <div className="flex justify-center mb-2">
          <div className="bg-[#FFEECD]/90 backdrop-blur-xs text-[#54656F] text-[11px] leading-tight px-3 py-1.5 rounded-lg shadow-2xs max-w-[85%] text-center border border-[#E9D9B5]">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </div>
        </div>

        {/* Date pill "Today" */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/80 backdrop-blur-xs text-[#54656F] text-[12px] font-semibold px-3 py-0.5 rounded-md shadow-2xs">
            Today
          </div>
        </div>

        {/* Messages Stream */}
        {messages.map((msg) => {
          if (msg.type === 'voice') {
            return (
              <VoiceNoteBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                perspective={perspective}
                onOpenChapterReply={onOpenChapterReply}
                onAddReaction={onAddReaction}
                externalSeekTimestamp={seekTimestamp}
              />
            );
          }
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              perspective={perspective}
              onQuoteCardClick={onQuoteCardClick}
              onAddReaction={(messageId, emoji) => onAddReaction(messageId, emoji)}
              onReplyToMessage={onReplyToMessage}
            />
          );
        })}

        {/* Bottom Typing Indicator Bubble */}
        {typingStatus.isTyping && (
          <div className="flex items-center space-x-2 my-2 ml-2 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2 shadow-wa-bubble flex items-center space-x-1.5 border border-black/5">
              <span className="text-xs text-gray-500 font-medium mr-1">
                {typingStatus.authorName}
              </span>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={scrollEndRef} className="h-2" />
      </div>
    </div>
  );
};
