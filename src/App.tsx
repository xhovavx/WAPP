import { useState, useEffect, useRef } from 'react';
import { StatusBar } from './components/StatusBar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChapterScrubberBar } from './components/ChapterScrubberBar';
import { Composer } from './components/Composer';
import { AudioRecorderModal } from './components/AudioRecorderModal';
import { FeedbackDrawer } from './components/FeedbackDrawer';
import { InfoModal } from './components/InfoModal';
import { DesktopShell } from './components/DesktopShell';
import { AudioMiniPlayer } from './components/AudioMiniPlayer';
import { Message, VoiceChapter, TypingStatus, ContextualQuote, PerspectiveMode } from './types/chat';
import { SCRIPTED_STEPS, DOC_VOICE_NOTE_ID, DOC_VOICE_NOTE_MESSAGE, AUTHORS } from './data/demoScript';
import { generateCharacterReply, resetCharacterSessionHistory } from './data/characterLogic';
import { sounds } from './utils/soundEffects';
import { globalAudioPlayer } from './utils/globalAudioPlayer';

export function App() {
  // Chat messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAct1Playing, setIsAct1Playing] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({ isTyping: false });

  // Perspective state: 'marty' (Marty's POV), 'doc' (Doc's POV), 'group' (Doc & Marty on left, You on right)
  const [perspective, setPerspective] = useState<PerspectiveMode>('marty');

  // Chapter Scrubber state (docked above composer)
  const [activeVoiceMessage, setActiveVoiceMessage] = useState<Message | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<VoiceChapter | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [seekTimestamp, setSeekTimestamp] = useState<number | undefined>(undefined);

  // Modals & Drawers
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Script runner timer
  const scriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef<number>(0);

  // Start Act 1 Scripted Playback
  useEffect(() => {
    runScriptedPlayback(0);
    return () => {
      if (scriptTimeoutRef.current) clearTimeout(scriptTimeoutRef.current);
    };
  }, []);

  const runScriptedPlayback = (stepIndex: number) => {
    if (stepIndex >= SCRIPTED_STEPS.length) {
      // Act 1 complete -> Unlock interactive mode
      setIsAct1Playing(false);
      setIsUnlocked(true);
      setTypingStatus({ isTyping: false });
      setSelectedChapter(null);
      setActiveVoiceMessage(null);
      setDraftText('');
      return;
    }

    currentStepRef.current = stepIndex;
    const step = SCRIPTED_STEPS[stepIndex];

    // Show draft scrubber preview during Marty's chapter reply drafting
    if (step.draftScrubber) {
      const docMsg = SCRIPTED_STEPS.find(s => s.message.id === DOC_VOICE_NOTE_ID)?.message || DOC_VOICE_NOTE_MESSAGE;
      const targetChap = docMsg.voiceData?.chapters.find(c => c.id === step.draftScrubber?.chapterId);
      if (targetChap) {
        setActiveVoiceMessage(docMsg);
        setSelectedChapter(targetChap);
        setDraftText(step.draftScrubber.draftText);
      }
    } else {
      setSelectedChapter(null);
      setActiveVoiceMessage(null);
      setDraftText('');
    }

    // Delay before typing begins
    scriptTimeoutRef.current = setTimeout(() => {
      if (step.typingDurationMs > 0 && step.typingAuthorName) {
        setTypingStatus({
          isTyping: true,
          authorName: step.typingAuthorName,
        });
      }

      // Duration of typing before message lands
      scriptTimeoutRef.current = setTimeout(() => {
        setTypingStatus({ isTyping: false });
        setSelectedChapter(null);
        setActiveVoiceMessage(null);
        setDraftText('');

        // Play appropriate sound
        if (step.message.type === 'voice') {
          sounds.playReceive();
        } else if (step.message.authorId === 'marty') {
          sounds.playSent();
        } else {
          sounds.playReceive();
        }

        // Add message
        setMessages((prev) => {
          if (prev.some((m) => m.id === step.message.id)) return prev;
          return [...prev, step.message];
        });

        // Advance to next step
        runScriptedPlayback(stepIndex + 1);
      }, step.typingDurationMs);
    }, step.delayBeforeTypingMs);
  };

  // Skip Act 1 Intro and immediately unlock interactive mode
  const handleSkipIntro = () => {
    if (scriptTimeoutRef.current) clearTimeout(scriptTimeoutRef.current);
    setTypingStatus({ isTyping: false });
    setSelectedChapter(null);
    setActiveVoiceMessage(null);
    setDraftText('');

    // Load all Act 1 messages immediately
    const allScripted = SCRIPTED_STEPS.map((s) => s.message);
    setMessages(allScripted);
    setIsAct1Playing(false);
    setIsUnlocked(true);
    sounds.playSent();
  };

  // Replay Act 1 Intro
  const handleReplayIntro = () => {
    if (scriptTimeoutRef.current) clearTimeout(scriptTimeoutRef.current);
    resetCharacterSessionHistory();
    setMessages([]);
    setIsAct1Playing(true);
    setIsUnlocked(false);
    setTypingStatus({ isTyping: false });
    setSelectedChapter(null);
    setActiveVoiceMessage(null);
    setDraftText('');
    runScriptedPlayback(0);
  };

  // Open docked chapter scrubber when tapping "Reply" on a chapter
  const handleOpenChapterReply = (chapter: VoiceChapter, voiceMsg: Message) => {
    setActiveVoiceMessage(voiceMsg);
    setSelectedChapter(chapter);
    setPlaybackTime(chapter.startTime);
  };

  // Send message from user
  const handleSendMessage = (text: string) => {
    let contextualQuote: ContextualQuote | undefined = undefined;

    if (selectedChapter && activeVoiceMessage) {
      const dur = activeVoiceMessage.voiceData?.formattedDuration || '4:18';
      const startStr = `${Math.floor(selectedChapter.startTime / 60)}:${(selectedChapter.startTime % 60).toString().padStart(2, '0')}`;
      const endStr = `${Math.floor(selectedChapter.endTime / 60)}:${(selectedChapter.endTime % 60).toString().padStart(2, '0')}`;

      contextualQuote = {
        authorId: activeVoiceMessage.authorId,
        authorName: activeVoiceMessage.authorId === 'doc' ? 'Emmett "Doc" Brown' : 'Marty McFly',
        chapterTitle: selectedChapter.title,
        quoteText: selectedChapter.quote,
        timeRange: `${startStr} - ${endStr} / ${dur}`,
        voiceNoteId: activeVoiceMessage.id,
        chapterId: selectedChapter.id,
        timestampStart: selectedChapter.startTime,
      };
    }

    const now = new Date();
    const timeFormatted = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    const userMsg: Message = {
      id: `user-msg-${Date.now()}`,
      authorId: perspective === 'marty' ? 'marty' : perspective === 'doc' ? 'doc' : 'user',
      type: 'text',
      text,
      timestamp: timeFormatted,
      status: 'read',
      contextualQuote,
    };

    // Append message
    setMessages((prev) => [...prev, userMsg]);
    // Clear scrubber & draft
    setSelectedChapter(null);
    setActiveVoiceMessage(null);
    setDraftText('');

    // Trigger Doc & Marty character simulation
    triggerCharacterResponse(userMsg);
  };

  // Handle newly recorded user voice note
  const handleSendRecordedVoiceNote = (voiceData: any) => {
    sounds.playSent();
    const now = new Date();
    const timeFormatted = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    const voiceMsg: Message = {
      id: `user-voice-${Date.now()}`,
      authorId: perspective === 'marty' ? 'marty' : perspective === 'doc' ? 'doc' : 'user',
      type: 'voice',
      timestamp: timeFormatted,
      status: 'read',
      voiceData,
    };

    setMessages((prev) => [...prev, voiceMsg]);

    // Character response to user's voice note!
    triggerCharacterResponse(voiceMsg);
  };

  // Trigger contextual, witty in-character replies from Doc and Marty
  const triggerCharacterResponse = (triggerMessage: Message) => {
    const replyPlan = generateCharacterReply(triggerMessage, messages);

    // 1. First character starts typing
    setTimeout(() => {
      const charName = replyPlan.authorId === 'doc' ? 'Emmett "Doc" Brown' : 'Marty McFly';
      setTypingStatus({
        isTyping: true,
        authorName: `${charName} is typing...`,
      });

      // Deliver first reply
      setTimeout(() => {
        setTypingStatus({ isTyping: false });
        sounds.playReceive();

        const now = new Date();
        const timeFormatted = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

        const charMsg: Message = {
          id: `char-reply-${Date.now()}`,
          authorId: replyPlan.authorId,
          type: 'text',
          text: replyPlan.text,
          timestamp: timeFormatted,
          status: 'read',
        };

        setMessages((prev) => [...prev, charMsg]);

        // Add reaction to user's message if configured
        if (replyPlan.reactionsToAdd) {
          handleAddReaction(replyPlan.reactionsToAdd.targetMessageId, replyPlan.reactionsToAdd.emoji);
        }

        // 2. Deliver follow-up reply if planned
        if (replyPlan.followUpReply) {
          setTimeout(() => {
            const secondAuthor = replyPlan.followUpReply?.authorId === 'doc' ? 'Emmett "Doc" Brown' : 'Marty McFly';
            setTypingStatus({
              isTyping: true,
              authorName: `${secondAuthor} is typing...`,
            });

            setTimeout(() => {
              setTypingStatus({ isTyping: false });
              sounds.playReceive();

              const followUpMsg: Message = {
                id: `char-followup-${Date.now()}`,
                authorId: replyPlan.followUpReply!.authorId,
                type: 'text',
                text: replyPlan.followUpReply!.text,
                timestamp: timeFormatted,
                status: 'read',
              };

              setMessages((prev) => [...prev, followUpMsg]);

              if (replyPlan.followUpReply?.reactionEmoji) {
                handleAddReaction(charMsg.id, replyPlan.followUpReply.reactionEmoji);
              }

              // 3. Deliver chapter-anchored reply to user's voice note if planned!
              if (replyPlan.chapterReply) {
                setTimeout(() => {
                  setTypingStatus({
                    isTyping: true,
                    authorName: 'Emmett "Doc" Brown is replying to your chapter...',
                  });

                  setTimeout(() => {
                    setTypingStatus({ isTyping: false });
                    sounds.playReceive();

                    const chapterReplyMsg: Message = {
                      id: `char-chap-reply-${Date.now()}`,
                      authorId: 'doc',
                      type: 'text',
                      text: replyPlan.chapterReply!.text,
                      timestamp: timeFormatted,
                      status: 'read',
                      contextualQuote: replyPlan.chapterReply!.contextualQuote,
                    };

                    setMessages((prev) => [...prev, chapterReplyMsg]);
                  }, 2400);
                }, 2000);
              }
            }, 1800);
          }, 1500);
        }
      }, replyPlan.typingDelayMs);
    }, 600);
  };

  // Add emoji reaction to message or chapter
  const handleAddReaction = (messageId: string, emoji: string, chapterId?: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;

        const currentReactions = m.reactions ? [...m.reactions] : [];
        const existingIdx = currentReactions.findIndex((r) => r.emoji === emoji && r.chapterId === chapterId);

        if (existingIdx !== -1) {
          currentReactions[existingIdx] = {
            ...currentReactions[existingIdx],
            count: currentReactions[existingIdx].count + 1,
            byUser: true,
          };
        } else {
          currentReactions.push({
            emoji,
            count: 1,
            byUser: true,
            chapterId,
          });
        }

        return {
          ...m,
          reactions: currentReactions,
        };
      })
    );
  };

  // Jump to quote card in original voice note and play strictly that isolated segment
  const handleQuoteCardClick = (
    voiceNoteId?: string,
    timestampStart?: number,
    quote?: ContextualQuote
  ) => {
    const targetMsg = messages.find((m) => m.id === (voiceNoteId || DOC_VOICE_NOTE_ID));
    if (!targetMsg || targetMsg.type !== 'voice') return;

    const chapters = targetMsg.voiceData?.chapters || [];
    const targetChap =
      chapters.find(
        (c) =>
          (quote?.chapterId && c.id === quote.chapterId) ||
          (timestampStart !== undefined &&
            timestampStart >= c.startTime &&
            timestampStart <= c.endTime)
      ) || chapters[0];

    const author = AUTHORS[targetMsg.authorId] || AUTHORS.doc;
    const isReal = !!targetMsg.voiceData?.isRealRecording;
    const totalDuration = targetMsg.voiceData?.duration || 258;

    if (targetChap) {
      const chapDuration = targetChap.endTime - targetChap.startTime;
      const targetAudioUrl =
        targetChap.audioUrl ||
        targetMsg.voiceData?.audioUrl ||
        '/assets/voicenotes/doc_chapter_1.mp3';

      const fileStartSec = isReal ? targetChap.startTime : 0;
      const fileEndSec = isReal ? targetChap.endTime : chapDuration;

      // Play strictly this isolated segment and automatically pause at endTime
      globalAudioPlayer.playTrack({
        messageId: targetMsg.id,
        authorId: targetMsg.authorId,
        authorName: author.name,
        authorColor: author.color,
        authorAvatar: author.avatar,
        title: targetChap.title,
        audioUrl: targetAudioUrl,
        isQuotedClip: true,
        fileStartSec,
        fileEndSec,
        segmentDuration: chapDuration,
        messageStartSec: targetChap.startTime,
        messageEndSec: targetChap.endTime,
        totalMessageDuration: totalDuration,
        chapterId: targetChap.id,
        isRealRecording: isReal,
        stopAtSegmentEnd: true, // STRICT ISOLATION: Stop as soon as currentTime reaches endTime
      });
    } else {
      // Non-segmented voice note: play only this message
      const audioUrl =
        targetMsg.voiceData?.audioUrl ||
        (targetMsg.authorId === 'marty'
          ? '/assets/voicenotes/marty_reply_1.mp3'
          : '/assets/voicenotes/doc_chapter_1.mp3');

      globalAudioPlayer.playTrack({
        messageId: targetMsg.id,
        authorId: targetMsg.authorId,
        authorName: author.name,
        authorColor: author.color,
        authorAvatar: author.avatar,
        title: 'Voice Note',
        audioUrl,
        isQuotedClip: true,
        fileStartSec: 0,
        fileEndSec: totalDuration,
        segmentDuration: totalDuration,
        messageStartSec: 0,
        messageEndSec: totalDuration,
        totalMessageDuration: totalDuration,
        stopAtSegmentEnd: true,
      });
    }
  };

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  return (
    <DesktopShell
      isPlayingIntro={isAct1Playing}
      onReplayIntro={handleReplayIntro}
      onSkipIntro={handleSkipIntro}
      onOpenInfo={() => setIsInfoOpen(true)}
      onOpenFeedback={() => setIsFeedbackOpen(true)}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      perspective={perspective}
      onSelectPerspective={setPerspective}
    >
      {/* iOS Status Bar & Dynamic Island */}
      <StatusBar />

      {/* WhatsApp iOS Navigation Header with Perspective Switcher */}
      <ChatHeader
        typingStatus={typingStatus}
        perspective={perspective}
        onSelectPerspective={setPerspective}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Main WhatsApp Chat Message Stream */}
      <MessageList
        messages={messages}
        currentUserId={perspective === 'marty' ? 'marty' : perspective === 'doc' ? 'doc' : 'user'}
        perspective={perspective}
        typingStatus={typingStatus}
        onOpenChapterReply={handleOpenChapterReply}
        onAddReaction={handleAddReaction}
        onReplyToMessage={(msg) => {
          if (msg.type === 'voice' && msg.voiceData?.chapters?.length) {
            handleOpenChapterReply(msg.voiceData.chapters[0], msg);
          } else {
            setDraftText(`Replying to ${msg.authorId === 'doc' ? 'Doc' : 'Marty'}: `);
          }
        }}
        onQuoteCardClick={handleQuoteCardClick}
        seekTimestamp={seekTimestamp}
      />

      {/* Bottom Floating Mini-Player Bar inside iPhone frame */}
      <AudioMiniPlayer />

      {/* Docked iOS Chapter Scrubber Bar above Composer */}
      {selectedChapter && activeVoiceMessage && (
        <ChapterScrubberBar
          voiceMessage={activeVoiceMessage}
          selectedChapter={selectedChapter}
          onSelectChapter={(chap) => {
            setSelectedChapter(chap);
            setPlaybackTime(chap.startTime);
            setSeekTimestamp(chap.startTime);
          }}
          onClose={() => {
            setSelectedChapter(null);
            setActiveVoiceMessage(null);
          }}
          currentPlaybackTime={playbackTime}
          onSeek={(sec) => {
            setPlaybackTime(sec);
            setSeekTimestamp(sec);
          }}
        />
      )}

      {/* Bottom iOS Composer & Voice Note Mic Button */}
      <Composer
        onSendMessage={handleSendMessage}
        onOpenAudioRecorder={() => {
          globalAudioPlayer.stop();
          setIsAudioRecorderOpen(true);
        }}
        activeChapterReply={selectedChapter}
        draftText={draftText}
        onDraftChange={setDraftText}
        isUnlocked={isUnlocked}
      />

      {/* Modals & Drawers */}
      <AudioRecorderModal
        isOpen={isAudioRecorderOpen}
        onClose={() => setIsAudioRecorderOpen(false)}
        onSendVoiceNote={handleSendRecordedVoiceNote}
      />

      <FeedbackDrawer
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </DesktopShell>
  );
}

export default App;
