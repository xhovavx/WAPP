import React, { useRef } from 'react';
import { VoiceChapter, Message } from '../types/chat';
import { AUTHORS } from '../data/demoScript';
import { formatTime } from '../utils/speechAudio';

interface ChapterScrubberBarProps {
  voiceMessage: Message;
  selectedChapter: VoiceChapter;
  onSelectChapter: (chapter: VoiceChapter) => void;
  onClose: () => void;
  currentPlaybackTime: number;
  onSeek: (seconds: number) => void;
}

export const ChapterScrubberBar: React.FC<ChapterScrubberBarProps> = ({
  voiceMessage,
  selectedChapter,
  onSelectChapter,
  onClose,
  currentPlaybackTime,
  onSeek,
}) => {
  const author = AUTHORS[voiceMessage.authorId] || AUTHORS.doc;
  const chapters = voiceMessage.voiceData?.chapters || [];
  const duration = voiceMessage.voiceData?.duration || 258;
  const waveform = voiceMessage.voiceData?.waveform || [];

  const currentIdx = chapters.findIndex((c) => c.id === selectedChapter.id);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  const handlePrevChapter = () => {
    if (currentIdx > 0) {
      const prev = chapters[currentIdx - 1];
      onSelectChapter(prev);
      onSeek(prev.startTime);
    }
  };

  const handleNextChapter = () => {
    if (currentIdx < chapters.length - 1) {
      const next = chapters[currentIdx + 1];
      onSelectChapter(next);
      onSeek(next.startTime);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformContainerRef.current) return;
    const rect = waveformContainerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = Math.floor(ratio * duration);
    onSeek(targetSeconds);

    // If seeking landed in another chapter, update active chapter
    const matchedChap = chapters.find(
      (c) => targetSeconds >= c.startTime && targetSeconds <= c.endTime
    );
    if (matchedChap && matchedChap.id !== selectedChapter.id) {
      onSelectChapter(matchedChap);
    }
  };

  const playheadPercent = duration > 0 ? Math.min(100, Math.max(0, (currentPlaybackTime / duration) * 100)) : 0;

  return (
    <div className="w-full bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E5E5EA] px-3 pt-2 pb-2.5 relative select-none z-20 shadow-wa-dock animate-in slide-in-from-bottom-2 duration-150">
      {/* Left colored vertical accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: author.color }}
      />

      {/* Row 1: Author Name, Steppers, Title, Timestamp range, Close */}
      <div className="flex items-center justify-between text-xs pl-2 pr-1">
        <div className="flex flex-col min-w-0 pr-2">
          {/* Author Name in signature color */}
          <span
            className="font-bold text-[13px] tracking-tight leading-none mb-1"
            style={{ color: author.color }}
          >
            {author.name}
          </span>

          {/* Steppers + Title */}
          <div className="flex items-center space-x-2">
            {/* Previous chapter stepper */}
            <button
              onClick={handlePrevChapter}
              disabled={currentIdx <= 0}
              className={`p-0.5 rounded hover:bg-black/5 active:scale-95 transition-opacity ${
                currentIdx <= 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-80'
              }`}
              title="Previous Chapter"
            >
              <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Chapter Title */}
            <span className="font-semibold text-[13px] text-gray-900 truncate">
              {selectedChapter.title}
            </span>

            {/* Next chapter stepper */}
            <button
              onClick={handleNextChapter}
              disabled={currentIdx >= chapters.length - 1}
              className={`p-0.5 rounded hover:bg-black/5 active:scale-95 transition-opacity ${
                currentIdx >= chapters.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80'
              }`}
              title="Next Chapter"
            >
              <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side: Timestamp range & Dismiss button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="font-mono text-[12px] text-gray-700 font-medium">
            {formatTime(selectedChapter.startTime)} - {formatTime(selectedChapter.endTime)}
          </span>

          {/* Close (X) circle button */}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-700 transition-colors"
            title="Dismiss Chapter Reply"
          >
            <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: Full interactive waveform scrubber with highlighted active chapter & live dot */}
      <div
        ref={waveformContainerRef}
        onClick={handleWaveformClick}
        className="mt-2 h-10 px-2 flex items-center space-x-[2px] cursor-pointer relative group"
      >
        {waveform.map((bar, idx) => {
          const barSeconds = (idx / waveform.length) * duration;
          const isInActiveChapter =
            barSeconds >= selectedChapter.startTime && barSeconds <= selectedChapter.endTime;

          return (
            <div
              key={idx}
              className="flex-1 rounded-full transition-colors"
              style={{
                height: `${Math.max(12, (bar / 100) * 36)}px`,
                backgroundColor: isInActiveChapter ? '#1C1C1E' : '#D1D5DB',
              }}
            />
          );
        })}

        {/* Draggable/Live Blue Playhead Scrub Circle */}
        <div
          className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-[#007AFF] shadow-md border-2 border-white pointer-events-none transition-none"
          style={{
            left: `${playheadPercent}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Quoted preview snippet */}
      <div className="mt-1 px-2 text-[11px] text-gray-500 italic truncate">
        “{selectedChapter.quote}”
      </div>
    </div>
  );
};
