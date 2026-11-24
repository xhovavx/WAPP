import React from 'react';
import { sounds } from '../utils/soundEffects';

interface ReactionMenuProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  positionClass?: string;
}

const EMOJIS = ['❤️', '👍', '😂', '😮', '⚡', '🤖'];

export const ReactionMenu: React.FC<ReactionMenuProps> = ({
  onSelectEmoji,
  onClose,
  positionClass = '-top-12 left-2'
}) => {
  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playReaction();
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <>
      {/* Backdrop to dismiss */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Floating Reaction Pill */}
      <div
        className={`absolute z-50 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-lg border border-black/10 flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-150 ${positionClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => handleEmojiClick(emoji, e)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform active:scale-95"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const custom = prompt('Enter an emoji reaction:');
            if (custom) {
              sounds.playReaction();
              onSelectEmoji(custom.trim());
            }
            onClose();
          }}
          className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs text-gray-500 font-bold"
        >
          +
        </button>
      </div>
    </>
  );
};
