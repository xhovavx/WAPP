import React, { useState } from 'react';
import { Message, PerspectiveMode, ContextualQuote } from '../types/chat';
import { AUTHORS } from '../data/demoScript';
import { ReactionMenu } from './ReactionMenu';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  perspective: PerspectiveMode;
  onQuoteCardClick?: (voiceNoteId?: string, timestampStart?: number, quote?: ContextualQuote) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onReplyToMessage: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  perspective,
  onQuoteCardClick,
  onAddReaction,
  onReplyToMessage,
}) => {
  const author = AUTHORS[message.authorId] || AUTHORS.user;

  // Determine outgoing (right side green bubble) based on perspective
  const isOutgoing =
    perspective === 'doc'
      ? message.authorId === 'doc'
      : perspective === 'marty'
      ? message.authorId === 'marty'
      : message.authorId === 'user';

  const quote = message.contextualQuote;
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  // System message handling (e.g., "You joined the group")
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 select-none px-4">
        <div className="bg-[#FFFFFF]/90 backdrop-blur-xs text-[#54656F] text-[12px] font-medium px-3 py-1 rounded-lg shadow-2xs border border-black/5 text-center flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-200">
          <svg className="w-3.5 h-3.5 text-[#007AFF] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  // Quote card sender name & color based on perspective
  let quoteAuthorName = quote?.authorName;
  let quoteAuthorColor = quote ? AUTHORS[quote.authorId]?.color || '#D9366E' : '#D9366E';

  if (quote) {
    if (perspective === 'doc' && quote.authorId === 'doc') {
      quoteAuthorName = 'You';
      quoteAuthorColor = '#00A884';
    } else if (perspective === 'marty' && quote.authorId === 'marty') {
      quoteAuthorName = 'You';
      quoteAuthorColor = '#00A884';
    }
  }

  return (
    <div
      className={`relative flex flex-col my-1.5 ${
        isOutgoing ? 'items-end' : 'items-start'
      } px-2 select-none group`}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setShowReactionMenu(true);
        }}
        className={`relative max-w-[85%] sm:max-w-[340px] rounded-2xl p-2.5 pb-2 shadow-wa-bubble transition-all ${
          isOutgoing
            ? 'bg-[#D9FDD3] rounded-tr-sm text-black'
            : 'bg-white rounded-tl-sm text-black'
        }`}
      >
        {/* Author Name for incoming in group/chat */}
        {!isOutgoing && (
          <div className="mb-1">
            <span
              className="text-[13px] font-semibold tracking-tight"
              style={{ color: author.color }}
            >
              {author.name}
            </span>
          </div>
        )}

        {/* Contextual Quote Card: "Reply by moment" */}
        {quote && (
          <div
            onClick={() => {
              if (onQuoteCardClick) {
                onQuoteCardClick(quote.voiceNoteId, quote.timestampStart, quote);
              }
            }}
            className={`mb-2 rounded-lg p-2 text-xs cursor-pointer border-l-[3.5px] transition-opacity hover:opacity-90 ${
              isOutgoing ? 'bg-[#C8ECC0]/70' : 'bg-[#F2F2F7]'
            }`}
            style={{
              borderLeftColor: quoteAuthorColor,
            }}
          >
            {/* Header: Author Name (or "You" in author perspective) */}
            <div
              className="font-semibold text-[12px] leading-tight"
              style={{ color: quoteAuthorColor }}
            >
              {quoteAuthorName}
            </div>

            {/* Sub-header: Mic Icon + RE: Topic */}
            <div className="flex items-center space-x-1 text-gray-800 font-semibold text-[11px] mt-0.5">
              <svg className="w-3 h-3 text-gray-600 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              <span>RE: {quote.chapterTitle}</span>
            </div>

            {/* Quoted Speech in Quotes */}
            <p className="text-[11px] text-gray-700 italic mt-0.5 leading-snug line-clamp-2">
              “{quote.quoteText}”
            </p>

            {/* Timestamp range */}
            <div className="text-[10px] text-[#8696A0] font-mono mt-1">
              ({quote.timeRange})
            </div>
          </div>
        )}

        {/* Message Text Content */}
        <p className="text-[14.5px] leading-snug text-gray-900 pr-12 break-words">
          {message.text}
        </p>

        {/* Message Meta: Time & Read Status */}
        <div className="flex items-center justify-end space-x-1 -mt-1 text-[11px] text-[#8696A0] select-none">
          <span>{message.timestamp}</span>
          {isOutgoing && (
            <span className="text-[#53BDEB] text-[12px] font-bold">✓✓</span>
          )}
        </div>

        {/* Hover quick action: React / Reply */}
        <div className="absolute -top-2 right-1 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionMenu(!showReactionMenu);
            }}
            className="w-5 h-5 rounded-full bg-white shadow-md border border-gray-200 text-gray-500 hover:text-red-500 flex items-center justify-center text-[10px]"
            title="React"
          >
            ❤️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplyToMessage(message);
            }}
            className="w-5 h-5 rounded-full bg-white shadow-md border border-gray-200 text-gray-500 hover:text-blue-500 flex items-center justify-center text-[10px]"
            title="Reply"
          >
            ↩
          </button>
        </div>

        {/* Reactions Pill Attached at bottom */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-3 ${
              isOutgoing ? 'right-2' : 'left-2'
            } bg-white shadow-md rounded-full px-2 py-0.5 flex items-center space-x-1 border border-black/5 z-10 cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => setShowReactionMenu(true)}
          >
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-xs flex items-center space-x-0.5">
                <span>{r.emoji}</span>
                {r.count > 1 && (
                  <span className="text-[10px] text-gray-500 font-bold">{r.count}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Floating Reaction Popover */}
        {showReactionMenu && (
          <ReactionMenu
            onSelectEmoji={(emoji) => onAddReaction(message.id, emoji)}
            onClose={() => setShowReactionMenu(false)}
            positionClass="-top-12 left-0"
          />
        )}
      </div>
    </div>
  );
};
