import React, { useState } from 'react';
import { Message, VoiceChapter, PerspectiveMode } from '../types/chat';
import { AUTHORS } from '../data/demoScript';
import { formatTime } from '../utils/speechAudio';
import { useGlobalAudio } from '../utils/globalAudioPlayer';
import { UserAvatarButton } from './UserAvatarButton';
import { ReactionMenu } from './ReactionMenu';

interface VoiceNoteBubbleProps {
  message: Message;
  currentUserId: string;
  perspective: PerspectiveMode;
  onOpenChapterReply: (chapter: VoiceChapter, message: Message) => void;
  onAddReaction: (messageId: string, emoji: string, chapterId?: string) => void;
  externalActiveChapterId?: string;
  externalSeekTimestamp?: number;
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  message,
  perspective,
  onOpenChapterReply,
  onAddReaction,
}) => {
  const author = AUTHORS[message.authorId] || AUTHORS.user;
  const voice = message.voiceData;

  // Determine whether this bubble is outgoing on the right based on perspective
  const isOutgoing =
    perspective === 'doc'
      ? message.authorId === 'doc'
      : perspective === 'marty'
      ? message.authorId === 'marty'
      : message.authorId === 'user';

  const [localSeekTime, setLocalSeekTime] = useState(0);
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  const duration = voice?.duration || 60;
  const waveform = voice?.waveform || [];
  const chapters = voice?.chapters || [];

  const {
    track: currentTrack,
    isPlaying: isGlobalPlaying,
    currentMessageTime,
    messageProgressPercent,
    player,
  } = useGlobalAudio();

  const isThisMessageActive = currentTrack?.messageId === message.id;
  const isPlaying = isThisMessageActive && isGlobalPlaying;
  const playbackTime = isThisMessageActive ? currentMessageTime : localSeekTime;
  const progressPercent = isThisMessageActive
    ? messageProgressPercent
    : duration > 0
    ? Math.min(100, Math.max(0, (localSeekTime / duration) * 100))
    : 0;

  const activeChapterIndex = chapters.findIndex(
    (c) => playbackTime >= c.startTime && playbackTime <= c.endTime
  );

  // Play a specific chapter via global single-source audio manager
  const playChapter = (chapIdx: number, startSeconds?: number) => {
    const targetChapter = chapters[chapIdx] || chapters[0];
    const isReal = !!voice?.isRealRecording;
    const chapDuration = targetChapter ? targetChapter.endTime - targetChapter.startTime : duration;

    const audioSource =
      targetChapter?.audioUrl ||
      voice?.audioUrl ||
      (message.authorId === 'marty' ? '/assets/voicenotes/marty_reply_1.mp3' : '/assets/voicenotes/doc_chapter_1.mp3');

    const fileStartSec = isReal && targetChapter ? targetChapter.startTime : 0;
    const fileEndSec = isReal && targetChapter ? targetChapter.endTime : chapDuration;

    const messageStartSec = targetChapter ? targetChapter.startTime : 0;
    const messageEndSec = targetChapter ? targetChapter.endTime : duration;

    const offsetInChapter =
      startSeconds !== undefined && startSeconds >= messageStartSec
        ? Math.max(0, startSeconds - messageStartSec)
        : 0;

    player.playTrack(
      {
        messageId: message.id,
        authorId: message.authorId,
        authorName: author.name,
        authorColor: author.color,
        authorAvatar: author.avatar,
        title: targetChapter?.title || 'Voice Note',
        audioUrl: audioSource,
        isQuotedClip: false,
        fileStartSec,
        fileEndSec,
        segmentDuration: chapDuration,
        messageStartSec,
        messageEndSec,
        totalMessageDuration: duration,
        chapterId: targetChapter?.id,
        isRealRecording: isReal,
        stopAtSegmentEnd: false,
        onEndedAdvance: () => {
          if (chapIdx < chapters.length - 1 && !isReal) {
            playChapter(chapIdx + 1);
          }
        },
      },
      offsetInChapter
    );
  };

  const togglePlay = () => {
    if (isThisMessageActive) {
      player.togglePlay();
    } else {
      const startSec = localSeekTime > 0 ? localSeekTime : 0;
      const targetChapIdx = chapters.findIndex(
        (c) => startSec >= c.startTime && startSec <= c.endTime
      );
      playChapter(targetChapIdx !== -1 ? targetChapIdx : 0, startSec);
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setLocalSeekTime(clamped);

    if (isThisMessageActive) {
      if (
        currentTrack &&
        clamped >= currentTrack.messageStartSec &&
        clamped <= currentTrack.messageEndSec
      ) {
        player.seekSegmentTime(clamped - currentTrack.messageStartSec);
      } else {
        const targetChapIdx = chapters.findIndex(
          (c) => clamped >= c.startTime && clamped <= c.endTime
        );
        playChapter(targetChapIdx !== -1 ? targetChapIdx : 0, clamped);
      }
    } else {
      const targetChapIdx = chapters.findIndex(
        (c) => clamped >= c.startTime && clamped <= c.endTime
      );
      playChapter(targetChapIdx !== -1 ? targetChapIdx : 0, clamped);
    }
  };

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
        className={`relative max-w-[92%] sm:max-w-[340px] rounded-2xl p-3 shadow-wa-bubble transition-all ${
          isOutgoing
            ? 'bg-[#D9FDD3] rounded-tr-sm text-black'
            : 'bg-white rounded-tl-sm text-black'
        }`}
      >
        {/* Author Name for incoming in group/chat */}
        {!isOutgoing && (
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[13px] font-semibold tracking-tight"
              style={{ color: author.color }}
            >
              {author.name}
            </span>
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
              {chapters.length > 0 ? `${chapters.length} Moments` : 'Voice Note'}
            </span>
          </div>
        )}

        {/* Voice Note Audio Scrubber Bar */}
        <div className="flex items-center space-x-2.5">
          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-gray-700 hover:text-black transition-colors"
            title={isPlaying ? 'Pause' : 'Play Voice Note'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8 fill-gray-600" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 fill-gray-600 ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Waveform Scrubber with Live Fluid Progress Dot */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div
              className="h-8 flex items-center space-x-[2px] cursor-pointer relative py-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                handleSeek(Math.floor(ratio * duration));
              }}
            >
              {waveform.map((val, idx) => {
                const barPercent = (idx / waveform.length) * 100;
                const isPassed = barPercent <= progressPercent;

                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-full transition-colors duration-75"
                    style={{
                      height: `${Math.max(14, (val / 100) * 32)}px`,
                      backgroundColor: isPassed ? '#007AFF' : '#C7C7CC',
                    }}
                  />
                );
              })}

              {/* Segment boundary markers for chapters */}
              {chapters.map((chap, cIdx) => {
                if (chap.startTime <= 0) return null;
                const leftPercent = duration > 0 ? (chap.startTime / duration) * 100 : 0;
                return (
                  <div
                    key={`split-${cIdx}`}
                    className="absolute top-1 bottom-1 w-[2px] bg-black/25 z-0 pointer-events-none rounded-full"
                    style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                  />
                );
              })}

              {/* Live Progress Marker Dot (updates smoothly with requestAnimationFrame) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#007AFF] shadow-md border-2 border-white pointer-events-none transition-none"
                style={{
                  left: `${progressPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>

            {/* Time Indicators */}
            <div className="flex items-center justify-between text-[11px] text-[#8696A0] px-0.5 mt-0.5 font-mono">
              <span>{isPlaying ? formatTime(playbackTime) : voice?.formattedDuration || '4:18'}</span>
              <div className="flex items-center space-x-1">
                <span>{message.timestamp}</span>
                {isOutgoing && (
                  <span className="text-[#53BDEB] text-[12px] font-bold">✓✓</span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar with Mic Badge */}
          <div className="relative flex-shrink-0">
            {message.authorId === 'user' ? (
              <UserAvatarButton size="md" showBadge={false} allowReset={true} className="w-11 h-11" />
            ) : (
              <img
                src={author.avatar || '/assets/doc_avatar.png'}
                alt={author.name}
                className="w-11 h-11 rounded-full object-cover border border-black/10 shadow-sm"
              />
            )}
            <div className="absolute -bottom-1 -left-1 bg-[#007AFF] text-white p-0.5 rounded-full shadow-sm pointer-events-none">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Chapters Section: "Moments" */}
        {chapters.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-black/5 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <span>⚡ Key Moments</span>
                <span className="text-[9px] bg-blue-100 text-[#007AFF] px-1 py-0.2 rounded font-mono">
                  {chapters.length}
                </span>
              </span>
              <span className="text-[10px] text-gray-400">Tap to play moment</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {chapters.map((chap, idx) => {
                const isActive = activeChapterIndex === idx;
                return (
                  <div
                    key={chap.id}
                    className={`flex items-center justify-between text-left text-xs p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/90 border-[#007AFF]/40 shadow-xs'
                        : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.04]'
                    }`}
                    onClick={() => {
                      playChapter(idx);
                    }}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-900 truncate">
                          {chap.title}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {formatTime(chap.startTime)} - {formatTime(chap.endTime)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 truncate italic mt-0.5">
                        “{chap.quote}”
                      </p>
                    </div>

                    {/* Reply to this chapter CTA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChapterReply(chap, message);
                      }}
                      className="flex-shrink-0 text-[11px] bg-[#007AFF] hover:bg-[#0062cc] active:scale-95 text-white font-medium px-2 py-1 rounded-md shadow-xs flex items-center space-x-1 transition-all"
                      title="Reply to this moment"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                      </svg>
                      <span>Reply</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reaction trigger / long-press button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReactionMenu(!showReactionMenu);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="React with Emoji"
        >
          <span className="text-xs">❤️</span>
        </button>

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
