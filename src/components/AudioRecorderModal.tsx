import React, { useState, useEffect, useRef } from 'react';
import { formatTime, segmentVoiceNoteChapters, SpeechUtterance, generateWaveform } from '../utils/speechAudio';
import { VoiceChapter } from '../types/chat';
import { sounds } from '../utils/soundEffects';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceNote: (voiceData: {
    duration: number;
    formattedDuration: string;
    chapters: VoiceChapter[];
    waveform: number[];
    transcript: string;
    audioUrl?: string;
    audioBlob?: Blob;
    isRealRecording?: boolean;
  }) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceNote,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedBlob, setHasRecordedBlob] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([25, 40, 55, 35, 70, 50, 30, 60, 75, 45]);
  
  // Microphone error state
  const [micError, setMicError] = useState<{ name: string; message: string } | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Editable chapters state
  const [previewChapters, setPreviewChapters] = useState<VoiceChapter[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const finalDurationRef = useRef<number>(0);
  const utterancesRef = useRef<SpeechUtterance[]>([]);
  const isRecordingRef = useRef<boolean>(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      resetState();
      // Directly start recording on open (triggered from user gesture tap on mic button)
      startRealRecording();
    } else {
      cleanupAllAudio();
    }
    return () => {
      cleanupAllAudio();
    };
  }, [isOpen]);

  const resetState = () => {
    isRecordingRef.current = false;
    setSeconds(0);
    setIsRecording(false);
    setHasRecordedBlob(false);
    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setLiveTranscript('');
    setMicError(null);
    setPreviewChapters([]);
    setEditingChapterId(null);
    audioChunksRef.current = [];
    utterancesRef.current = [];
  };

  const cleanupAllAudio = () => {
    isRecordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      // Clean up all tracks so browser mic indicator turns off immediately!
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startRealRecording = async () => {
    cleanupAllAudio();
    setMicError(null);
    setIsRequestingPermission(true);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('navigator.mediaDevices.getUserMedia is not supported on this browser/environment.');
      }

      // Explicitly request real microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsRequestingPermission(false);
      sounds.playRecordStart();

      // Determine supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const blobUrl = URL.createObjectURL(finalBlob);
        setRecordedAudioBlob(finalBlob);
        setRecordedAudioUrl(blobUrl);
        setHasRecordedBlob(true);

        const duration = Math.max(1, finalDurationRef.current || seconds);
        const utterancesText = utterancesRef.current.map((u) => u.text).join(' ').trim();
        const transcriptText = liveTranscript.trim() || utterancesText || 'Live voice note recording';
        const chaps = segmentVoiceNoteChapters(utterancesRef.current, duration, transcriptText);
        setPreviewChapters(chaps);
      };

      recorder.start(200); // 200ms slice chunks
      setIsRecording(true);
      isRecordingRef.current = true;
      startTimeRef.current = Date.now();

      // Audio level visualizer with Web Audio AnalyserNode
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const renderLevels = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const sampled = Array.from(dataArray.slice(0, 10)).map((v) =>
            Math.max(12, Math.min(100, (v / 255) * 110))
          );
          setAudioLevels(sampled);
          animationFrameRef.current = requestAnimationFrame(renderLevels);
        };
        renderLevels();
      }

      // Elapsed seconds counter (up to 90 seconds / 1:30)
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= 90) {
          stopRealRecording();
        }
      }, 1000);

      // Start Web Speech API transcription if available
      startLiveTranscription();
    } catch (err: any) {
      setIsRequestingPermission(false);
      setIsRecording(false);
      cleanupAllAudio();
      setMicError({
        name: err.name || 'MicrophoneError',
        message: err.message || 'Could not access microphone.',
      });
    }
  };

  const startLiveTranscription = () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let sessionInterim = '';
        const nowSec = Math.max(0, (Date.now() - startTimeRef.current) / 1000);

        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';

          if (res.isFinal) {
            const trimmed = transcriptChunk.trim();
            if (trimmed) {
              const prevEnd =
                utterancesRef.current.length > 0
                  ? utterancesRef.current[utterancesRef.current.length - 1].endTime
                  : 0;
              const uStart = Math.max(prevEnd, Math.max(0, nowSec - 2.5));
              utterancesRef.current.push({
                text: trimmed,
                startTime: uStart,
                endTime: nowSec,
              });
            }
          } else {
            sessionInterim += transcriptChunk + ' ';
          }
        }

        const allFinalized = utterancesRef.current.map((u) => u.text).join(' ');
        const totalText = [allFinalized, sessionInterim.trim()].filter(Boolean).join(' ');
        setLiveTranscript(totalText.trim());
      };

      recognition.onerror = () => {
        // Continue recording audio even if speech recognition reports an error
      };

      recognition.onend = () => {
        // Automatically restart speech recognition while recording is still active across 90s
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (isRecordingRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            }, 100);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      // Speech recognition unsupported
    }
  };

  const stopRealRecording = () => {
    sounds.playRecordStop();
    isRecordingRef.current = false;
    const duration = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    finalDurationRef.current = duration;
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    // Release microphone tracks immediately
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleSendNote = () => {
    const finalDuration = Math.max(1, finalDurationRef.current || seconds || 2);
    const utterancesText = utterancesRef.current.map((u) => u.text).join(' ').trim();
    const transcriptText = liveTranscript.trim() || utterancesText || 'Live voice note';
    const chaptersToSend =
      previewChapters.length > 0
        ? previewChapters
        : segmentVoiceNoteChapters(utterancesRef.current, finalDuration, transcriptText);

    const waveform = generateWaveform(36, Math.floor(Math.random() * 5000));

    onSendVoiceNote({
      duration: finalDuration,
      formattedDuration: formatTime(finalDuration),
      chapters: chaptersToSend,
      waveform,
      transcript: transcriptText,
      audioUrl: recordedAudioUrl || undefined,
      audioBlob: recordedAudioBlob || undefined,
      isRealRecording: !!recordedAudioUrl,
    });

    cleanupAllAudio();
    onClose();
  };

  // Sample audio fallback when user cannot provide mic or wants quick test
  const handleUseSampleAudio = () => {
    sounds.playRecordStop();
    const sampleText =
      'Doc, Marty, check this out: I just calibrated the flux capacitor sensors. The temporal displacement will occur at 88 miles per hour without burning out the alternator. No second guessing this time!';
    const finalDuration = 21; // duration of sample audio
    const sampleUtterances: SpeechUtterance[] = [
      {
        text: 'Doc, Marty, check this out: I just calibrated the flux capacitor sensors.',
        startTime: 0,
        endTime: 6.8,
      },
      {
        text: 'The temporal displacement will occur at 88 miles per hour without burning out the alternator.',
        startTime: 7.2,
        endTime: 14.8,
      },
      {
        text: 'No second guessing this time!',
        startTime: 15.5,
        endTime: 21,
      },
    ];
    const chapters = segmentVoiceNoteChapters(sampleUtterances, finalDuration, sampleText);
    const waveform = generateWaveform(36, 1985);

    onSendVoiceNote({
      duration: finalDuration,
      formattedDuration: formatTime(finalDuration),
      chapters,
      waveform,
      transcript: sampleText,
      audioUrl: '/assets/voicenotes/marty_reply_1.mp3',
      isRealRecording: true,
    });

    cleanupAllAudio();
    onClose();
  };

  const updateChapterTitle = (chapId: string, newTitle: string) => {
    setPreviewChapters((prev) =>
      prev.map((c) => (c.id === chapId ? { ...c, title: newTitle } : c))
    );
  };

  const updateChapterQuote = (chapId: string, newQuote: string) => {
    setPreviewChapters((prev) =>
      prev.map((c) => (c.id === chapId ? { ...c, quote: newQuote } : c))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col items-center select-none animate-in slide-in-from-bottom-6 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Status Header */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <span className="flex items-center space-x-1.5 text-red-500 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Recording</span>
              </span>
            ) : hasRecordedBlob ? (
              <span className="text-[#00A884] font-bold text-xs flex items-center space-x-1">
                <span>✓ Audio Captured</span>
              </span>
            ) : (
              <span className="text-gray-500 font-medium text-xs">Microphone</span>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-gray-700">
            {formatTime(seconds)} / 1:30
          </span>
        </div>

        {/* Microphone Error State Display */}
        {micError ? (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 my-2 text-left">
            <div className="flex items-start space-x-2 text-amber-800 font-bold text-xs mb-1">
              <span>⚠️</span>
              <span>Microphone Access Blocked</span>
            </div>
            <p className="text-[11px] font-mono text-amber-900 bg-amber-100/60 p-1.5 rounded mb-2 break-all">
              {micError.name}: {micError.message}
            </p>
            <p className="text-[11px] text-amber-700 mb-3">
              Please allow microphone permissions in your browser bar, or test with the sample audio recording below.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={startRealRecording}
                className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                🔄 Retry Mic Access
              </button>
              <button
                onClick={handleUseSampleAudio}
                className="py-1.5 px-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-300 transition-colors"
              >
                Use Sample Audio
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live Audio Visualizer Bars */}
            <div className="w-full h-12 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center px-4 space-x-1.5 my-2 overflow-hidden">
              {audioLevels.map((lvl, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isRecording ? 'bg-[#007AFF]' : 'bg-gray-400'
                  }`}
                  style={{ height: `${Math.max(8, isRecording ? lvl * 0.45 : 12)}px` }}
                />
              ))}
            </div>

            {/* Audio Playback Preview if stopped */}
            {hasRecordedBlob && recordedAudioUrl && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 my-2 text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  🔊 Recorded Voice Preview
                </span>
                <audio
                  src={recordedAudioUrl}
                  controls
                  className="w-full h-8 accent-[#00A884]"
                />
              </div>
            )}

            {/* Live Speech Recognition / Text Preview */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 my-1.5 min-h-[60px] max-h-24 overflow-y-auto text-left">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 flex items-center space-x-1">
                <span>🎙️ Live Transcription (Web Speech API)</span>
              </div>
              <p className="text-xs text-gray-800 italic">
                {liveTranscript || (
                  <span className="text-gray-400">
                    {isRecording ? 'Listening... Speak now...' : 'Transcription ready'}
                  </span>
                )}
              </p>
            </div>

            {/* Generated & Editable Chapters Preview */}
            {previewChapters.length > 0 && (
              <div className="w-full text-left my-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-700">
                    ⚡ Generated Moments / Chapters ({previewChapters.length})
                  </span>
                  <span className="text-[10px] text-gray-400">Tap to edit title/quote</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {previewChapters.map((chap, idx) => (
                    <div
                      key={chap.id}
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {editingChapterId === chap.id ? (
                            <input
                              type="text"
                              value={chap.title}
                              onChange={(e) => updateChapterTitle(chap.id, e.target.value)}
                              className="border border-blue-400 px-1 py-0.5 rounded text-xs w-28 bg-white"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingChapterId(chap.id)}
                              className="cursor-pointer hover:underline truncate"
                            >
                              {chap.title}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {formatTime(chap.startTime)} - {formatTime(chap.endTime)}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={chap.quote}
                        onChange={(e) => updateChapterQuote(chap.id, e.target.value)}
                        className="w-full text-[11px] text-gray-600 italic bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:outline-none px-0.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between space-x-2 pt-3 border-t border-gray-100 mt-2">
          <button
            onClick={() => {
              sounds.playRecordStop();
              cleanupAllAudio();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          {isRecording ? (
            <button
              onClick={stopRealRecording}
              className="flex-1 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
            >
              <span>⏹ Stop Recording</span>
            </button>
          ) : (
            <button
              onClick={handleSendNote}
              disabled={isRequestingPermission}
              className="flex-1 py-2.5 rounded-xl text-white bg-[#00A884] hover:bg-[#008f6f] font-semibold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Send Voice Note</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
