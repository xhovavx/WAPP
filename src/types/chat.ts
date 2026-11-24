export type AuthorId = 'doc' | 'marty' | 'user';

export type PerspectiveMode = 'marty' | 'doc' | 'group';

export interface Author {
  id: AuthorId;
  name: string;
  fullName: string;
  avatar: string;
  color: string; // signature WhatsApp color for names & quotes
  accentColor: string;
}

export interface VoiceChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  quote: string;
  audioUrl?: string; // audio file or blob URL for this specific chapter
  waveformSnippet?: number[];
  reactions?: Record<string, number>;
}

export interface ContextualQuote {
  authorId: AuthorId;
  authorName: string;
  chapterTitle: string;
  quoteText: string;
  timeRange: string; // e.g. "0:00 - 0:38 / 4:18"
  voiceNoteId?: string;
  chapterId?: string;
  timestampStart?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  byUser: boolean;
  chapterId?: string; // reaction to specific chapter!
}

export interface Message {
  id: string;
  authorId: AuthorId;
  type: 'text' | 'voice' | 'system';
  text?: string;
  timestamp: string; // e.g. "8:21"
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: MessageReaction[];
  
  // Voice note specific fields
  voiceData?: {
    duration: number; // total duration in seconds (e.g. 258s = 4:18)
    formattedDuration: string; // "4:18"
    chapters: VoiceChapter[];
    waveform: number[]; // amplitude values 0-100
    audioUrl?: string; // real audio URL (Blob URL or narrated MP3)
    audioBlob?: Blob; // raw recorded audio blob
    activeChapterId?: string;
    isRealRecording?: boolean;
  };
  
  // Chapter-anchored reply
  contextualQuote?: ContextualQuote;
}

export interface TypingStatus {
  isTyping: boolean;
  authorName?: string;
}

export interface FeedbackData {
  rating: number; // 1 to 5
  preferredFeature: 'chapters' | 'timestamp' | 'standard' | 'all';
  usefulnessScore: number; // 1 to 10
  comments: string;
  email?: string;
  timestamp: string;
}
