import React from 'react';
import { PerspectiveMode } from '../types/chat';
import { useUserAvatar } from '../utils/userAvatar';
import { UserAvatarButton } from './UserAvatarButton';

interface DesktopShellProps {
  children: React.ReactNode;
  isPlayingIntro: boolean;
  onReplayIntro: () => void;
  onSkipIntro: () => void;
  onOpenInfo: () => void;
  onOpenFeedback: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  perspective: PerspectiveMode;
  onSelectPerspective: (mode: PerspectiveMode) => void;
}


const HovavLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 1667 1667"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <circle cx="833.333" cy="833.333" r="789.583" fill="none" stroke="currentColor" strokeWidth="87.5px" />
      <path
        d="M662.871,763.558l0,125.242l-346.508,0l0,-125.242l346.508,0Zm-292.236,-268.117l0,675.392l-162.817,0l0,-675.392l162.817,0Zm401.711,0l0,675.392l-162.354,0l0,-675.392l162.354,0Zm686.504,0l0,675.392l-162.354,0l-238.892,-420.263l0,420.263l-162.817,0l0,-675.392l162.817,0l238.892,420.267l0,-420.267l162.354,0Z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </g>
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);


export const DesktopShell: React.FC<DesktopShellProps> = ({
  children,
  isPlayingIntro,
  onReplayIntro,
  onSkipIntro,
  onOpenInfo,
  onOpenFeedback,
  soundEnabled,
  onToggleSound,
  perspective,
  onSelectPerspective,
}) => {
  const { isCustom, resetToEinstein } = useUserAvatar();
  return (
    <div className="w-full h-full min-h-screen bg-[#0B141A] flex flex-col md:flex-row items-center justify-center p-0 md:p-6 lg:p-8 select-none font-sans overflow-hidden">
      {/* Desktop Quick Control Sidebar */}
      <div className="hidden md:flex flex-col justify-between w-80 lg:w-96 h-[852px] mr-8 p-6 bg-[#111B21]/90 backdrop-blur-md rounded-3xl border border-[#202C33] text-white shadow-2xl text-left">
        {/* Top Info */}
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#00A884]/20 text-[#25D366] text-xs font-bold px-2.5 py-1 rounded-full mb-3 border border-[#00A884]/40">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Interactive Concept Demo</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#E9EDEF] mb-2 leading-tight">
            Reply by Moment, Not by Message
          </h1>
          <p className="text-xs text-[#8696A0] leading-relaxed mb-4">
            Solving context loss in long voice notes. Instead of replying to a 4-minute monolithic audio file, quote the exact chapter and moment.
          </p>

          {/* Perspective Switcher */}
          <div className="mb-5 bg-[#182229] p-3 rounded-2xl border border-[#222E35]">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Perspective Switcher
            </span>
            <div className="grid grid-cols-3 gap-1 bg-[#111B21] p-1 rounded-xl border border-[#202C33]">
              <button
                onClick={() => onSelectPerspective('marty')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  perspective === 'marty'
                    ? 'bg-[#00A884] text-white font-bold shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Marty
              </button>
              <button
                onClick={() => onSelectPerspective('doc')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  perspective === 'doc'
                    ? 'bg-[#00A884] text-white font-bold shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Doc
              </button>
              <button
                onClick={() => onSelectPerspective('group')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  perspective === 'group'
                    ? 'bg-[#00A884] text-white font-bold shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Group
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {perspective === 'marty'
                ? 'Marty’s POV: Outgoing green bubbles on right, Doc on left.'
                : perspective === 'doc'
                ? 'Doc’s POV: Doc’s 4:18 voice note on right, Marty on left.'
                : 'Group POV: You interact as a 3rd member with Doc & Marty.'}
            </p>
          </div>

          {/* Your Profile Avatar (Einstein / Custom) */}
          <div className="mb-4 bg-[#182229] p-3 rounded-2xl border border-[#222E35] flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <UserAvatarButton size="md" showBadge={true} />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-[#E9EDEF] flex items-center space-x-1.5">
                  <span>You</span>
                  {isCustom ? (
                    <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded font-mono border border-blue-700/50">
                      Custom Photo
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-900/60 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-700/50">
                      Einstein 🐶
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#8696A0] truncate mt-0.5">
                  {isCustom ? 'Click avatar to view / change' : 'Doc’s sheepdog — click to view'}
                </p>
              </div>
            </div>

            {isCustom && (
              <button
                onClick={resetToEinstein}
                className="text-[10px] text-[#25D366] hover:text-[#00A884] font-medium px-2 py-1 rounded-lg bg-[#111B21] border border-[#202C33] hover:border-[#25D366]/40 transition-colors"
                title="Reset to Einstein"
              >
                Reset
              </button>
            )}
          </div>

          {/* Feature Badges */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-[#D1D7DB] bg-[#182229] p-2.5 rounded-xl border border-[#222E35]">
              <span className="text-base">🎙️</span>
              <span><strong>Real Narrated Audio:</strong> Doc & Marty voice notes wired</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#D1D7DB] bg-[#182229] p-2.5 rounded-xl border border-[#222E35]">
              <span className="text-base">🔴</span>
              <span><strong>Live Microphone:</strong> Real MediaRecorder with chapters</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#D1D7DB] bg-[#182229] p-2.5 rounded-xl border border-[#222E35]">
              <span className="text-base">📍</span>
              <span><strong>Contextual Scrubber:</strong> Anchors replies to timestamps</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-3 border-t border-[#202C33]">
          {/* Intro controls */}
          {isPlayingIntro ? (
            <button
              onClick={onSkipIntro}
              className="w-full py-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Skip Intro & Join Chat</span>
              <span>⏩</span>
            </button>
          ) : (
            <button
              onClick={onReplayIntro}
              className="w-full py-2.5 bg-[#202C33] hover:bg-[#2A3942] text-[#00A884] font-semibold text-xs rounded-xl border border-[#00A884]/30 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>↺ Replay Act 1 Intro</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-full py-2 bg-[#182229] hover:bg-[#202C33] text-xs text-[#D1D7DB] font-medium rounded-xl border border-[#222E35] flex items-center justify-center space-x-2 transition-colors"
          >
            <span>{soundEnabled ? '🔊 Sound Effects: ON' : '🔇 Sound Effects: OFF'}</span>
          </button>

          {/* About & Feedback */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenInfo}
              className="flex-1 py-2 bg-[#182229] hover:bg-[#202C33] text-xs text-[#8696A0] hover:text-white font-medium rounded-xl border border-[#222E35] transition-colors"
            >
              📖 Case Study
            </button>
            <button
              onClick={onOpenFeedback}
              className="flex-1 py-2 bg-[#00A884]/20 hover:bg-[#00A884]/30 text-xs text-[#25D366] font-semibold rounded-xl border border-[#00A884]/40 transition-colors"
            >
              ⭐ Feedback
            </button>
          </div>

          <div className="text-[11px] text-[#8696A0] text-center pt-1">
            Based on the design concept by{' '}
            <a
              href="https://www.linkedin.com/in/hovav"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#D1D7DB] hover:text-[#25D366] hover:underline underline-offset-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#25D366] rounded-xs px-0.5"
            >
              Hovav Nuriel
            </a>
          </div>
        </div>
      </div>

      {/* iPhone 16 Pro Mobile Frame (or 100% full-screen on mobile) */}
      <div className="relative w-full h-[100dvh] md:h-[852px] md:w-[393px] md:max-w-[393px] md:rounded-[50px] md:shadow-[0_0_0_12px_#1C1C1E,0_0_0_14px_#3A3A3C,0_25px_65px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden bg-[#F6F6F6] border-0 md:border md:border-black/30">
        {/* On mobile: floating skip pill during intro */}
        {isPlayingIntro && (
          <div className="md:hidden absolute top-14 right-4 z-40 animate-in fade-in duration-200">
            <button
              onClick={onSkipIntro}
              className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center space-x-1 active:scale-95 transition-all"
            >
              <span>Skip Intro</span>
              <span>⏩</span>
            </button>
          </div>
        )}

        {children}
      </div>

      {/* Version Pill: v1.8 in Bottom-Left Corner */}
      <div className="hidden md:block fixed bottom-4 left-5 z-50 pointer-events-none select-none">
        <div className="bg-neutral-900/90 border border-neutral-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-neutral-300 shadow-lg">
          v1.8
        </div>
      </div>

      {/* Author, Article & LinkedIn Pill in Bottom-Right Corner */}
      <div className="hidden md:block fixed bottom-4 right-5 z-50">
        <div className="bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-3 text-xs text-neutral-300 shadow-2xl">
          <a
            href="https://www.hovavnuriel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white hover:text-neutral-300 transition-colors group"
            title="Hovav Nuriel Portfolio"
          >
            <HovavLogo className="w-4 h-4 text-white group-hover:text-neutral-300 transition-colors" />
            <span className="font-bold text-xs tracking-tight">Hovav Nuriel</span>
          </a>

          <span className="text-neutral-600 font-mono">·</span>

          <a
            href="https://www.hovavnuriel.com/thoughts/reply-smarter-to-whatsapp-voice-notes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-300 hover:text-white transition-colors font-medium"
            title="Read Project Article: Reply Smarter to WhatsApp Voice Notes"
          >
            Article
          </a>

          <span className="text-neutral-600 font-mono">·</span>

          <a
            href="https://www.linkedin.com/in/hovav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white transition-colors flex items-center"
            title="Hovav Nuriel on LinkedIn"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      
    </div>
  );
};
