import React, { useState, useRef, useEffect } from 'react';
import { VoiceChapter } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface ComposerProps {
  onSendMessage: (text: string) => void;
  onOpenAudioRecorder: () => void;
  activeChapterReply?: VoiceChapter | null;
  draftText?: string;
  onDraftChange?: (text: string) => void;
  isUnlocked: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onOpenAudioRecorder,
  activeChapterReply,
  draftText = '',
  onDraftChange,
  isUnlocked,
}) => {
  const [inputText, setInputText] = useState(draftText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputText(draftText);
  }, [draftText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (onDraftChange) {
      onDraftChange(val);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isUnlocked) return;
    sounds.playSent();
    onSendMessage(trimmed);
    setInputText('');
    if (onDraftChange) {
      onDraftChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = inputText.trim().length > 0;

  return (
    <footer className="w-full bg-[#F6F6F6] border-t border-[#E5E5EA] px-2 pt-1.5 pb-2 select-none z-20 flex flex-col">
      {/* Input Row */}
      <div className="flex items-center space-x-1.5">
        {/* Plus (+) Action Button */}
        <button
          onClick={() => {
            if (!isUnlocked) return;
            sounds.playChapterClick();
            alert('WhatsApp attachments: Photos, Documents, Poll, Location (Simulation)');
          }}
          disabled={!isUnlocked}
          className="text-[#007AFF] hover:opacity-75 transition-opacity p-1.5 flex-shrink-0 disabled:opacity-30"
          title="Add Attachment"
        >
          <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Text Input Pill Container */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-300/80 px-3 py-1.5 flex items-center shadow-xs">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!isUnlocked}
            placeholder={
              !isUnlocked
                ? 'Playback in progress...'
                : activeChapterReply
                ? `Reply to "${activeChapterReply.title}"...`
                : 'Message'
            }
            className="w-full bg-transparent text-[15px] text-gray-900 placeholder:text-[#8E8E93] focus:outline-none disabled:opacity-50"
          />

          {/* Sticker Icon */}
          <button
            onClick={() => {
              if (!isUnlocked) return;
              sounds.playChapterClick();
              alert('WhatsApp Stickers & Avatars (Simulation)');
            }}
            disabled={!isUnlocked}
            className="text-[#8E8E93] hover:text-gray-700 ml-1 p-0.5 flex-shrink-0 disabled:opacity-30"
            title="Stickers"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Dynamic Action Buttons: Camera + Mic OR Send Button */}
        {hasText ? (
          /* WhatsApp Green Send Circle */
          <button
            onClick={handleSend}
            disabled={!isUnlocked}
            className="w-8 h-8 rounded-full bg-[#00A884] hover:bg-[#008f6f] active:scale-95 flex items-center justify-center text-white shadow-xs transition-transform flex-shrink-0 disabled:opacity-30"
            title="Send Message"
          >
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Camera Button */}
            <button
              onClick={() => {
                if (!isUnlocked) return;
                sounds.playChapterClick();
                alert('Camera capture (Simulation)');
              }}
              disabled={!isUnlocked}
              className="text-[#007AFF] hover:opacity-75 transition-opacity p-1.5 disabled:opacity-30"
              title="Camera"
            >
              <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Mic Button: Record Voice Note */}
            <button
              onClick={() => {
                if (!isUnlocked) return;
                onOpenAudioRecorder();
              }}
              disabled={!isUnlocked}
              className="text-[#007AFF] hover:opacity-75 transition-opacity p-1.5 active:scale-110 disabled:opacity-30"
              title="Record Voice Note"
            >
              <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-full flex justify-center pt-2">
        <div className="w-32 h-1 bg-black/80 rounded-full" />
      </div>
    </footer>
  );
};
