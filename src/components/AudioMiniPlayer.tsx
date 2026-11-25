import React, { useRef } from 'react';
import { useGlobalAudio } from '../utils/globalAudioPlayer';
import { formatTime } from '../utils/speechAudio';

export const AudioMiniPlayer: React.FC = () => {
  const { track, isPlaying, currentSegmentTime, duration, progressPercent, player } = useGlobalAudio();
  const scrubberContainerRef = useRef<HTMLDivElement>(null);

  if (!track) return null;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberContainerRef.current) return;
    const rect = scrubberContainerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = ratio * duration;
    player.seekSegmentTime(targetSeconds);
  };

  return (
    <div className="w-full px-2.5 pb-1 select-none z-30 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-wa-dock border border-black/10 flex flex-col space-y-1.5 transition-all">
        {/* Top Row: Sender, Quoted badge, Topic Title & Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Avatar & Meta */}
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            {track.authorAvatar ? (
              <img
                src={track.authorAvatar}
                alt={track.authorName}
                className="w-8 h-8 rounded-full object-cover border border-black/10 flex-shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold text-xs shadow-xs"
                style={{ backgroundColor: track.authorColor }}
              >
                {track.authorName.charAt(0)}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5 leading-none">
                <span
                  className="font-bold text-[12px] truncate"
                  style={{ color: track.authorColor }}
                >
                  {track.authorName}
                </span>

                {track.isQuotedClip && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold tracking-wide uppercase border border-amber-200/80 flex-shrink-0">
                    Quoted clip
                  </span>
                )}
              </div>

              <span className="text-[11px] text-gray-600 font-medium truncate mt-0.5 max-w-[145px] sm:max-w-[185px]">
                {track.title}
              </span>
            </div>
          </div>

          {/* Right: Interactive Playback Controls */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Rewind -5s */}
            <button
              onClick={() => player.skip(-5)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-black/5 active:scale-95 transition-all"
              title="Rewind 5 seconds"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 7.5A8.5 8.5 0 1 1 3.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="5.2,3.8 3.2,8.8 8.4,8.2" fill="currentColor"/>
                <text x="12" y="15.5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="9.5" fill="currentColor">5</text>
              </svg>
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => player.togglePlay()}
              className="w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-xs hover:bg-[#0069D9] active:scale-90 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Forward +5s */}
            <button
              onClick={() => player.skip(5)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-black/5 active:scale-95 transition-all"
              title="Forward 5 seconds"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 7.5A8.5 8.5 0 1 0 20.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="18.8,3.8 20.8,8.8 15.6,8.2" fill="currentColor"/>
                <text x="12" y="15.5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="9.5" fill="currentColor">5</text>
              </svg>
            </button>

            {/* Close / Stop Button */}
            <button
              onClick={() => player.stop()}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors ml-0.5"
              title="Stop and close"
            >
              <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Row: Interactive Segment Progress Scrubber */}
        <div className="flex items-center space-x-2 pt-0.5">
          <span className="text-[10px] font-mono text-gray-500 min-w-[26px]">
            {formatTime(currentSegmentTime)}
          </span>

          <div
            ref={scrubberContainerRef}
            onClick={handleScrubberClick}
            className="flex-1 h-3 flex items-center cursor-pointer relative group"
          >
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#007AFF] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Scrubber thumb */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-[#007AFF] shadow-xs border border-white pointer-events-none group-hover:scale-125 transition-transform"
              style={{
                left: `${progressPercent}%`,
                transform: 'translate(-50%, 0)',
              }}
            />
          </div>

          <span className="text-[10px] font-mono text-gray-500 min-w-[26px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
