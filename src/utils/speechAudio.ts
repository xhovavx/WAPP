import { VoiceChapter } from '../types/chat';

// Format seconds into "m:ss"
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Segment transcript or duration into 2-3 timestamped chapters
export function segmentTranscriptIntoChapters(
  transcript: string,
  totalDurationSeconds: number
): VoiceChapter[] {
  const clean = transcript.trim();
  const dur = Math.max(2, Math.round(totalDurationSeconds));

  // If no transcript provided, create 2 or 3 duration-based chapters
  if (!clean || clean.length < 5) {
    if (dur <= 10) {
      return [
        {
          id: 'chap-1',
          title: 'Opening Note',
          startTime: 0,
          endTime: dur,
          quote: 'Audio message clip',
        }
      ];
    } else if (dur <= 24) {
      const mid = Math.round(dur / 2);
      return [
        {
          id: 'chap-1',
          title: 'First Thought',
          startTime: 0,
          endTime: mid,
          quote: 'Initial thoughts & context',
        },
        {
          id: 'chap-2',
          title: 'Main Point',
          startTime: mid,
          endTime: dur,
          quote: 'Summary & conclusions',
        }
      ];
    } else {
      const p1 = Math.round(dur * 0.33);
      const p2 = Math.round(dur * 0.68);
      return [
        {
          id: 'chap-1',
          title: 'Opening Context',
          startTime: 0,
          endTime: p1,
          quote: 'Initial question & background',
        },
        {
          id: 'chap-2',
          title: 'Core Proposal',
          startTime: p1,
          endTime: p2,
          quote: 'Technical plan & timing',
        },
        {
          id: 'chap-3',
          title: 'Closing Thoughts',
          startTime: p2,
          endTime: dur,
          quote: 'Next steps & warnings',
        }
      ];
    }
  }

  // Split into sentences
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);

  if (sentences.length <= 1) {
    const title = extractTitleFromSnippet(clean);
    return [
      {
        id: 'chap-1',
        title,
        startTime: 0,
        endTime: dur,
        quote: clean,
      }
    ];
  }

  if (sentences.length === 2) {
    const half = Math.max(1, Math.round(dur / 2));
    return [
      {
        id: 'chap-1',
        title: extractTitleFromSnippet(sentences[0]),
        startTime: 0,
        endTime: half,
        quote: sentences[0],
      },
      {
        id: 'chap-2',
        title: extractTitleFromSnippet(sentences[1]),
        startTime: half,
        endTime: dur,
        quote: sentences[1],
      }
    ];
  }

  // 3 or more sentences -> 3 chapters
  const part1Sentences = sentences.slice(0, Math.ceil(sentences.length / 3));
  const part2Sentences = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil((sentences.length * 2) / 3));
  const part3Sentences = sentences.slice(Math.ceil((sentences.length * 2) / 3));

  const t1 = Math.max(1, Math.round(dur * 0.33));
  const t2 = Math.max(t1 + 1, Math.round(dur * 0.72));
  const t3 = dur;

  const quote1 = part1Sentences.join(' ');
  const quote2 = part2Sentences.join(' ');
  const quote3 = part3Sentences.join(' ');

  return [
    {
      id: 'chap-1',
      title: extractTitleFromSnippet(quote1),
      startTime: 0,
      endTime: t1,
      quote: quote1,
    },
    {
      id: 'chap-2',
      title: extractTitleFromSnippet(quote2),
      startTime: t1,
      endTime: t2,
      quote: quote2,
    },
    {
      id: 'chap-3',
      title: extractTitleFromSnippet(quote3),
      startTime: t2,
      endTime: t3,
      quote: quote3,
    }
  ];
}

function extractTitleFromSnippet(snippet: string): string {
  const words = snippet.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (words.length === 0 || !words[0]) return 'Moment Note';
  
  // Pick 2-4 keywords
  const titleWords = words.slice(0, Math.min(words.length, 3));
  const title = titleWords.join(' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
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
