import { useEffect, useState } from 'react';

export interface ActiveTrack {
  messageId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  authorAvatar?: string;
  title: string;              // Chapter title or "Voice Note"
  audioUrl: string;
  isQuotedClip: boolean;      // True if triggered from a quoted reply card
  
  // Segment bounds relative to the audio file (in seconds)
  fileStartSec: number;       // e.g. 0 for doc_chapter_1.mp3, or 12 for single blob
  fileEndSec: number;         // e.g. 30.3 for doc_chapter_1.mp3, or 25 for single blob
  segmentDuration: number;    // e.g. 38, or 13, etc.
  
  // Message timeline coordinates (for voice bubble scrubber):
  messageStartSec: number;    // e.g. 0, or 92 (1:32)
  messageEndSec: number;      // e.g. 38, or 147 (2:27)
  totalMessageDuration: number; // e.g. 258 for Doc
  
  chapterId?: string;
  isRealRecording?: boolean;
  stopAtSegmentEnd?: boolean; // strictly stop when reaching fileEndSec
  onEndedAdvance?: () => void; // for sequential playback of next chapter in full VN
}

export interface PlaybackState {
  track: ActiveTrack | null;
  isPlaying: boolean;
  currentSegmentTime: number; // 0 to segmentDuration
  currentMessageTime: number; // messageStartSec to messageEndSec
  progressPercent: number;    // 0 to 100 within segment
  messageProgressPercent: number; // 0 to 100 within full message
  duration: number;           // segmentDuration
  totalMessageDuration: number;
}

const INITIAL_STATE: PlaybackState = {
  track: null,
  isPlaying: false,
  currentSegmentTime: 0,
  currentMessageTime: 0,
  progressPercent: 0,
  messageProgressPercent: 0,
  duration: 0,
  totalMessageDuration: 0,
};

class GlobalAudioPlayerManager {
  private audio: HTMLAudioElement | null = null;
  private animFrameId: number | null = null;
  private listeners = new Set<(state: PlaybackState) => void>();
  private state: PlaybackState = { ...INITIAL_STATE };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.state.isPlaying = true;
        this.notify();
        this.startSyncLoop();
      });

      this.audio.addEventListener('pause', () => {
        this.state.isPlaying = false;
        this.stopSyncLoop();
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.handleTrackEnded();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        this.state.isPlaying = false;
        this.stopSyncLoop();
        this.notify();
      });
    }
  }

  public getState(): PlaybackState {
    return this.state;
  }

  public subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  private startSyncLoop() {
    this.stopSyncLoop();

    const loop = () => {
      if (!this.audio || !this.state.track) return;

      const track = this.state.track;
      const fileCurrent = this.audio.currentTime;

      // Check strict segment end boundary
      if (track.stopAtSegmentEnd) {
        if (fileCurrent >= track.fileEndSec - 0.05 || this.audio.ended) {
          this.handleSegmentEndReached();
          return;
        }
      }

      // Calculate elapsed time within segment
      const segmentElapsed = Math.min(
        track.segmentDuration,
        Math.max(0, fileCurrent - track.fileStartSec)
      );

      // Calculate position within overall message timeline
      const messageCurrent = Math.min(
        track.totalMessageDuration,
        track.messageStartSec + segmentElapsed
      );

      const segmentPercent =
        track.segmentDuration > 0
          ? Math.min(100, Math.max(0, (segmentElapsed / track.segmentDuration) * 100))
          : 0;

      const messagePercent =
        track.totalMessageDuration > 0
          ? Math.min(100, Math.max(0, (messageCurrent / track.totalMessageDuration) * 100))
          : 0;

      this.state = {
        ...this.state,
        isPlaying: !this.audio.paused && !this.audio.ended,
        currentSegmentTime: segmentElapsed,
        currentMessageTime: messageCurrent,
        progressPercent: segmentPercent,
        messageProgressPercent: messagePercent,
      };

      this.notify();

      if (!this.audio.paused && !this.audio.ended) {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopSyncLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private handleSegmentEndReached() {
    if (this.audio) {
      this.audio.pause();
    }
    this.stopSyncLoop();

    if (this.state.track) {
      const track = this.state.track;
      this.state = {
        ...this.state,
        isPlaying: false,
        currentSegmentTime: track.segmentDuration,
        currentMessageTime: track.messageEndSec,
        progressPercent: 100,
        messageProgressPercent:
          track.totalMessageDuration > 0
            ? Math.min(100, (track.messageEndSec / track.totalMessageDuration) * 100)
            : 100,
      };
      this.notify();

      // If full voice note playback has sequential chapter advancement
      if (!track.isQuotedClip && track.onEndedAdvance) {
        track.onEndedAdvance();
      }
    }
  }

  private handleTrackEnded() {
    this.handleSegmentEndReached();
  }

  /**
   * Play an isolated audio track or segment, immediately resetting any other playback
   */
  public playTrack(track: ActiveTrack, startSegmentOffsetSec: number = 0) {
    if (!this.audio) return;

    // Immediately stop existing playback
    this.stopSyncLoop();
    this.audio.pause();

    const clampedOffset = Math.max(
      0,
      Math.min(track.segmentDuration - 0.1, startSegmentOffsetSec)
    );
    const targetFileTime = track.fileStartSec + clampedOffset;

    // Check if source changed
    const currentSrc = this.audio.getAttribute('src');
    if (currentSrc !== track.audioUrl) {
      this.audio.src = track.audioUrl;
      this.audio.load();
    }

    this.audio.currentTime = targetFileTime;

    this.state = {
      track,
      isPlaying: true,
      currentSegmentTime: clampedOffset,
      currentMessageTime: track.messageStartSec + clampedOffset,
      progressPercent:
        track.segmentDuration > 0 ? (clampedOffset / track.segmentDuration) * 100 : 0,
      messageProgressPercent:
        track.totalMessageDuration > 0
          ? ((track.messageStartSec + clampedOffset) / track.totalMessageDuration) * 100
          : 0,
      duration: track.segmentDuration,
      totalMessageDuration: track.totalMessageDuration,
    };

    this.notify();

    this.audio
      .play()
      .then(() => {
        this.startSyncLoop();
      })
      .catch((err) => {
        console.warn('Playback request error:', err);
        this.state.isPlaying = false;
        this.notify();
      });
  }

  /**
   * Toggle between play and pause for the current track
   */
  public togglePlay() {
    if (!this.audio || !this.state.track) return;

    if (this.state.isPlaying) {
      this.audio.pause();
    } else {
      // If was at end, restart from beginning of segment
      if (this.state.currentSegmentTime >= this.state.track.segmentDuration - 0.2) {
        this.seekSegmentTime(0);
      }
      this.audio
        .play()
        .then(() => {
          this.startSyncLoop();
        })
        .catch(() => {});
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio && this.state.track) {
      this.audio.play().catch(() => {});
    }
  }

  /**
   * Seek within the active segment (in seconds, 0 to segmentDuration)
   */
  public seekSegmentTime(sec: number) {
    if (!this.audio || !this.state.track) return;

    const track = this.state.track;
    const clampedSec = Math.max(0, Math.min(track.segmentDuration, sec));
    const targetFileTime = track.fileStartSec + clampedSec;

    this.audio.currentTime = targetFileTime;

    const segmentPercent =
      track.segmentDuration > 0 ? (clampedSec / track.segmentDuration) * 100 : 0;
    const messageCurrent = track.messageStartSec + clampedSec;
    const messagePercent =
      track.totalMessageDuration > 0
        ? (messageCurrent / track.totalMessageDuration) * 100
        : 0;

    this.state = {
      ...this.state,
      currentSegmentTime: clampedSec,
      currentMessageTime: messageCurrent,
      progressPercent: segmentPercent,
      messageProgressPercent: messagePercent,
    };

    this.notify();
  }

  /**
   * Skip forward or backward by delta seconds within the segment
   */
  public skip(deltaSec: number) {
    if (!this.state.track) return;
    this.seekSegmentTime(this.state.currentSegmentTime + deltaSec);
  }

  /**
   * Completely stop audio and dismiss active player
   */
  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopSyncLoop();
    this.state = { ...INITIAL_STATE };
    this.notify();
  }
}

// Global singleton instance
export const globalAudioPlayer = new GlobalAudioPlayerManager();

/**
 * Custom React hook to subscribe to global audio player updates
 */
export function useGlobalAudio() {
  const [playback, setPlayback] = useState<PlaybackState>(globalAudioPlayer.getState());

  useEffect(() => {
    const unsubscribe = globalAudioPlayer.subscribe((newState) => {
      setPlayback(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...playback,
    player: globalAudioPlayer,
  };
}
