import { ContextualQuote, Message } from '../types/chat';

export interface CharacterReplyResult {
  authorId: 'doc' | 'marty';
  text: string;
  typingDelayMs: number;
  reactionsToAdd?: {
    targetMessageId: string;
    emoji: string;
  };
  followUpReply?: {
    authorId: 'doc' | 'marty';
    text: string;
    typingDelayMs: number;
    reactionEmoji?: string;
  };
  chapterReply?: {
    authorId: 'doc' | 'marty';
    contextualQuote: ContextualQuote;
    text: string;
    typingDelayMs: number;
  };
}

export function generateCharacterReply(
  userMessage: Message,
  _allMessages: Message[]
): CharacterReplyResult {
  const userText = (userMessage.text || '').toLowerCase();
  const quote = userMessage.contextualQuote;

  // Case 1: User replied to a voice note chapter!
  if (quote) {
    const chapterTitle = (quote.chapterTitle || '').toLowerCase();

    if (chapterTitle.includes('lightning')) {
      return {
        authorId: 'doc',
        text: 'Great Scott! You grasp the physics! At 10:04 PM sharp, the hook must make instantaneous contact with the overhead wire!',
        typingDelayMs: 2200,
        reactionsToAdd: {
          targetMessageId: userMessage.id,
          emoji: '⚡'
        },
        followUpReply: {
          authorId: 'marty',
          text: 'Doc, you didn’t tell them about the hook being made of industrial rebar? Heavy.',
          typingDelayMs: 3800,
          reactionEmoji: '😮'
        }
      };
    }

    if (chapterTitle.includes('speed') || chapterTitle.includes('distance')) {
      return {
        authorId: 'marty',
        text: 'THANK YOU! Finally someone with common sense! 88 MPH down a street lined with lamp posts is completely nuts!',
        typingDelayMs: 2000,
        reactionsToAdd: {
          targetMessageId: userMessage.id,
          emoji: '👍'
        },
        followUpReply: {
          authorId: 'doc',
          text: 'Marty, the flux capacitor requires exactly 88 miles per hour to rupture the fabric of spacetime. It is non-negotiable!',
          typingDelayMs: 4000,
          reactionEmoji: '⚡'
        }
      };
    }

    if (chapterTitle.includes('wing') || chapterTitle.includes('warning')) {
      return {
        authorId: 'doc',
        text: 'Precisely! ‘Winging it’ is how one ends up in the Old West with a punctured fuel line and a broken flywheel!',
        typingDelayMs: 2400,
        reactionsToAdd: {
          targetMessageId: userMessage.id,
          emoji: '🤖'
        },
        followUpReply: {
          authorId: 'marty',
          text: 'See? What did I say? Voice notes are dangerous because he only gets more theatrical as time goes on!',
          typingDelayMs: 3900,
          reactionEmoji: '😂'
        }
      };
    }

    // Generic chapter reply
    return {
      authorId: 'doc',
      text: `Fascinating observation regarding "${quote.chapterTitle}". By isolating that precise segment, our collaborative efficiency multiplies exponentially!`,
      typingDelayMs: 2200,
      reactionsToAdd: {
        targetMessageId: userMessage.id,
        emoji: '❤️'
      },
      followUpReply: {
        authorId: 'marty',
        text: 'Honestly, I wish everyone sent voice note replies like this. Usually I just hear 5 minutes of noise and forget question #1.',
        typingDelayMs: 3800
      }
    };
  }

  // Case 2: User sent their own voice note!
  if (userMessage.type === 'voice' && userMessage.voiceData) {
    const chapters = userMessage.voiceData.chapters;
    const firstChapter = chapters[0];
    const secondChapter = chapters.length > 1 ? chapters[1] : firstChapter;

    return {
      authorId: 'marty',
      text: 'Whoa, Doc, listen to this! The chapter breakdown caught their main point instantly.',
      typingDelayMs: 2000,
      reactionsToAdd: {
        targetMessageId: userMessage.id,
        emoji: '⚡'
      },
      followUpReply: {
        authorId: 'doc',
        text: 'Ingenious acoustic architecture! Let me respond directly to that second point before temporal variance corrupts our log!',
        typingDelayMs: 4200,
        reactionEmoji: '🤖'
      },
      chapterReply: {
        authorId: 'doc',
        contextualQuote: {
          authorId: 'user',
          authorName: 'You',
          chapterTitle: secondChapter.title,
          quoteText: secondChapter.quote,
          timeRange: `${Math.floor(secondChapter.startTime/60)}:${(secondChapter.startTime%60).toString().padStart(2, '0')} - ${Math.floor(secondChapter.endTime/60)}:${(secondChapter.endTime%60).toString().padStart(2, '0')} / ${userMessage.voiceData.formattedDuration}`,
          voiceNoteId: userMessage.id,
          chapterId: secondChapter.id,
          timestampStart: secondChapter.startTime
        },
        text: 'A profound inquiry! Your analysis on this specific parameter aligns with my calculations for 1985!',
        typingDelayMs: 6500
      }
    };
  }

  // Case 3: Regular text message
  if (userText.includes('delorean') || userText.includes('car') || userText.includes('88')) {
    return {
      authorId: 'doc',
      text: 'The way I see it, if you’re gonna build a time machine into a car, why not do it with some style?',
      typingDelayMs: 1900,
      reactionsToAdd: {
        targetMessageId: userMessage.id,
        emoji: '⚡'
      }
    };
  }

  if (userText.includes('heavy') || userText.includes('crazy') || userText.includes('cool')) {
    return {
      authorId: 'marty',
      text: 'There’s that word again: "heavy". Why are things so heavy in the future? Is there a problem with the Earth’s gravitational pull?',
      typingDelayMs: 2000,
      reactionsToAdd: {
        targetMessageId: userMessage.id,
        emoji: '😂'
      }
    };
  }

  if (userText.includes('doc') || userText.includes('scott')) {
    return {
      authorId: 'doc',
      text: 'My mind is humming with temporal possibilities! Try tapping "Reply" on my voice note above to test chapter threading yourself.',
      typingDelayMs: 2200,
      reactionsToAdd: {
        targetMessageId: userMessage.id,
        emoji: '🤖'
      }
    };
  }

  // Default friendly back-and-forth
  return {
    authorId: 'marty',
    text: 'Doc and I were just debating whether people still send 8-minute unsegmented audio notes in your timeline. Tell me this feature fixed that!',
    typingDelayMs: 1800,
    reactionsToAdd: {
      targetMessageId: userMessage.id,
      emoji: '👍'
    },
    followUpReply: {
      authorId: 'doc',
      text: 'Indeed. Context preservation is the true hallmark of civil discourse!',
      typingDelayMs: 3600,
      reactionEmoji: '⚡'
    }
  };
}
