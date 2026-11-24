import React from 'react';
import { PerspectiveMode } from '../types/chat';

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
    </div>
  );
};
