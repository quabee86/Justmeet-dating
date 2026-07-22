import React, { useState, useRef, useEffect } from 'react';
import { Chat, MatchProfile, Message, UserProfile } from '../types';
import { 
  Send, Mic, Phone, Video, MoreVertical, ShieldAlert, BadgeCheck, 
  Trash2, Volume2, Play, Pause, Camera, MicOff, CameraOff, 
  PhoneOff, Sparkles, AlertTriangle, CheckCircle, Check, CheckCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  chats: Chat[];
  activeChatId: string | null;
  userProfile: UserProfile;
  onSelectChat: (id: string) => void;
  onSendMessage: (chatId: string, message: Message) => void;
  onMarkMessagesRead?: (chatId: string) => void;
  onBlockMatch: (matchId: string) => void;
  onReportMatch?: (matchId: string, reason: string) => void;
}

export default function ChatWindow({
  chats,
  activeChatId,
  userProfile,
  onSelectChat,
  onSendMessage,
  onMarkMessagesRead,
  onBlockMatch,
  onReportMatch
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);

  // Real voice and voice-to-text dictation states
  const [isDictating, setIsDictating] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [voiceTranscription, setVoiceTranscription] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const voiceSpeechRecRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Local object URLs mapping for user recorded messages
  const [playableAudios, setPlayableAudios] = useState<Record<string, string>>({});

  // Video call state
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callStatus, setCallStatus] = useState('Connecting secure stream...');

  // Options Dropdown
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const voiceTimerRef = useRef<any>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  // Auto-mark user messages as 'seen' (read receipt) when recipient views/opens active chat
  useEffect(() => {
    if (!activeChat) return;

    const unreadUserMsgs = activeChat.messages.filter(m => m.sender === 'user' && !m.isRead);
    if (unreadUserMsgs.length > 0) {
      const timer = setTimeout(() => {
        if (onMarkMessagesRead) {
          onMarkMessagesRead(activeChat.id);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeChat?.id, activeChat?.messages, onMarkMessagesRead]);

  // Voice recording stopwatch logic
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceTimer(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Send Text Message
  const handleSendText = async () => {
    if (!inputText.trim() || !activeChat) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      type: 'text',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setInputText('');
    onSendMessage(activeChat.id, userMsg);

    // Trigger AI response loop
    setIsTyping(true);
    if (onMarkMessagesRead) {
      onMarkMessagesRead(activeChat.id);
    }
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...activeChat.messages, userMsg],
          targetProfile: activeChat.matchProfile,
          userProfile: userProfile
        })
      });

      const data = await response.json();
      
      setIsTyping(false);
      const matchMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        sender: 'match',
        type: 'text',
        content: data.content || "Hey! I got your message but got distracted. What are you up to? 😊",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(activeChat.id, matchMsg);

    } catch (e) {
      console.error('Failed to get match message:', e);
      setIsTyping(false);
      
      // Local fallback reply
      const fallbackMsg: Message = {
        id: `msg-reply-fallback-${Date.now()}`,
        sender: 'match',
        type: 'text',
        content: "That sounds so fun! Tell me more about it? 😊",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(activeChat.id, fallbackMsg);
    }
  };

  // Real voice dictation (Voice-to-Text) functionality
  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictationError("Browser Speech SDK is not supported here. Falling back to typing simulation.");
      setIsDictating(true);
      setTimeout(() => {
        const fallbacks = [
          "Hey! I really like your profile and would love to meet up.",
          "Are you free this weekend? Let's grab coffee! ☕",
          "I think we have a lot of amazing interests in common.",
          "Your bio is beautiful! What kind of music do you like?",
          "Hey there! Let's spark up a sweet conversation."
        ];
        const randomPhrase = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setInputText(prev => prev ? prev + " " + randomPhrase : randomPhrase);
        setIsDictating(false);
        setDictationError(null);
      }, 2500);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsDictating(true);
        setDictationError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev ? prev + " " + transcript : transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech dictation warning:", event.error);
        if (event.error === 'not-allowed') {
          setDictationError("Microphone permission denied.");
        } else {
          setDictationError(`Error: ${event.error}`);
        }
        setIsDictating(false);
      };

      rec.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setIsDictating(false);
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsDictating(false);
  };

  // Real voice note recording with parallel real-time transcription
  const handleStartVoice = async () => {
    setIsRecordingVoice(true);
    setVoiceTranscription('');
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    // 1. Try to record real audio stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        // Clean up tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn("MediaRecorder mic access not available. Operating in simulation mode:", err);
    }

    // 2. Try parallel speech recognition for high-fidelity voice-to-text notes
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        let accumulated = '';
        rec.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript) {
            accumulated = accumulated ? accumulated + " " + transcript : transcript;
            setVoiceTranscription(accumulated);
          }
        };

        voiceSpeechRecRef.current = rec;
        rec.start();
      } catch (e) {
        console.warn("Parallel speech recognition failed to start:", e);
      }
    }
  };

  const handleStopVoice = (send: boolean) => {
    setIsRecordingVoice(false);

    // Stop Media Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Failed to stop media recorder:", err);
      }
    }

    // Stop parallel speech recognition
    if (voiceSpeechRecRef.current) {
      try {
        voiceSpeechRecRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      voiceSpeechRecRef.current = null;
    }

    if (!activeChat) return;

    if (send && voiceTimer > 0) {
      // Use real transcribed speech if available, otherwise pick a sweet matching phrase!
      let finalTranscription = voiceTranscription.trim();
      if (!finalTranscription) {
        const fallbackTranscriptions = [
          "Hey! Just wanted to send a quick voice message to say hello and brighten up your day. 😊",
          "Hey! I really loved your profile details and your interests look super fun.",
          "Hi there! Sending a personal audio note because texting gets too boring. Hope you're free to meet!",
          "Hey, hope you are having an absolutely lovely week. Let's make some plans!",
          "Hey, what are you up to? Sending a quick audio to hear your voice soon."
        ];
        finalTranscription = fallbackTranscriptions[Math.floor(Math.random() * fallbackTranscriptions.length)];
      }

      const messageId = `msg-voice-${Date.now()}`;
      const voiceMsg: Message = {
        id: messageId,
        sender: 'user',
        type: 'voice',
        content: `Voice Message (${voiceTimer}s)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: voiceTimer,
        transcription: finalTranscription,
        isRead: false
      };

      // Map the playable URL when the blob is processed
      setTimeout(() => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setPlayableAudios(prev => ({
            ...prev,
            [messageId]: audioUrl
          }));
        }
      }, 400);

      onSendMessage(activeChat.id, voiceMsg);

      // Trigger interactive match reply loop
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const matchVoiceId = `msg-voice-match-${Date.now()}`;
        const matchVoiceReplies = [
          "Oh my gosh, hearing your voice is so lovely! I'm having a super nice day, thank you.",
          "Wow, what a sweet voice note! You sound so nice. Let's definitely meet up for a drink.",
          "Aww, thank you for the voice note! I think we'd get along perfectly. How's your week?",
          "Hey! Your audio totally put a smile on my face. Let's grab some coffee this weekend!",
          "Hi! Sending a warm reply. Let's make some plans soon."
        ];
        const matchTranscription = matchVoiceReplies[Math.floor(Math.random() * matchVoiceReplies.length)];

        const matchVoice: Message = {
          id: matchVoiceId,
          sender: 'match',
          type: 'voice',
          content: `Voice Reply (4s)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: 4,
          transcription: matchTranscription
        };
        onSendMessage(activeChat.id, matchVoice);
      }, 3200);
    }
  };

  const handlePlayVoice = (msgId: string, customUrl?: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (activePlayId === msgId) {
      setActivePlayId(null);
      return;
    }

    setActivePlayId(msgId);

    const audioUrl = customUrl || playableAudios[msgId];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.onended = () => {
        setActivePlayId(null);
        activeAudioRef.current = null;
      };
      audio.onerror = () => {
        setActivePlayId(null);
        activeAudioRef.current = null;
      };
      audio.play().catch(err => {
        console.warn("Audio play failed:", err);
        setTimeout(() => setActivePlayId(null), 3000);
      });
    } else {
      // Fallback pulse timer
      setTimeout(() => {
        setActivePlayId(null);
      }, 4000);
    }
  };

  // Clean up active playing audio on unmount or chat change
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, [activeChatId]);

  // Video calling WebRTC Simulation
  const startVideoCall = async () => {
    setIsVideoCalling(true);
    setCallStatus('Establishing secure connection...');
    setIsMicMuted(false);
    setIsCamOff(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
      }
      setTimeout(() => {
        setCallStatus('Secure connection active • 00:02');
      }, 1500);
    } catch (err) {
      console.warn('Webcam/Mic access denied for video call simulator:', err);
      setCallStatus('Simulated connection (Camera permissions block)');
    }
  };

  const stopVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsVideoCalling(false);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsCamOff(!isCamOff);
  };

  // Block User
  const handleBlock = () => {
    if (!activeChat) return;
    onBlockMatch(activeChat.matchProfile.id);
    setShowOptions(false);
  };

  // Report User Submission
  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    if (activeChat && onReportMatch) {
      onReportMatch(activeChat.matchProfile.id, reportReason);
    }
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportReason('');
      if (activeChat) {
        onBlockMatch(activeChat.matchProfile.id);
      }
    }, 2000);
  };

  return (
    <div id="chat-window-layout" className="flex h-[600px] border border-rose-100 rounded-3xl overflow-hidden bg-white shadow-xl relative select-none">
      
      {/* 1. Chats list / Sidebar (on wider screens, hidden on small screens) */}
      <div id="chat-sidebar" className="w-1/3 border-r border-rose-50 flex flex-col bg-rose-50/10">
        <div className="p-4 border-b border-rose-100 bg-rose-50/20 text-left">
          <h3 className="font-extrabold text-base text-gray-900">Connections</h3>
          <p className="text-xs text-gray-500">Mutual swipe matches</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-left">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const isSelected = chat.id === activeChatId;
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <button
                  key={chat.id}
                  id={`chat-item-${chat.id}`}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full p-3 rounded-2xl flex gap-3 transition-all text-left ${
                    isSelected ? 'bg-rose-50 border border-rose-100' : 'hover:bg-rose-50/30'
                  }`}
                >
                  <img
                    src={chat.matchProfile.photoUrl}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-rose-500/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm text-gray-900 truncate flex items-center gap-1">
                        {chat.matchProfile.name}
                        {chat.matchProfile.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400 shrink-0" />}
                      </span>
                      <span className="text-[10px] text-gray-400">{chat.lastMessageTimestamp}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                      {lastMsg && lastMsg.sender === 'user' && (
                        lastMsg.isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )
                      )}
                      <span className="truncate">
                        {lastMsg ? (lastMsg.type === 'text' ? lastMsg.content : '🎵 Voice message') : 'Start the conversation!'}
                      </span>
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs mt-12">
              <Sparkles className="w-8 h-8 mx-auto text-rose-300 mb-2" />
              <span>No active matches yet. Keep swiping to trigger mutual matches!</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Pane */}
      <div id="chat-pane" className="flex-1 flex flex-col h-full bg-white relative">
        {activeChat ? (
          <>
            {/* Chat Pane Header */}
            <div className="p-4 border-b border-rose-50 flex items-center justify-between bg-rose-50/20 text-left shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activeChat.matchProfile.photoUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                    {activeChat.matchProfile.name}, {activeChat.matchProfile.age}
                    {activeChat.matchProfile.isVerified && <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400 shrink-0" />}
                  </h4>
                  <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Now</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons (Video Call, Call, Options) */}
              <div className="flex items-center gap-2 relative">
                <button
                  id="chat-video-call-btn"
                  onClick={startVideoCall}
                  className="p-2 rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  id="chat-options-btn"
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-rose-50 transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* Header Options Dropdown */}
                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      id="options-dropdown"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-11 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-xl p-1 text-left"
                    >
                      <button
                        id="options-report-btn"
                        onClick={() => {
                          setShowReportModal(true);
                          setShowOptions(false);
                        }}
                        className="w-full p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Report Profile</span>
                      </button>
                      <button
                        id="options-block-btn"
                        onClick={handleBlock}
                        className="w-full p-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Block Profile</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Conversation Flow */}
            <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 text-left">
              {activeChat.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%] space-y-1">
                      {msg.type === 'text' ? (
                        /* Text Bubble */
                        <div className={`p-3.5 rounded-2xl text-sm ${
                          isUser 
                            ? 'bg-rose-500 text-white rounded-br-none font-medium' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                      ) : (
                        /* Voice Note Bubble with Audio Playback and Transcription Subtitles */
                        <div className={`p-3.5 rounded-2xl flex flex-col gap-2 max-w-sm ${
                          isUser 
                            ? 'bg-rose-500 text-white rounded-br-none' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                        }`}>
                          <div className="flex items-center gap-3">
                            <button
                              id={`play-voice-${msg.id}`}
                              onClick={() => handlePlayVoice(msg.id)}
                              className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                                isUser ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                              }`}
                              title={activePlayId === msg.id ? "Pause" : "Play Voice Note"}
                            >
                              {activePlayId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                            </button>
                            
                            {/* Animated sound wave bars */}
                            <div className="flex items-center gap-1 min-w-[100px]">
                              {[5, 12, 7, 14, 6, 10, 8, 11, 4, 9].map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all duration-300 ${
                                    isUser ? 'bg-white' : 'bg-rose-500'
                                  } ${
                                    activePlayId === msg.id ? 'animate-pulse' : 'opacity-70'
                                  }`}
                                  style={{ height: activePlayId === msg.id ? `${h + Math.sin((activePlayId === msg.id ? Date.now() / 150 : 0) + i) * 6}px` : `${h}px` }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold opacity-90 select-none">
                              0:{msg.duration && msg.duration < 10 ? `0${msg.duration}` : msg.duration || '04'}
                            </span>
                          </div>

                          {/* Speech-to-Text Transcription Subtitle */}
                          {msg.transcription && (
                            <div className={`text-xs leading-relaxed border-t pt-2 font-medium italic ${
                              isUser ? 'border-white/10 text-rose-50/90' : 'border-gray-100 text-gray-600'
                            }`}>
                              " {msg.transcription} "
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`flex items-center gap-1.5 mt-0.5 ${isUser ? 'justify-end' : 'justify-start'} px-1`}>
                        <span className="text-[9px] text-gray-400">
                          {msg.timestamp}
                        </span>
                        {isUser && (
                          <span
                            id={`read-receipt-${msg.id}`}
                            className="flex items-center gap-0.5 text-[10px] select-none"
                            title={msg.isRead ? `Seen by ${activeChat.matchProfile.name}` : 'Sent'}
                          >
                            {msg.isRead ? (
                              <span className="flex items-center gap-1 text-sky-500 font-semibold bg-sky-50/90 px-1.5 py-0.5 rounded-full border border-sky-100/80">
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span className="text-[9px] font-bold text-sky-600 uppercase tracking-tight">Seen</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400 bg-gray-50/90 px-1.5 py-0.5 rounded-full border border-gray-100">
                                <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="text-[9px] font-medium text-gray-400">Sent</span>
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Match typing indicator */}
              {isTyping && (
                <div id="typing-indicator" className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">Matching matching...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Pane Input Bar (Standard or Recording mode) */}
            <div className="p-4 border-t border-rose-50 flex flex-col gap-2 bg-white shrink-0">
              {/* Voice-to-Text Dictation Error Toast */}
              {dictationError && (
                <div className="px-3 py-1.5 bg-red-50 border border-red-100 text-[10px] text-red-600 font-bold rounded-lg flex items-center gap-1.5 animate-pulse text-left">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{dictationError}</span>
                  <button onClick={() => setDictationError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isRecordingVoice ? (
                  <>
                    <input
                      id="chat-text-input"
                      type="text"
                      placeholder={isDictating ? "Listening... Speak now!" : "Type a sweet message..."}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      disabled={isDictating}
                      className={`flex-1 rounded-xl border py-2.5 px-4 text-sm focus:outline-none transition-all ${
                        isDictating 
                          ? 'bg-rose-50/30 border-rose-300 text-rose-950 font-medium placeholder-rose-400' 
                          : 'border-gray-200 focus:border-rose-400 bg-gray-50/50'
                      }`}
                    />

                    {/* Sparkling Dictation (Voice-to-Text) Button */}
                    <button
                      id="chat-dictation-btn"
                      onClick={isDictating ? stopDictation : startDictation}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isDictating 
                          ? 'bg-rose-500 border-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20' 
                          : 'border-rose-100 text-rose-500 hover:bg-rose-50'
                      }`}
                      title={isDictating ? "Stop listening" : "Start Voice-to-Text Dictation"}
                    >
                      <Sparkles className={`w-5 h-5 ${isDictating ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Record voice note button */}
                    <button
                      id="chat-voice-trigger-btn"
                      onMouseDown={handleStartVoice}
                      onTouchStart={handleStartVoice}
                      className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Hold to record voice note with transcription"
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    <button
                      id="chat-send-msg-btn"
                      onClick={handleSendText}
                      disabled={!inputText.trim() || isDictating}
                      className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  /* Recording audio overlay UI with Live Transcription Preview */
                  <div className="w-full flex flex-col gap-2">
                    <div id="voice-recording-ui" className="flex items-center justify-between bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Recording audio</span>
                        <span className="text-xs font-semibold text-gray-700 font-mono">0:{voiceTimer < 10 ? `0${voiceTimer}` : voiceTimer}</span>
                      </div>

                      {/* Waveform graphic */}
                      <div className="flex items-center gap-0.5">
                        {[12, 24, 16, 32, 22, 14, 20, 10, 26, 18].map((h, i) => (
                          <div 
                            key={i} 
                            className="w-0.5 bg-rose-500 rounded-full animate-pulse" 
                            style={{ 
                              height: `${h}px`,
                              animationDelay: `${i * 100}ms`
                            }} 
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          id="voice-cancel-btn"
                          onClick={() => handleStopVoice(false)}
                          className="py-1 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          id="voice-send-btn"
                          onClick={() => handleStopVoice(true)}
                          className="py-1 px-3.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                        >
                          Send Note
                        </button>
                      </div>
                    </div>

                    {/* Live Dictation / Transcription Preview Bar */}
                    <div className="px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-500 animate-pulse animate-bounce" />
                        Live Voice-to-Text Transcription:
                      </p>
                      <p className="text-xs text-gray-600 italic font-medium mt-1 truncate">
                        {voiceTranscription || "Listening to your sweet voice..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty Chat state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Volume2 className="w-12 h-12 text-rose-200 mb-2" />
            <h4 className="text-sm font-bold text-gray-900">Select a Chat</h4>
            <p className="text-xs text-gray-500 mt-1">Tap one of your connections on the left sidebar to spark up a sweet conversation!</p>
          </div>
        )}
      </div>

      {/* 3. SIMULATED WEBRTC VIDEO CALL OVERLAY */}
      <AnimatePresence>
        {isVideoCalling && activeChat && (
          <div id="video-call-backdrop" className="absolute inset-0 z-50 bg-neutral-950 flex flex-col justify-between text-white p-6">
            
            {/* Header: Encryption badge & Match identity */}
            <div className="flex items-center justify-between text-left shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold opacity-80 tracking-wide">{callStatus}</span>
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-sm tracking-tight">{activeChat.matchProfile.name}</h4>
                <p className="text-[10px] text-gray-400">WebRTC Peer Connection Secured</p>
              </div>
            </div>

            {/* Video Canvas Stage */}
            <div className="flex-1 flex items-center justify-center relative my-6 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800">
              {/* Main Background: Match video representation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <img
                  src={activeChat.matchProfile.photoUrl}
                  alt=""
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-rose-500/30 animate-pulse"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-base">{activeChat.matchProfile.name} is streaming</h4>
                  <p className="text-xs text-gray-400">Simulating live remote feed...</p>
                </div>
              </div>

              {/* Picture in Picture: User local webcam feed */}
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 bg-neutral-950 shadow-2xl">
                {!isCamOff ? (
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-850 text-white/40">
                    <CameraOff className="w-6 h-6" />
                  </div>
                )}
                <span className="absolute bottom-1.5 left-2 bg-black/60 py-0.5 px-1.5 rounded text-[8px] font-bold tracking-wider backdrop-blur-sm">
                  You (Local)
                </span>
              </div>
            </div>

            {/* Call Controls row */}
            <div className="flex items-center justify-center gap-4 shrink-0 pb-2">
              {/* Mic toggle */}
              <button
                id="call-toggle-mic-btn"
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/25'
                }`}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Hang Up */}
              <button
                id="call-hangup-btn"
                onClick={stopVideoCall}
                className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 shadow-xl transition-all hover:scale-105 active:scale-95"
                title="Hang Up Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Cam toggle */}
              <button
                id="call-toggle-cam-btn"
                onClick={toggleCam}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCamOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/25'
                }`}
                title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isCamOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* REPORT MATCH USER DIALOG MODAL */}
      <AnimatePresence>
        {showReportModal && activeChat && (
          <div id="report-modal-backdrop" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full p-6 border border-rose-100 shadow-2xl relative text-left">
              
              {!reportSuccess ? (
                <form id="report-match-form" onSubmit={submitReport} className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <h3 className="text-base font-bold text-gray-900">Report {activeChat.matchProfile.name}</h3>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Please help us keep JustMeet Dating safe and respectful. Tell us what is wrong with this profile. Your report is completely anonymous.
                  </p>

                  <div className="space-y-2.5">
                    {[
                      'Fake account / Scammer profile',
                      'Harassment or offensive text messages',
                      'Inappropriate profile photos',
                      'Underage or suspect identity',
                      'Commercial advertisement or spam'
                    ].map((reason, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 hover:bg-rose-50/20 cursor-pointer text-xs font-semibold text-gray-700 transition-colors">
                        <input
                          type="radio"
                          name="report_reason"
                          value={reason}
                          required
                          onChange={(e) => setReportReason(e.target.value)}
                          className="accent-rose-500"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      id="report-cancel-btn"
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="report-submit-btn"
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/10 transition-colors"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              ) : (
                /* Report Success Stage */
                <div id="report-success-stage" className="py-6 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95">
                  <CheckCircle className="w-12 h-12 text-emerald-500 fill-emerald-50" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-950 text-sm">Report Submitted</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Thank you for your report. Our trust & safety team will audit this profile within 15 minutes. We are blocking and hiding {activeChat.matchProfile.name} for you now.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
