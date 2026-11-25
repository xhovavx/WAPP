import { ContextualQuote, Message, VoiceChapter } from '../types/chat';

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

// Session memory to prevent repeating the same response patterns or phrasings
const usedResponseKeys = new Set<string>();

export function resetCharacterSessionHistory() {
  usedResponseKeys.clear();
}

/**
 * Helper to pick an unused template variant from a list
 */
function pickUnusedVariant<T extends { key: string }>(variants: T[]): T {
  const unused = variants.filter((v) => !usedResponseKeys.has(v.key));
  const pool = unused.length > 0 ? unused : variants;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  usedResponseKeys.add(picked.key);
  return picked;
}

/**
 * Context-aware response generator for Doc Brown & Marty McFly
 */
export function generateCharacterReply(
  userMessage: Message,
  _allMessages: Message[]
): CharacterReplyResult {
  const userText = (userMessage.text || '').trim();
  const lowerText = userText.toLowerCase();
  const quote = userMessage.contextualQuote;
  const isQuestion = userText.includes('?') || /^(why|how|what|can|could|is|will|do|should)/i.test(lowerText);

  // =========================================================================
  // SCENARIO 1: User Replied to a Voice Note Chapter (Contextual Quote)
  // =========================================================================
  if (quote) {
    const chapterTitle = (quote.chapterTitle || '').toLowerCase();

    // 1A. Lightning plan chapter
    if (chapterTitle.includes('lightning')) {
      const variants = [
        {
          key: 'quote-lightning-1',
          martyText: `Doc, see?! They get it. You're talking about catching a raw lightning bolt like it’s a softball catch. Heavy!`,
          docText: `Great Scott! You grasp the absolute physics! At 10:04 PM sharp, 1.21 Gigawatts must be channeled instantaneously through the contact hook. Zero margin for error!`,
          martyEmoji: '⚡',
          docEmoji: '😮'
        },
        {
          key: 'quote-lightning-2',
          martyText: `Right?! One millisecond off and we vaporize Main Street instead of going home. Glad someone else is looking at the odds here.`,
          docText: `The temporal synchronization is non-negotiable! If the discharge disperses through the grounding rod early, the displacement coils will starve of kinetic energy!`,
          martyEmoji: '⚡',
          docEmoji: '🤖'
        },
        {
          key: 'quote-lightning-3',
          martyText: `Doc talks about 1.21 gigawatts like it's a household toaster. I’m just relieved you understand how insane that cable maneuver really is.`,
          docText: `Fascinating observation! Your focus on that specific moment validates my calculations for the high-voltage transfer switch atop the Hill Valley Courthouse!`,
          martyEmoji: '👍',
          docEmoji: '⚡'
        }
      ];
      const picked = pickUnusedVariant(variants);
      return {
        authorId: 'marty',
        text: picked.martyText,
        typingDelayMs: 1600,
        reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
        followUpReply: {
          authorId: 'doc',
          text: picked.docText,
          typingDelayMs: 3400,
          reactionEmoji: picked.docEmoji
        }
      };
    }

    // 1B. Speed and distance chapter
    if (chapterTitle.includes('speed') || chapterTitle.includes('distance')) {
      const variants = [
        {
          key: 'quote-speed-1',
          martyText: `THANK YOU! Finally someone with common sense! 88 MPH down a street lined with lamp posts is completely nuts!`,
          docText: `Marty, the flux capacitor requires exactly 88 miles per hour to rupture the fabric of spacetime. It is a fundamental chronal constant!`,
          martyEmoji: '👍',
          docEmoji: '🚗'
        },
        {
          key: 'quote-speed-2',
          martyText: `See?! That speedometer is basically the only thing standing between us and turning into an accordion against the courthouse facade.`,
          docText: `Precisely! Notice how isolating that speed parameter clarifies the engineering challenge? We must ensure the speedometer cable has zero mechanical slack!`,
          martyEmoji: '😮',
          docEmoji: '⚡'
        },
        {
          key: 'quote-speed-3',
          martyText: `Doc always skips past the 'accelerate down a dark street' part like that’s the easy part of the evening.`,
          docText: `The stainless steel construction minimizes temporal drag coefficient! At 88 miles per hour, displacement occurs in under four milliseconds!`,
          martyEmoji: '😂',
          docEmoji: '🤖'
        }
      ];
      const picked = pickUnusedVariant(variants);
      return {
        authorId: 'marty',
        text: picked.martyText,
        typingDelayMs: 1500,
        reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
        followUpReply: {
          authorId: 'doc',
          text: picked.docText,
          typingDelayMs: 3600,
          reactionEmoji: picked.docEmoji
        }
      };
    }

    // 1C. No winging it / Final warning chapter
    if (chapterTitle.includes('wing') || chapterTitle.includes('warning')) {
      const variants = [
        {
          key: 'quote-wing-1',
          martyText: `Told you! Voice notes are dangerous because Doc only gets more theatrical as time goes on!`,
          docText: `Absolute rigor is the lifeblood of temporal exploration! When manipulating the continuum, improvisation is indistinguishable from catastrophe!`,
          martyEmoji: '😂',
          docEmoji: '🤖'
        },
        {
          key: 'quote-wing-2',
          martyText: `Doc’s version of 'not winging it' still involves a radioactive car and a lightning storm, but hey, at least we have rules now.`,
          docText: `Methodical execution is our only defense against temporal paradox! Winging it is how one ends up in 1885 with a broken fuel line!`,
          martyEmoji: '👍',
          docEmoji: '⚡'
        },
        {
          key: 'quote-wing-3',
          martyText: `Man, you nailed that closing chapter. I was already dreading a five-minute lecture on consequences.`,
          docText: `By George! Notice the elegance of replying to my final admonition directly! We have achieved communication with manners at last!`,
          martyEmoji: '❤️',
          docEmoji: '❤️'
        }
      ];
      const picked = pickUnusedVariant(variants);
      return {
        authorId: 'marty',
        text: picked.martyText,
        typingDelayMs: 1500,
        reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
        followUpReply: {
          authorId: 'doc',
          text: picked.docText,
          typingDelayMs: 3500,
          reactionEmoji: picked.docEmoji
        }
      };
    }

    // 1D. Generic chapter reply
    const genericVariants = [
      {
        key: 'quote-generic-1',
        martyText: `That quote card makes things so clear. Replying to "${quote.chapterTitle}" means I didn't have to guess which part you were talking about!`,
        docText: `Fascinating observation regarding "${quote.chapterTitle}". By isolating that exact moment, collaborative efficiency multiplies exponentially!`,
        emoji: '👍'
      },
      {
        key: 'quote-generic-2',
        martyText: `Wait, look at how clean that is—Doc, see why chapter replies beat re-listening to the whole four-minute recording?`,
        docText: `Remarkable! You have anchored your premise directly to timestamp ${quote.timeRange}. This completely eliminates asynchronous cognitive overhead!`,
        emoji: '❤️'
      },
      {
        key: 'quote-generic-3',
        martyText: `Doc and I usually spend ten texts figuring out what the other guy meant. This moment reply saved us at least half an hour.`,
        docText: `Astounding! The preservation of context across time and media formats is truly the hallmark of civilized discourse!`,
        emoji: '⚡'
      }
    ];
    const picked = pickUnusedVariant(genericVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1600,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.emoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3400
      }
    };
  }

  // =========================================================================
  // SCENARIO 2: User Sent Their Own Recorded Voice Note
  // =========================================================================
  if (userMessage.type === 'voice' && userMessage.voiceData) {
    const chapters: VoiceChapter[] = userMessage.voiceData.chapters || [];
    const chap1 = chapters[0] || { title: 'Opening Thought', quote: 'Spoken note', startTime: 0, endTime: 5 };
    const chap2 = chapters.length > 1 ? chapters[1] : chap1;

    const voiceNoteVariants = [
      {
        key: 'vn-response-1',
        martyText: `Whoa, listen to that! The automatic breakdown caught your point on "${chap1.title}" instantly. Doc, check this out!`,
        docText: `Remarkable acoustic segmentation! Your inquiry in "${chap2.title}" touches on a critical temporal variable. Let me respond directly to that moment!`,
        martyEmoji: '⚡',
        docQuoteText: chap2.quote,
        docChapterReplyText: `Your deductions regarding "${chap2.title}" are brilliant! If the temporal feedback resonates at this exact frequency, our calculations remain sound.`
      },
      {
        key: 'vn-response-2',
        martyText: `Doc, did you see how it split their voice note into "${chap1.title}" and "${chap2.title}"? Even I could follow along without getting lost!`,
        docText: `Ingenious architectural clarity! By converting conversational audio into navigable moments, you have preserved both spontaneity and structured context!`,
        martyEmoji: '😮',
        docQuoteText: chap1.quote,
        docChapterReplyText: `Regarding your observation in "${chap1.title}": I had contemplated that exact scenario while calibrating the flux sensors!`
      },
      {
        key: 'vn-response-3',
        martyText: `Heavy! You made a really sharp point right around "${chap2.title}". Usually when people send audio notes I tune out after ten seconds, but this actually works.`,
        docText: `Fascinating! Notice how the time range (${Math.floor(chap2.startTime / 60)}:${(chap2.startTime % 60).toString().padStart(2, '0')} - ${Math.floor(chap2.endTime / 60)}:${(chap2.endTime % 60).toString().padStart(2, '0')}) anchors the dialogue with scientific certainty!`,
        martyEmoji: '👍',
        docQuoteText: chap2.quote,
        docChapterReplyText: `A profound insight into "${chap2.title}"! We must integrate this directly into our pre-flight checklist!`
      }
    ];

    const picked = pickUnusedVariant(voiceNoteVariants);

    const dur = userMessage.voiceData.formattedDuration || '0:20';
    const sStart = `${Math.floor(chap2.startTime / 60)}:${(chap2.startTime % 60).toString().padStart(2, '0')}`;
    const sEnd = `${Math.floor(chap2.endTime / 60)}:${(chap2.endTime % 60).toString().padStart(2, '0')}`;

    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1800,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3800,
        reactionEmoji: '🤖'
      },
      chapterReply: {
        authorId: 'doc',
        contextualQuote: {
          authorId: 'user',
          authorName: 'You',
          chapterTitle: chap2.title,
          quoteText: picked.docQuoteText,
          timeRange: `${sStart} - ${sEnd} / ${dur}`,
          voiceNoteId: userMessage.id,
          chapterId: chap2.id,
          timestampStart: chap2.startTime
        },
        text: picked.docChapterReplyText,
        typingDelayMs: 6000
      }
    };
  }

  // =========================================================================
  // SCENARIO 3: Regular Typed Text Messages (Semantic & Keyword Responsive)
  // =========================================================================

  // 3A. DeLorean / Car / 88 MPH / Speed
  if (lowerText.includes('delorean') || lowerText.includes('car') || lowerText.includes('88') || lowerText.includes('speed') || lowerText.includes('drive')) {
    const carVariants = [
      {
        key: 'text-car-1',
        martyText: `Driving that car is terrifying enough at 30 MPH. Doc insisted the gull-wing doors look cool, but good luck opening them in a tight parking spot!`,
        docText: `The stainless steel construction provides an impenetrable Faraday cage during temporal transit! Form and function in perfect equilibrium!`,
        martyEmoji: '🚗'
      },
      {
        key: 'text-car-2',
        martyText: `You think the DeLorean is cool until Doc tells you to floor it toward a brick wall while watching a digital alarm clock.`,
        docText: `The vehicle's internal combustion engine is merely the accelerator; the true heart is the flux capacitor drawing 1.21 gigawatts of pure chronal energy!`,
        martyEmoji: '😂'
      },
      {
        key: 'text-car-3',
        martyText: `Doc, see? People in the future still respect the car. Just don't let anyone borrow the keys without checking the plutonium gauges first.`,
        docText: `Precisely, Marty! If one is to construct a time machine into an automobile, why not do it with unparalleled style?`,
        martyEmoji: '⚡'
      }
    ];
    const picked = pickUnusedVariant(carVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1500,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3200
      }
    };
  }

  // 3B. Lightning / Power / Clock Tower / Weather
  if (lowerText.includes('lightning') || lowerText.includes('power') || lowerText.includes('storm') || lowerText.includes('clock') || lowerText.includes('tower')) {
    const lightningVariants = [
      {
        key: 'text-power-1',
        martyText: `Man, waiting for lightning in a thunderstorm while Doc is hanging off a clock tower flagpole is not my idea of a chill Saturday night.`,
        docText: `Nature provides the only power source capable of discharging 1.21 gigawatts outside of enriched nuclear material! Timing is our solitary imperative!`,
        martyEmoji: '⚡'
      },
      {
        key: 'text-power-2',
        martyText: `Every time lightning flashes now, I instinctively look around for a hook and a set of jumper cables.`,
        docText: `The atmospheric density preceding a localized electrical storm alters temporal permeability! We must remain poised for instantaneous activation!`,
        martyEmoji: '😮'
      }
    ];
    const picked = pickUnusedVariant(lightningVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1600,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3400
      }
    };
  }

  // 3C. Heavy / Crazy / Future / Time / Paradox
  if (lowerText.includes('heavy') || lowerText.includes('future') || lowerText.includes('past') || lowerText.includes('paradox') || lowerText.includes('crazy')) {
    const heavyVariants = [
      {
        key: 'text-heavy-1',
        martyText: `There’s that word again: 'heavy'. Doc always asks me if there's something wrong with the Earth’s gravitational field in the future!`,
        docText: `Chronal paradoxes exert immense psychological weight on the observer! Your intuition senses the delicate fragility of the continuum!`,
        martyEmoji: '😂'
      },
      {
        key: 'text-heavy-2',
        martyText: `You want to hear crazy? Try explaining to your teenage parents that you're just a kid from the future who plays guitar.`,
        docText: `The continuum possesses an inherent elastic resistance to perturbation, yet reckless interference can unravel three generations of genealogy!`,
        martyEmoji: '🎸'
      }
    ];
    const picked = pickUnusedVariant(heavyVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1500,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3200
      }
    };
  }

  // 3D. Questions (? / How / Can we / What if)
  if (isQuestion) {
    const questionVariants = [
      {
        key: 'text-q-1',
        martyText: `Honestly, good question. Whenever I ask Doc something like that, he grabs three chalkboards and talks for two hours.`,
        docText: `A penetrating inquiry! Theoretical feasibility depends entirely on whether we can insulate the chronal displacement field from ambient interference!`,
        martyEmoji: '🤔'
      },
      {
        key: 'text-q-2',
        martyText: `Wait, are you asking if we can actually pull that off? Because with Doc, the answer is usually 'yes, but wear safety goggles'.`,
        docText: `The parameters are stringent, but with calibrated instrumentation, the probability of catastrophic variance remains below three percent!`,
        martyEmoji: '👍'
      },
      {
        key: 'text-q-3',
        martyText: `Doc, they're asking the real question here. Are we sure this whole setup won't blow the fuses on the entire block?`,
        docText: `Fuses are replaceable; history is not! Your query reflects an admirable scientific skepticism that I wholeheartedly endorse!`,
        martyEmoji: '⚡'
      }
    ];
    const picked = pickUnusedVariant(questionVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1500,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3300
      }
    };
  }

  // 3E. Voice notes / Audio / Messaging / Features
  if (lowerText.includes('voice') || lowerText.includes('audio') || lowerText.includes('whatsapp') || lowerText.includes('app') || lowerText.includes('message') || lowerText.includes('feature')) {
    const appVariants = [
      {
        key: 'text-app-1',
        martyText: `Right?! Doc sends these four-minute audio essays that feel like a college lecture. Having chapter scrubbers is the only reason we're still talking!`,
        docText: `Context preservation across speech and typography is the crowning achievement of modern communication! We have conquered communicative ambiguity!`,
        martyEmoji: '❤️'
      },
      {
        key: 'text-app-2',
        martyText: `I used to hear ten seconds of a voice note, get distracted by my guitar, and forget the question. Now I can just tap the moment that actually matters.`,
        docText: `Indeed! Why compel humanity to compress multidimensional vocal thoughts into flat text when the interface itself can organize the spoken chapters?`,
        martyEmoji: '⚡'
      }
    ];
    const picked = pickUnusedVariant(appVariants);
    return {
      authorId: 'marty',
      text: picked.martyText,
      typingDelayMs: 1500,
      reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
      followUpReply: {
        authorId: 'doc',
        text: picked.docText,
        typingDelayMs: 3400
      }
    };
  }

  // 3F. General fallback banter (Dynamic & Non-repetitive)
  const defaultVariants = [
    {
      key: 'text-default-1',
      martyText: `Doc and I were just debating whether people still send unsegmented eight-minute voice notes in your timeline. Please tell me this feature fixed that!`,
      docText: `Indeed! To deliver an uninterrupted monologue without structural signposts is to invite cognitive fatigue! Manners must accompany technology!`,
      martyEmoji: '👍'
    },
    {
      key: 'text-default-2',
      martyText: `Hey, as long as nobody calls me chicken, I’m down to test whatever new feature you throw into this chat. What do you want to try next?`,
      docText: `Your participation provides invaluable observational data! Every interaction tests our temporal coordination matrix with remarkable fidelity!`,
      martyEmoji: '🤖'
    },
    {
      key: 'text-default-3',
      martyText: `Look, I'm just a kid trying to get through high school without altering history, but I gotta say, this group chat is pretty wild.`,
      docText: `Never underestimate the power of clear, threaded communication! The future is whatever we make it—so let's make it easy to follow!`,
      martyEmoji: '❤️'
    },
    {
      key: 'text-default-4',
      martyText: `Wait, did you hear that? I thought I heard the DeLorean's starter clicking outside. Doc, is the alternator behaving?`,
      docText: `The temporal flux coils are resting comfortably at ambient temperature! Continue the discourse—our communication channels are fully synchronized!`,
      martyEmoji: '⚡'
    }
  ];

  const picked = pickUnusedVariant(defaultVariants);
  return {
    authorId: 'marty',
    text: picked.martyText,
    typingDelayMs: 1600,
    reactionsToAdd: { targetMessageId: userMessage.id, emoji: picked.martyEmoji },
    followUpReply: {
      authorId: 'doc',
      text: picked.docText,
      typingDelayMs: 3200
    }
  };
}
