import { Author, Message } from '../types/chat';
import { generateWaveform } from '../utils/speechAudio';

export const AUTHORS: Record<string, Author> = {
  doc: {
    id: 'doc',
    name: 'Emmett "Doc" Brown',
    fullName: 'Dr. Emmett Brown',
    avatar: '/assets/doc_avatar.png',
    color: '#D9366E', // Doc's pink / magenta accent in screenshots
    accentColor: '#D9366E',
  },
  marty: {
    id: 'marty',
    name: 'Marty McFly',
    fullName: 'Marty McFly',
    avatar: '/assets/marty_avatar.png',
    color: '#0E8040', // Marty's WhatsApp green accent
    accentColor: '#0E8040',
  },
  user: {
    id: 'user',
    name: 'You',
    fullName: 'You',
    avatar: '/einstein.png',
    color: '#007AFF', // iOS blue
    accentColor: '#007AFF',
  }
};

export const DOC_VOICE_NOTE_ID = 'msg-doc-voicenote';

// Doc's 4:18 (258 seconds) voice note waveform and chapters
export const DOC_VOICE_NOTE_MESSAGE: Message = {
  id: DOC_VOICE_NOTE_ID,
  authorId: 'doc',
  type: 'voice',
  timestamp: '8:29',
  status: 'read',
  voiceData: {
    duration: 258, // 4 mins 18 secs
    formattedDuration: '4:18',
    waveform: generateWaveform(46, 1985),
    audioUrl: '/assets/voicenotes/doc_chapter_1.mp3',
    chapters: [
      {
        id: 'chap-1',
        title: 'Lightning plan',
        startTime: 0,
        endTime: 38,
        quote: 'If the lightning strike hits the cable a fraction of a second too early or too late, the entire maneuver fails.',
        audioUrl: '/assets/voicenotes/doc_chapter_1.mp3'
      },
      {
        id: 'chap-2',
        title: 'Speed and distance',
        startTime: 92,
        endTime: 147,
        quote: 'The DeLorean also has to be at the exact right speed before the strike.',
        audioUrl: '/assets/voicenotes/doc_chapter_2.mp3'
      },
      {
        id: 'chap-3',
        title: 'No winging it',
        startTime: 198,
        endTime: 258,
        quote: 'No wandering off. No second guessing. No asking whether we can ‘wing it this time.’',
        audioUrl: '/assets/voicenotes/doc_chapter_3.mp3'
      }
    ]
  }
};

export interface ScriptStep {
  message: Message;
  delayBeforeTypingMs: number;
  typingDurationMs: number;
  typingAuthorName?: string;
  draftScrubber?: {
    chapterId: string;
    chapterTitle: string;
    timeRange: string;
    draftText: string;
  };
}

export const SCRIPTED_STEPS: ScriptStep[] = [
  // 1. Marty asks question
  {
    delayBeforeTypingMs: 600,
    typingDurationMs: 1200,
    typingAuthorName: 'Marty McFly',
    message: {
      id: 'msg-1',
      authorId: 'marty',
      type: 'text',
      text: 'Doc, are you seriously telling me this thing can run on lightning again?',
      timestamp: '8:21',
      status: 'read'
    }
  },
  // 2. Doc sends 4:18 voice note
  {
    delayBeforeTypingMs: 1400,
    typingDurationMs: 1600,
    typingAuthorName: 'Emmett "Doc" Brown is recording audio...',
    message: DOC_VOICE_NOTE_MESSAGE
  },
  // 3. Marty replies to Chapter 1: Lightning plan
  {
    delayBeforeTypingMs: 1600,
    typingDurationMs: 2200,
    typingAuthorName: 'Marty McFly',
    draftScrubber: {
      chapterId: 'chap-1',
      chapterTitle: 'Lightning plan',
      timeRange: '0:00 - 0:38',
      draftText: 'Doc, you say ‘absolute precision’ like that’s totally something I’m famous for. Also, ‘no improvisation’ feels a little personal.'
    },
    message: {
      id: 'msg-reply-1',
      authorId: 'marty',
      type: 'text',
      text: 'Doc, you say ‘absolute precision’ like that’s totally something I’m famous for. Also, ‘no improvisation’ feels a little personal.',
      timestamp: '8:36',
      status: 'read',
      contextualQuote: {
        authorId: 'doc',
        authorName: 'Emmett "Doc" Brown',
        chapterTitle: 'Lightning plan',
        quoteText: 'If the lightning strike hits the cable a fraction of a second too early or too late, the entire maneuver fails.',
        timeRange: '0:00 - 0:38 / 4:18',
        voiceNoteId: DOC_VOICE_NOTE_ID,
        chapterId: 'chap-1',
        timestampStart: 0
      }
    }
  },
  // 4. Marty replies to Chapter 2: Speed and distance
  {
    delayBeforeTypingMs: 1600,
    typingDurationMs: 2200,
    typingAuthorName: 'Marty McFly',
    draftScrubber: {
      chapterId: 'chap-2',
      chapterTitle: 'Speed and distance',
      timeRange: '1:32 - 2:27',
      draftText: 'Okay, but if the speedometer is the whole thing, maybe we should not build the entire future on a car I already don’t fully trust.'
    },
    message: {
      id: 'msg-reply-2',
      authorId: 'marty',
      type: 'text',
      text: 'Okay, but if the speedometer is the whole thing, maybe we should not build the entire future on a car I already don’t fully trust.',
      timestamp: '8:42',
      status: 'read',
      contextualQuote: {
        authorId: 'doc',
        authorName: 'Emmett "Doc" Brown',
        chapterTitle: 'Speed and distance',
        quoteText: 'The DeLorean also has to be at the exact right speed before the strike.',
        timeRange: '1:32 - 2:27 / 4:18',
        voiceNoteId: DOC_VOICE_NOTE_ID,
        chapterId: 'chap-2',
        timestampStart: 92
      }
    }
  },
  // 5. Marty replies to Chapter 3: No winging it
  {
    delayBeforeTypingMs: 1600,
    typingDurationMs: 2200,
    typingAuthorName: 'Marty McFly',
    draftScrubber: {
      chapterId: 'chap-3',
      chapterTitle: 'No winging it',
      timeRange: '3:18 - 4:18',
      draftText: 'That last part is exactly why voice notes are dangerous. You keep getting more dramatic the longer you talk.'
    },
    message: {
      id: 'msg-reply-3',
      authorId: 'marty',
      type: 'text',
      text: 'That last part is exactly why voice notes are dangerous. You keep getting more dramatic the longer you talk.',
      timestamp: '8:43',
      status: 'read',
      contextualQuote: {
        authorId: 'doc',
        authorName: 'Emmett "Doc" Brown',
        chapterTitle: 'no winging it',
        quoteText: 'No wandering off. No second guessing. No asking whether we can ‘wing it this time.’',
        timeRange: '3:18 - 4:18 / 4:18',
        voiceNoteId: DOC_VOICE_NOTE_ID,
        chapterId: 'chap-3',
        timestampStart: 198
      }
    }
  },
  // 6. Marty adds conclusion text
  {
    delayBeforeTypingMs: 1200,
    typingDurationMs: 1500,
    typingAuthorName: 'Marty McFly',
    message: {
      id: 'msg-6',
      authorId: 'marty',
      type: 'text',
      text: 'I’m just saying, with this new feature, I can actually reply to the part I understood.',
      timestamp: '8:46',
      status: 'read'
    }
  },
  // 7. Doc replies
  {
    delayBeforeTypingMs: 1500,
    typingDurationMs: 1900,
    typingAuthorName: 'Emmett "Doc" Brown',
    message: {
      id: 'msg-7',
      authorId: 'doc',
      type: 'text',
      text: 'Remarkable. A communication breakthrough tailored to human inconsistency.',
      timestamp: '8:52',
      status: 'read'
    }
  },
  // 8. Marty banter + Doc reacts with heart ❤️
  {
    delayBeforeTypingMs: 1200,
    typingDurationMs: 1400,
    typingAuthorName: 'Marty McFly',
    message: {
      id: 'msg-8',
      authorId: 'marty',
      type: 'text',
      text: 'Yeah, finally an app that gets us.',
      timestamp: '8:54',
      status: 'read',
      reactions: [
        { emoji: '❤️', count: 1, byUser: false }
      ]
    }
  },
  // 9. Doc's famous closing line + robot reaction 🤖
  {
    delayBeforeTypingMs: 1400,
    typingDurationMs: 1700,
    typingAuthorName: 'Emmett "Doc" Brown',
    message: {
      id: 'msg-9',
      authorId: 'doc',
      type: 'text',
      text: 'Great Scott. At last, technology with manners.',
      timestamp: '9:08',
      status: 'read',
      reactions: [
        { emoji: '🤖', count: 1, byUser: false }
      ]
    }
  },
  // 10. WhatsApp system pill: You joined the group
  {
    delayBeforeTypingMs: 800,
    typingDurationMs: 0,
    message: {
      id: 'msg-join',
      authorId: 'user',
      type: 'system',
      text: 'You joined the group',
      timestamp: '9:09'
    }
  }
];
