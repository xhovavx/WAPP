import { useState, useEffect } from 'react';
import { AUTHORS } from '../data/demoScript';

export const DEFAULT_EINSTEIN_AVATAR = '/einstein.png';
const STORAGE_KEY = 'wapp_user_custom_avatar';

// Subscribers for real-time avatar updates across all components
const listeners = new Set<(avatar: string) => void>();

function notify(avatar: string) {
  // Keep AUTHORS.user.avatar in sync immediately
  if (AUTHORS.user) {
    AUTHORS.user.avatar = avatar;
  }
  listeners.forEach((fn) => fn(avatar));
}

export function getCurrentUserAvatar(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved;
    }
  }
  return DEFAULT_EINSTEIN_AVATAR;
}

export function setUserAvatar(avatarUrl: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, avatarUrl);
  }
  notify(avatarUrl);
}

export function resetToEinsteinAvatar() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  notify(DEFAULT_EINSTEIN_AVATAR);
}

export function isCustomAvatarSet(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    return !!(saved && saved.trim() && saved !== DEFAULT_EINSTEIN_AVATAR);
  }
  return false;
}

/**
 * Resizes and center-crops an uploaded image to a crisp square data URL
 */
export function cropAndResizeImage(file: File, targetSize: number = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Center crop calculation for square aspect ratio
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * React hook that provides the current avatar and setters
 */
export function useUserAvatar() {
  const [avatar, setAvatar] = useState<string>(() => getCurrentUserAvatar());

  useEffect(() => {
    const handleUpdate = (newAvatar: string) => {
      setAvatar(newAvatar);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    avatar,
    isCustom: avatar !== DEFAULT_EINSTEIN_AVATAR,
    setAvatar: setUserAvatar,
    resetToEinstein: resetToEinsteinAvatar,
  };
}

// Initialize AUTHORS.user.avatar
if (AUTHORS.user) {
  AUTHORS.user.avatar = getCurrentUserAvatar();
}
