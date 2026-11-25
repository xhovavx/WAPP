import { VoiceChapter } from '../types/chat';

// Format seconds into "m:ss"
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export interface SpeechUtterance {
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

// Common conversational fillers and stopwords to remove when extracting concise chapter titles
const FILLER_WORDS = new Set([
  'um', 'uh', 'er', 'ah', 'like', 'you', 'know', 'i', 'mean', 'so', 'actually',
  'basically', 'and', 'the', 'a', 'an', 'to', 'in', 'it', 'that', 'this', 'is',
  'was', 'are', 'we', 'my', 'your', 'they', 'them', 'of', 'for', 'on', 'with',
  'as', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'just',
  'really', 'well', 'hey', 'hi', 'hello', 'there', 'ok', 'okay', 'right',
  'gonna', 'wanna', 'gotta', 'let', 'see', 'look', 'tell', 'me', 'us'
]);

// Linguistic topic-transition cues that often indicate a new chapter or topic shift
const TOPIC_CUES = [
  'first of all', 'first', 'secondly', 'second', 'third', 'next', 'also',
  'another thing', 'what about', 'how about', 'by the way', 'anyway',
  'listen', 'the thing is', 'the problem is', 'so basically', 'furthermore',
  'in addition', 'on the other hand', 'finally', 'lastly', 'check this out',
  'doc', 'marty', 'one more thing', 'wait a minute'
];

/**
 * Generate a concise, punchy 2-4 word chapter title from a text snippet
 */
export function extractConciseChapterTitle(snippet: string, fallbackIdx: number = 1): string {
  if (!snippet || !snippet.trim()) {
    return fallbackIdx === 1 ? 'Opening Thought' : fallbackIdx === 2 ? 'Main Point' : 'Final Summary';
  }

  // Clean punctuation and split into lowercase words
  const words = snippet
    .replace(/[^\w\s-]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // Filter out fillers and short stopwords
  const meaningfulWords = words.filter(
    (w) => !FILLER_WORDS.has(w) && w.length > 2 && !/^\d+$/.test(w)
  );

  // If we found meaningful content words, pick 2 to 3 words
  if (meaningfulWords.length >= 2) {
    const selected = meaningfulWords.slice(0, Math.min(meaningfulWords.length, 3));
    return selected
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // If only 1 strong word found
  if (meaningfulWords.length === 1) {
    const word = meaningfulWords[0].charAt(0).toUpperCase() + meaningfulWords[0].slice(1);
    const suffixes = ['Discussion', 'Plan', 'Note', 'Update', 'Detail'];
    const suffix = suffixes[(fallbackIdx - 1) % suffixes.length];
    return `${word} ${suffix}`;
  }

  // Fallback to phrase-based defaults
  const phraseDefaults = [
    'Opening Context',
    'Core Proposal',
    'Technical Details',
    'Critical Precautions',
    'Execution Plan',
    'Closing Remarks'
  ];
  return phraseDefaults[(fallbackIdx - 1) % phraseDefaults.length];
}

/**
 * Segment recorded voice notes into distinct topic chapters based on:
 * 1. Timestamped SpeechRecognition utterances
 * 2. Natural pause gaps between utterances (> 1.2s - 1.8s)
 * 3. Topic transition cues (e.g. "also", "next", "what about", "doc")
 * 4. Punctuation & sentence boundaries
 * 5. Clean duration fallback if speech recognition was silent or unavailable
 * Supports up to 90s (1:30) voice notes with 3 to 5+ distinct chapters
 */
export function segmentVoiceNoteChapters(
  utterances: SpeechUtterance[],
  totalDurationSeconds: number,
  fallbackTranscript?: string
): VoiceChapter[] {
  const dur = Math.max(2, Math.round(totalDurationSeconds));

  // Determine target chapter count based on duration (up to 90 seconds / 1:30)
  const targetChapters =
    dur >= 70 ? 5 : dur >= 45 ? 4 : dur >= 20 ? 3 : dur >= 8 ? 2 : 1;

  // Case 1: We have timestamped speech utterances
  if (utterances && utterances.length > 0) {
    // If recording is very short (under 8s) or only 1 short utterance
    if (dur <= 8 && utterances.length <= 2) {
      const fullQuote = utterances.map((u) => u.text).join(' ').trim();
      return [
        {
          id: 'chap-1',
          title: extractConciseChapterTitle(fullQuote, 1),
          startTime: 0,
          endTime: dur,
          quote: fullQuote || 'Short voice message',
          summary: fullQuote ? `Overview: "${fullQuote.slice(0, 80)}"` : 'Quick voice note',
        }
      ];
    }

    // Identify candidate split points based on pause gaps and topic cues
    const candidateSplitIndices: number[] = [];

    for (let i = 0; i < utterances.length - 1; i++) {
      const current = utterances[i];
      const next = utterances[i + 1];

      const pauseGap = next.startTime - current.endTime;
      const nextTextLower = next.text.toLowerCase().trim();

      const hasTopicCue = TOPIC_CUES.some((cue) => nextTextLower.startsWith(cue));
      const endsWithSentencePunctuation = /[.!?]$/.test(current.text.trim());

      // If there is a natural pause (>1.2s) OR a topic cue after a pause (>0.6s) OR sentence ending (>0.9s)
      if (pauseGap >= 1.2 || (hasTopicCue && pauseGap >= 0.6) || (endsWithSentencePunctuation && pauseGap >= 0.9)) {
        candidateSplitIndices.push(i + 1);
      }
    }

    // Pick well-distributed split indices up to (targetChapters - 1)
    const selectedSplits: number[] = [];
    const minDistance = Math.max(1, Math.floor(utterances.length / (targetChapters + 1)));

    for (const idx of candidateSplitIndices) {
      if (
        selectedSplits.length < targetChapters - 1 &&
        (selectedSplits.length === 0 || idx - selectedSplits[selectedSplits.length - 1] >= minDistance)
      ) {
        selectedSplits.push(idx);
      }
    }

    // If candidate pauses alone didn't reach targetChapters - 1 and we have enough utterances for 3-5+ chapters:
    if (selectedSplits.length < targetChapters - 1 && utterances.length >= targetChapters) {
      for (let k = 1; k < targetChapters; k++) {
        const idealIdx = Math.round((utterances.length * k) / targetChapters);
        const isFarEnough = selectedSplits.every((s) => Math.abs(s - idealIdx) >= minDistance);
        if (isFarEnough && idealIdx > 0 && idealIdx < utterances.length) {
          selectedSplits.push(idealIdx);
        }
      }
      selectedSplits.sort((a, b) => a - b);
    }

    // If still empty and multiple utterances exist:
    if (selectedSplits.length === 0 && utterances.length >= 2) {
      selectedSplits.push(Math.floor(utterances.length / 2));
    }

    // Build chapters from selected split indices
    if (selectedSplits.length > 0) {
      const chapters: VoiceChapter[] = [];
      let prevIdx = 0;
      const allSplitPoints = [...selectedSplits, utterances.length];

      allSplitPoints.forEach((splitIdx, chapIdx) => {
        const slice = utterances.slice(prevIdx, splitIdx);
        if (slice.length > 0) {
          const sliceStart = chapIdx === 0 ? 0 : Math.round(slice[0].startTime);
          const sliceEnd =
            chapIdx === allSplitPoints.length - 1
              ? dur
              : Math.min(dur, Math.round(slice[slice.length - 1].endTime));
          const quote = slice.map((u) => u.text).join(' ').trim();
          const title = extractConciseChapterTitle(quote, chapIdx + 1);

          chapters.push({
            id: `chap-${chapIdx + 1}`,
            title,
            startTime: sliceStart,
            endTime: Math.max(sliceStart + 1, sliceEnd),
            quote,
            summary: quote ? `Discussion regarding ${title.toLowerCase()}` : `Chapter ${chapIdx + 1}`,
          });
        }
        prevIdx = splitIdx;
      });

      // Ensure contiguous time intervals
      for (let k = 0; k < chapters.length - 1; k++) {
        chapters[k].endTime = chapters[k + 1].startTime;
      }
      if (chapters.length > 0) {
        chapters[0].startTime = 0;
        chapters[chapters.length - 1].endTime = dur;
        return chapters;
      }
    }
  }

  // Case 2: Fallback using full transcript text sentences (if available)
  const cleanTranscript = (fallbackTranscript || '').trim();

  if (cleanTranscript && cleanTranscript.length > 10) {
    const sentences = cleanTranscript
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    // 5 chapters for 70s+ recordings with 5+ sentences
    if (sentences.length >= 5 && dur >= 70) {
      const sliceSize = Math.ceil(sentences.length / 5);
      const s1 = sentences.slice(0, sliceSize).join(' ');
      const s2 = sentences.slice(sliceSize, sliceSize * 2).join(' ');
      const s3 = sentences.slice(sliceSize * 2, sliceSize * 3).join(' ');
      const s4 = sentences.slice(sliceSize * 3, sliceSize * 4).join(' ');
      const s5 = sentences.slice(sliceSize * 4).join(' ');

      const p1 = Math.round(dur * 0.2);
      const p2 = Math.round(dur * 0.4);
      const p3 = Math.round(dur * 0.6);
      const p4 = Math.round(dur * 0.8);

      return [
        { id: 'chap-1', title: extractConciseChapterTitle(s1, 1), startTime: 0, endTime: p1, quote: s1, summary: `Context: ${extractConciseChapterTitle(s1, 1)}` },
        { id: 'chap-2', title: extractConciseChapterTitle(s2, 2), startTime: p1, endTime: p2, quote: s2, summary: `Proposal: ${extractConciseChapterTitle(s2, 2)}` },
        { id: 'chap-3', title: extractConciseChapterTitle(s3, 3), startTime: p2, endTime: p3, quote: s3, summary: `Details: ${extractConciseChapterTitle(s3, 3)}` },
        { id: 'chap-4', title: extractConciseChapterTitle(s4, 4), startTime: p3, endTime: p4, quote: s4, summary: `Plan: ${extractConciseChapterTitle(s4, 4)}` },
        { id: 'chap-5', title: extractConciseChapterTitle(s5, 5), startTime: p4, endTime: dur, quote: s5, summary: `Conclusion: ${extractConciseChapterTitle(s5, 5)}` },
      ];
    }

    // 4 chapters for 45s+ recordings with 4+ sentences
    if (sentences.length >= 4 && dur >= 45) {
      const sliceSize = Math.ceil(sentences.length / 4);
      const s1 = sentences.slice(0, sliceSize).join(' ');
      const s2 = sentences.slice(sliceSize, sliceSize * 2).join(' ');
      const s3 = sentences.slice(sliceSize * 2, sliceSize * 3).join(' ');
      const s4 = sentences.slice(sliceSize * 3).join(' ');

      const p1 = Math.round(dur * 0.25);
      const p2 = Math.round(dur * 0.5);
      const p3 = Math.round(dur * 0.75);

      return [
        { id: 'chap-1', title: extractConciseChapterTitle(s1, 1), startTime: 0, endTime: p1, quote: s1, summary: `Context: ${extractConciseChapterTitle(s1, 1)}` },
        { id: 'chap-2', title: extractConciseChapterTitle(s2, 2), startTime: p1, endTime: p2, quote: s2, summary: `Proposal: ${extractConciseChapterTitle(s2, 2)}` },
        { id: 'chap-3', title: extractConciseChapterTitle(s3, 3), startTime: p2, endTime: p3, quote: s3, summary: `Details: ${extractConciseChapterTitle(s3, 3)}` },
        { id: 'chap-4', title: extractConciseChapterTitle(s4, 4), startTime: p3, endTime: dur, quote: s4, summary: `Summary: ${extractConciseChapterTitle(s4, 4)}` },
      ];
    }

    // 3 chapters for 20s+ recordings with 3+ sentences
    if (sentences.length >= 3 && dur >= 20) {
      const p1 = Math.round(dur * 0.33);
      const p2 = Math.round(dur * 0.68);
      const s1 = sentences.slice(0, Math.ceil(sentences.length / 3)).join(' ');
      const s2 = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil((sentences.length * 2) / 3)).join(' ');
      const s3 = sentences.slice(Math.ceil((sentences.length * 2) / 3)).join(' ');

      return [
        {
          id: 'chap-1',
          title: extractConciseChapterTitle(s1, 1),
          startTime: 0,
          endTime: p1,
          quote: s1,
          summary: `Initial thoughts on ${extractConciseChapterTitle(s1, 1).toLowerCase()}`,
        },
        {
          id: 'chap-2',
          title: extractConciseChapterTitle(s2, 2),
          startTime: p1,
          endTime: p2,
          quote: s2,
          summary: `Key point concerning ${extractConciseChapterTitle(s2, 2).toLowerCase()}`,
        },
        {
          id: 'chap-3',
          title: extractConciseChapterTitle(s3, 3),
          startTime: p2,
          endTime: dur,
          quote: s3,
          summary: `Wrap up on ${extractConciseChapterTitle(s3, 3).toLowerCase()}`,
        }
      ];
    }

    if (sentences.length >= 2 && dur > 8) {
      const half = Math.round(dur / 2);
      const s1 = sentences[0];
      const s2 = sentences.slice(1).join(' ');

      return [
        {
          id: 'chap-1',
          title: extractConciseChapterTitle(s1, 1),
          startTime: 0,
          endTime: half,
          quote: s1,
          summary: `First point: ${extractConciseChapterTitle(s1, 1).toLowerCase()}`,
        },
        {
          id: 'chap-2',
          title: extractConciseChapterTitle(s2, 2),
          startTime: half,
          endTime: dur,
          quote: s2,
          summary: `Second point: ${extractConciseChapterTitle(s2, 2).toLowerCase()}`,
        }
      ];
    }
  }

  // Case 3: Pure duration/silence fallback (zero transcript or silence)
  if (dur <= 8) {
    return [
      {
        id: 'chap-1',
        title: 'Quick Voice Note',
        startTime: 0,
        endTime: dur,
        quote: 'Audio message recording',
        summary: 'Brief spoken update',
      }
    ];
  }

  if (dur <= 20) {
    const half = Math.round(dur / 2);
    return [
      {
        id: 'chap-1',
        title: 'Initial Context',
        startTime: 0,
        endTime: half,
        quote: 'Initial thoughts & context',
        summary: 'Opening segment of recording',
      },
      {
        id: 'chap-2',
        title: 'Main Update',
        startTime: half,
        endTime: dur,
        quote: 'Core message & questions',
        summary: 'Primary conclusion and questions',
      }
    ];
  }

  // 45s to 70s: 4 distinct chapters
  if (dur >= 45 && dur < 70) {
    const t1 = Math.round(dur * 0.25);
    const t2 = Math.round(dur * 0.5);
    const t3 = Math.round(dur * 0.75);
    return [
      {
        id: 'chap-1',
        title: 'Opening Context',
        startTime: 0,
        endTime: t1,
        quote: 'Initial question & background observations',
        summary: 'Context and opening situation',
      },
      {
        id: 'chap-2',
        title: 'Core Parameters',
        startTime: t1,
        endTime: t2,
        quote: 'Technical plan & timing specifics',
        summary: 'Key parameters and details',
      },
      {
        id: 'chap-3',
        title: 'Technical Verification',
        startTime: t2,
        endTime: t3,
        quote: 'Precautions & contingency measures',
        summary: 'System checks and variables',
      },
      {
        id: 'chap-4',
        title: 'Action Directives',
        startTime: t3,
        endTime: dur,
        quote: 'Next steps & execution roadmap',
        summary: 'Actionable steps and directives',
      }
    ];
  }

  // 70s to 90s: 5 distinct chapters across full 90-second duration
  if (dur >= 70) {
    const t1 = Math.round(dur * 0.2);
    const t2 = Math.round(dur * 0.4);
    const t3 = Math.round(dur * 0.6);
    const t4 = Math.round(dur * 0.8);
    return [
      {
        id: 'chap-1',
        title: 'Opening Context',
        startTime: 0,
        endTime: t1,
        quote: 'Initial observations & background situation',
        summary: 'Opening scene and timeline overview',
      },
      {
        id: 'chap-2',
        title: 'Core Hypothesis',
        startTime: t1,
        endTime: t2,
        quote: 'Technical parameters & energy requirements',
        summary: 'System mechanics and primary plan',
      },
      {
        id: 'chap-3',
        title: 'Critical Variables',
        startTime: t2,
        endTime: t3,
        quote: 'Speed and distance calculation checks',
        summary: 'Fine-tuning variables and margins of error',
      },
      {
        id: 'chap-4',
        title: 'Contingency Plan',
        startTime: t3,
        endTime: t4,
        quote: 'What to do if synchronization wavers',
        summary: 'Failsafe protocols and alternatives',
      },
      {
        id: 'chap-5',
        title: 'Final Summary',
        startTime: t4,
        endTime: dur,
        quote: 'Final warnings & no winging it',
        summary: 'Closing instructions and sign-off',
      }
    ];
  }

  // 20s to 45s: 3 distinct chapters
  const t1 = Math.round(dur * 0.33);
  const t2 = Math.round(dur * 0.68);
  return [
    {
      id: 'chap-1',
      title: 'Opening Proposal',
      startTime: 0,
      endTime: t1,
      quote: 'Initial question & background observations',
      summary: 'Context and opening situation',
    },
    {
      id: 'chap-2',
      title: 'Core Parameters',
      startTime: t1,
      endTime: t2,
      quote: 'Technical plan & timing specifics',
      summary: 'Key parameters and details',
    },
    {
      id: 'chap-3',
      title: 'Closing Thoughts',
      startTime: t2,
      endTime: dur,
      quote: 'Final warnings & next steps',
      summary: 'Summary and conclusion',
    }
  ];
}

// Keep backwards-compatibility helper for any existing callers
export function segmentTranscriptIntoChapters(
  transcript: string,
  totalDurationSeconds: number
): VoiceChapter[] {
  return segmentVoiceNoteChapters([], totalDurationSeconds, transcript);
}

// Generate realistic pseudo-waveform
export function generateWaveform(barCount: number = 42, seed: number = 42): number[] {
  const bars: number[] = [];
  let s = seed;
  for (let i = 0; i < barCount; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    // Bell curve modulation for natural voice shape
    const centerFactor = Math.sin((i / barCount) * Math.PI);
    const height = Math.floor(20 + rnd * 65 * centerFactor + Math.random() * 15);
    bars.push(Math.max(15, Math.min(95, height)));
  }
  return bars;
}
