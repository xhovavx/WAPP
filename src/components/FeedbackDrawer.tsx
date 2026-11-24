import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [preferredFeature, setPreferredFeature] = useState<'chapters' | 'timestamp' | 'all' | 'standard'>('chapters');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const web3Key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    const targetEmail = import.meta.env.VITE_FEEDBACK_EMAIL || 'hovavnuriel@gmail.com';

    let sentViaApi = false;

    if (web3Key) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: web3Key,
            subject: `Feedback: WhatsApp "Reply by Moment" (${rating} ⭐)`,
            from_name: name.trim() || 'Anonymous Reviewer',
            email: email.trim() || 'noreply@whatsapp-demo.local',
            rating: `${rating} / 5 stars`,
            preferred_style: preferredFeature,
            message: comments.trim() || '(No comments provided)',
          }),
        });
        if (response.ok) {
          sentViaApi = true;
        }
      } catch {
        // Fall back to mailto if network blocked
      }
    }

    // If Web3Forms key is not configured or API request didn't succeed, open pre-filled mailto
    if (!sentViaApi && !web3Key) {
      const subject = encodeURIComponent(`Feedback: WhatsApp "Reply by Moment" Concept (${rating} stars)`);
      const body = encodeURIComponent(
        `Hi Hovav,\n\nHere is my feedback on the "Reply by moment, not by message" concept:\n\n` +
        `• Rating: ${rating} / 5 stars\n` +
        `• Preferred Reply Style: ${preferredFeature}\n` +
        `• Comments:\n${comments.trim() || '(None)'}\n\n` +
        `From: ${name.trim() || 'Anonymous'} (${email.trim() || 'No email provided'})`
      );
      window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_blank');
    }

    setIsSubmitting(false);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xl">💡</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Share Concept Feedback
              </h2>
              <p className="text-xs text-gray-500">
                “Reply by moment, not by message”
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-green-100 text-[#00A884] rounded-full flex items-center justify-center text-2xl mb-3">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Thanks! Your feedback was sent to Hovav.
            </h3>
            <p className="text-xs text-gray-600 max-w-xs mb-6">
              Your perspective helps shape the future of asynchronous audio messaging.
            </p>

            <div className="w-full flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full sm:flex-1 py-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs active:scale-98"
              >
                Back to Chat
              </button>

              <a
                href="https://www.hovavnuriel.com"
                target="_self"
                className="w-full sm:flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition-colors border border-gray-200 flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <span>Visit Hovav's Website</span>
                <span className="text-gray-500">→</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-left">
            {/* Question 1: Rating */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                1. Rating for Chapter-Based Voice Replies
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
                <span className="text-xs font-semibold text-gray-500 ml-2">
                  {rating === 5 ? 'Brilliant concept' : rating >= 4 ? 'Great addition' : 'Interesting idea'}
                </span>
              </div>
            </div>

            {/* Question 2: Preferred Style */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                2. Which reply style feels most natural to you?
              </label>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  { id: 'chapters', label: '📌 Chapter/Topic segment quote cards (Hovav’s Concept)' },
                  { id: 'timestamp', label: '⏱️ Timestamp range scrubber only' },
                  { id: 'all', label: '⚡ Hybrid (Auto-chapters + custom scrub range)' },
                  { id: 'standard', label: '💬 Current WhatsApp standard (whole message only)' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      preferredFeature === opt.id
                        ? 'bg-green-50 border-[#00A884] font-medium text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feature"
                      checked={preferredFeature === opt.id}
                      onChange={() => setPreferredFeature(opt.id as any)}
                      className="accent-[#00A884]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments / UX Thoughts */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                3. Your Thoughts or Suggestions
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="What did you think of jumping to exact moments? Any tweaks you would make?"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            </div>

            {/* Optional Contact Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A884]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A884]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center space-x-1.5"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                <span>✉️</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
