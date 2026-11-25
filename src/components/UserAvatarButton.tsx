import React, { useRef, useState } from 'react';
import { useUserAvatar, cropAndResizeImage } from '../utils/userAvatar';

interface UserAvatarButtonProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
  allowReset?: boolean;
}

export const UserAvatarButton: React.FC<UserAvatarButtonProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const { avatar, isCustom, setAvatar, resetToEinstein } = useUserAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const dimClass =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-14 h-14'
      : 'w-9 h-9';

  const badgeDim = size === 'sm' ? 'w-3.5 h-3.5 -bottom-0.5 -right-0.5' : 'w-4 h-4 -bottom-0.5 -right-0.5';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const squareDataUrl = await cropAndResizeImage(file, 128);
      setAvatar(squareDataUrl);
    } catch (err) {
      console.error('Error cropping avatar:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className={`relative inline-block select-none ${className}`}>
        {/* Hidden File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Clickable Avatar Button */}
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className={`relative ${dimClass} rounded-full overflow-hidden border border-black/10 shadow-xs group focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-transform active:scale-95 cursor-pointer block`}
          title="Click to view avatar"
        >
          <img
            src={avatar}
            alt="You (Einstein)"
            className="w-full h-full object-cover rounded-full"
          />

          {/* Hover Camera Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
            </svg>
          </div>

          {/* Loading Spinner */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* Camera Icon Badge */}
        {showBadge && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreviewModal(true);
            }}
            className={`absolute ${badgeDim} bg-[#007AFF] hover:bg-[#0056b3] text-white rounded-full flex items-center justify-center shadow-md border border-white cursor-pointer transition-transform active:scale-90`}
            title="View or change avatar"
          >
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
              <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
            </svg>
          </button>
        )}
      </div>

      {/* Enlarged Avatar Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center max-w-[280px] sm:max-w-xs w-full text-center relative select-none animate-in zoom-in-95 duration-200">
            {/* Close Button (×) */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              title="Close preview"
            >
              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Enlarged Circular Avatar (~200x200px) matching Marty & Doc's circular framing */}
            <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#007AFF]/25 shadow-lg mb-3.5 bg-gray-50 flex-shrink-0">
              <img
                src={avatar}
                alt="You (Einstein)"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Title & Short Label */}
            <h3 className="text-base font-bold text-gray-900 mb-1">You</h3>
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 font-medium mb-4 leading-snug">
              {isCustom ? 'Your custom avatar' : "Einstein — Doc's first time traveler 🐶"}
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 px-4 bg-[#007AFF] hover:bg-[#0062cc] active:scale-98 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
                <span>Change photo</span>
              </button>

              {isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    resetToEinstein();
                  }}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>🐶 Reset to Einstein</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
