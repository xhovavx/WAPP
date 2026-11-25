import React from 'react';
import { TypingStatus, PerspectiveMode } from '../types/chat';
import { useUserAvatar } from '../utils/userAvatar';
import { UserAvatarButton } from './UserAvatarButton';

interface ChatHeaderProps {
  typingStatus: TypingStatus;
  perspective: PerspectiveMode;
  onSelectPerspective: (mode: PerspectiveMode) => void;
  onOpenInfo: () => void;
  onOpenFeedback: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  typingStatus,
  perspective,
  onSelectPerspective,
  onOpenInfo,
  onOpenFeedback,
}) => {
  const { avatar: userAvatar } = useUserAvatar();

  return (
    <header className="w-full bg-[#F6F6F6] border-b border-[#E5E5EA] px-3 pt-1.5 pb-2 flex flex-col select-none z-20 shadow-xs">
      {/* Top Bar: Contact Info & Action Buttons */}
      <div className="flex items-center justify-between">
        {/* Left Back + Avatar + Contact Info */}
        <div className="flex items-center space-x-2 min-w-0 cursor-pointer" onClick={onOpenInfo}>
          {/* Back Chevron */}
          <button className="text-[#007AFF] hover:opacity-75 transition-opacity -ml-1 p-1">
            <svg className="w-6 h-6 stroke-current fill-none stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Perspective-aware Avatar */}
          <div className="relative w-9 h-9 flex-shrink-0">
            {perspective === 'marty' ? (
              <img
                src="/assets/doc_avatar.png"
                alt="Doc Brown"
                className="w-9 h-9 rounded-full object-cover border border-black/10 shadow-sm"
              />
            ) : perspective === 'doc' ? (
              <img
                src="/assets/marty_avatar.png"
                alt="Marty McFly"
                className="w-9 h-9 rounded-full object-cover border border-black/10 shadow-sm"
              />
            ) : (
              /* Group: Doc, Marty & You (Einstein) trio */
              <div className="relative w-9 h-9">
                <img
                  src="/assets/doc_avatar.png"
                  alt="Doc Brown"
                  className="w-5 h-5 rounded-full object-cover border border-white absolute -top-0.5 left-0 shadow-2xs"
                />
                <img
                  src="/assets/marty_avatar.png"
                  alt="Marty McFly"
                  className="w-5 h-5 rounded-full object-cover border border-white absolute -top-0.5 right-0 shadow-2xs"
                />
                <img
                  src={userAvatar}
                  alt="You (Einstein)"
                  className="w-5 h-5 rounded-full object-cover border border-white absolute bottom-0 left-2 shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="min-w-0 text-left">
            <h1 className="font-semibold text-[15px] text-black leading-tight truncate">
              {perspective === 'marty'
                ? 'Emmett "Doc" Brown'
                : perspective === 'doc'
                ? 'Marty McFly'
                : 'Hill Valley Lab'}
            </h1>
            <p className="text-[12px] leading-tight truncate">
              {typingStatus.isTyping ? (
                <span className="text-[#0E8040] font-medium animate-pulse">
                  {typingStatus.authorName || 'typing...'}
                </span>
              ) : (
                <span className="text-[#8E8E93]">
                  {perspective === 'group'
                    ? 'Doc, Marty, You'
                    : 'tap here for contact info'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Video, Phone, Feedback & You Avatar Picker */}
        <div className="flex items-center space-x-2 text-[#007AFF] pr-1">
          {/* Video Call Icon */}
          <button
            title="Video Call"
            onClick={() => alert('Simulating WhatsApp video call...')}
            className="hover:opacity-75 transition-opacity"
          >
            <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h9a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          </button>

          {/* Audio Call Icon */}
          <button
            title="Audio Call"
            onClick={() => alert('Simulating WhatsApp audio call...')}
            className="hover:opacity-75 transition-opacity"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>

          {/* Feedback Button */}
          <button
            onClick={onOpenFeedback}
            title="Feedback"
            className="text-[11px] font-semibold bg-[#E8F5E9] text-[#0E8040] hover:bg-[#C8E6C9] px-2 py-0.5 rounded-full border border-[#0E8040]/30 transition-colors"
          >
            Feedback
          </button>

          {/* You (Einstein) Avatar Button */}
          <UserAvatarButton size="sm" showBadge={true} allowReset={true} />
        </div>
      </div>

      {/* Perspective Switcher Segmented Control */}
      <div className="w-full mt-1.5 flex items-center justify-center">
        <div className="bg-[#E5E5EA]/80 p-0.5 rounded-lg flex items-center space-x-0.5 text-[11px] font-medium shadow-2xs">
          <button
            onClick={() => onSelectPerspective('marty')}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              perspective === 'marty'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Marty's View
          </button>
          <button
            onClick={() => onSelectPerspective('doc')}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              perspective === 'doc'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Doc's View
          </button>
          <button
            onClick={() => onSelectPerspective('group')}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              perspective === 'group'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Group (You)
          </button>
        </div>
      </div>
    </header>
  );
};
