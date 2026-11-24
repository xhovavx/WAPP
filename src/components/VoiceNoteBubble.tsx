import React, { useState, useEffect, useRef } from 'react';
import { Message, VoiceChapter, PerspectiveMode } from '../types/chat';
import { AUTHORS } from '../data/demoScript';
import { formatTime } from '../utils/speechAudio';
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
  externalSeekTimestamp,
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);

  const duration = voice?.duration || 60;
  const waveform = voice?.waveform || [];
  const chapters = voice?.chapters || [];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, []);

  // Listen to external jump from quote card clicks
  useEffect(() => {
    if (externalSeekTimestamp !== undefined) {
      handleSeek(externalSeekTimestamp);
      playChapterByTimestamp(externalSeekTimestamp);
    }
  }, [externalSeekTimestamp]);

  const stopAudioPlayback = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play audio for a specific chapter or timestamp - strictly HTMLAudioElement, zero oscillator tones
  const playChapterByTimestamp = (seconds: number) => {
    stopAudioPlayback();

    // Find chapter matching timestamp
    const chapIdx = chapters.findIndex((c) => seconds >= c.startTime && seconds <= c.endTime);
    const targetChapter = chapIdx !== -1 ? chapters[chapIdx] : chapters[0];
    const targetChapterStartTime = targetChapter?.startTime || 0;
    setActiveChapterIndex(chapIdx !== -1 ? chapIdx : 0);

    const audioSource =
      targetChapter?.audioUrl ||
      voice?.audioUrl ||
      (message.authorId === 'marty' ? '/assets/voicenotes/marty_reply_1.mp3' : undefined);

    if (audioSource) {
      const audio = new Audio(audioSource);
      audioRef.current = audio;

      // If user's own recording, audio has entire duration, so seek directly
      if (voice?.isRealRecording) {
        audio.currentTime = Math.max(0, seconds);
      } else {
        // Multi-chapter clip: offset inside current chapter's audio clip
        const chapterOffset = Math.max(0, seconds - targetChapterStartTime);
        audio.currentTime = chapterOffset;
      }

      const syncProgress = () => {
        if (!audioRef.current) return;
        const current = voice?.isRealRecording
          ? audioRef.current.currentTime
          : targetChapterStartTime + audioRef.current.currentTime;
        
        setPlaybackTime(current);

        const activeIdx = chapters.findIndex(
          (c) => current >= c.startTime && current <= c.endTime
        );
        setActiveChapterIndex(activeIdx !== -1 ? activeIdx : null);
      };

      // Continuous fluid animation loop using requestAnimationFrame
      const smoothProgressLoop = () => {
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
          syncProgress();
          animFrameRef.current = requestAnimationFrame(smoothProgressLoop);
        }
      };

      audio.ontimeupdate = syncProgress;

      audio.onended = () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        setIsPlaying(false);

        // If there's a next chapter in multi-chapter voice note, advance smoothly
        if (chapIdx !== -1 && chapIdx < chapters.length - 1 && !voice?.isRealRecording) {
          playChapterByTimestamp(chapters[chapIdx + 1].startTime);
        } else {
          setPlaybackTime(0);
          setActiveChapterIndex(null);
        }
      };

      audio.play().then(() => {
        setIsPlaying(true);
        animFrameRef.current = requestAnimationFrame(smoothProgressLoop);
      }).catch(() => {
        // If autoplay blocked or audio unavailable, advance silently without oscillator tone
        startSilentProgressAdvance(seconds);
      });
    } else {
      startSilentProgressAdvance(seconds);
    }
  };

  // Silent fallback advance (no Web Audio tone/beeps)
  const startSilentProgressAdvance = (startSeconds: number) => {
    setIsPlaying(true);
    let curr = startSeconds;

    fallbackTimerRef.current = setInterval(() => {
      curr += 0.25;
      if (curr >= duration) {
        stopAudioPlayback();
        setPlaybackTime(0);
        return;
      }
      setPlaybackTime(curr);
      const activeIdx = chapters.findIndex((c) => curr >= c.startTime && curr <= c.endTime);
      setActiveChapterIndex(activeIdx !== -1 ? activeIdx : null);
    }, 250);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudioPlayback();
    } else {
      playChapterByTimestamp(playbackTime);
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setPlaybackTime(clamped);
    const chapIdx = chapters.findIndex((c) => clamped >= c.startTime && clamped <= c.endTime);
    setActiveChapterIndex(chapIdx !== -1 ? chapIdx : null);

    // If currently playing, seek HTMLAudioElement immediately
    if (isPlaying) {
      playChapterByTimestamp(clamped);
    } else if (audioRef.current) {
      const targetChapter = chapIdx !== -1 ? chapters[chapIdx] : chapters[0];
      const targetStart = targetChapter?.startTime || 0;
      if (voice?.isRealRecording) {
        audioRef.current.currentTime = clamped;
      } else {
        audioRef.current.currentTime = Math.max(0, clamped - targetStart);
      }
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (playbackTime / duration) * 100)) : 0;

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
            <img
              src={author.avatar || '/assets/doc_avatar.png'}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover border border-black/10 shadow-sm"
            />
            <div className="absolute -bottom-1 -left-1 bg-[#007AFF] text-white p-0.5 rounded-full shadow-sm">
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
                      playChapterByTimestamp(chap.startTime);
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
