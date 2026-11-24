import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-y-auto text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <div className="inline-block text-[10px] font-bold tracking-wider uppercase bg-green-100 text-[#0E8040] px-2 py-0.5 rounded-full mb-1">
              Product Design Case Study
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">
              Reply Smarter to WhatsApp Voice Notes
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Concept by{' '}
              <a
                href="https://www.linkedin.com/in/hovav"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-700 hover:text-[#00A884] hover:underline underline-offset-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#00A884] rounded-xs"
              >
                Hovav Nuriel
              </a>{' '}
              (Head of Product Design)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold ml-2"
          >
            ✕
          </button>
        </div>

        {/* Core Case Study Content */}
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              The Core Problem
            </h3>
            <p>
              Voice notes are expressive and convenient, but when they exceed 2–3 minutes and cover multiple topics, replying becomes messy. Replying to a voice note currently treats the entire 4-minute recording as a single undifferentiated block. Listeners lose context, answer only the final thought, or have to type out manual timestamps.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              The Interaction Solution: "Reply by Moment"
            </h3>
            <p>
              Instead of forcing everyone to adapt to one format, the UI bridges audio and text:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-gray-600">
              <li>
                <strong className="text-gray-900">Docked Chapter Scrubber:</strong> Scrub through topics directly above the composer with chapter steppers (<code className="bg-gray-100 px-1 rounded">|◀</code> / <code className="bg-gray-100 px-1 rounded">▶|</code>) and high-contrast waveform.
              </li>
              <li>
                <strong className="text-gray-900">Contextual Quote Card:</strong> Generates a rich reply card anchored to the speaker, topic title, quote snippet, and timestamp range <code className="bg-gray-100 px-1 rounded">(0:00 - 0:38 / 4:18)</code>.
              </li>
              <li>
                <strong className="text-gray-900">Dual-Perspective Clarity:</strong> The voice-note sender sees exactly which moment inspired each thought, without either party abandoning their preferred communication rhythm.
              </li>
            </ul>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
            <p className="font-semibold italic">
              “What if voice notes kept their personality, but gained the clarity of threaded conversation? Great Scott. At last, technology with manners.”
            </p>
          </div>

          {/* Prominent CTA to Read the Full Case Study */}
          <div className="pt-2">
            <a
              href="https://www.hovavnuriel.com/thoughts/reply-smarter-to-whatsapp-voice-notes"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#00A884] hover:bg-[#008f6f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Read the Full Case Study</span>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Interactive 0-Backend iOS Web Prototype
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
