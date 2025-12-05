
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { AppContext } from '../App';
import { encode, decode, decodeAudioData, LIVE_CHAT_SYSTEM_PROMPT } from '../services/geminiService';
import { incrementUserBriefingCount, getUser } from '../services/userService';
import { saveBriefing, updateBriefing } from '../services/jobService';
import { LiveChatMessage, User, Briefing } from '../types';

const SESSION_DURATION_SECONDS = 180; // 3 minutes per session

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'ended';

interface VoiceChatViewProps {
    isBriefingLimitReached: boolean;
    onOpenLimitModal: () => void;
    currentBriefingResult: Briefing | null;
}

const TranscriptBubble: React.FC<{ message: LiveChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    const bubbleClasses = isModel
        ? 'bg-light-card dark:bg-dark-card self-start'
        : 'bg-gradient-to-r from-light-primary-start to-light-primary-end dark:from-dark-primary-start dark:to-dark-primary-end self-end text-white';
    
    return (
        <div className={`w-full flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xl w-fit rounded-2xl px-4 py-3 mb-3 shadow-soft dark:shadow-soft-dark ${bubbleClasses}`}>
                <p>{message.text || '...'}</p>
            </div>
        </div>
    );
};

export const VoiceChatView: React.FC<VoiceChatViewProps> = ({ isBriefingLimitReached, onOpenLimitModal, currentBriefingResult }) => {
    const [status, _setStatus] = useState<SessionStatus>('idle');
    const [transcript, setTranscript] = useState<LiveChatMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);

    const context = useContext(AppContext);
    if (!context) return null;
    const { user, setUser, setBriefings } = context;

    const statusRef = useRef<SessionStatus>('idle');
    const setStatus = (s: SessionStatus) => {
        statusRef.current = s;
        _setStatus(s);
    };

    const transcriptRef = useRef<LiveChatMessage[]>([]);
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const usageIntervalRef = useRef<number | null>(null);
    const currentBriefingIdRef = useRef<number | null>(null);

    const handleStop = useCallback(() => {
        if (usageIntervalRef.current) {
            clearInterval(usageIntervalRef.current);
            usageIntervalRef.current = null;
        }
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
        }

        sessionPromiseRef.current?.then(session => session.close()).catch(console.error);

        if (currentBriefingIdRef.current) {
            const finalTranscript = transcriptRef.current;
            const briefingToUpdate: Partial<Briefing> = {
                id: currentBriefingIdRef.current,
                status: 'completed',
                output: { transcript: finalTranscript }
            };
            updateBriefing(briefingToUpdate as Briefing);
            setBriefings(prev => prev.map(j => (j.id === briefingToUpdate.id ? { ...j, ...briefingToUpdate } : j)));
            currentBriefingIdRef.current = null;
        }

        setStatus('ended');

    }, [setBriefings]);

    useEffect(() => {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return () => {
            handleStop(); // Cleanup on component unmount
        };
    }, [handleStop]);

    const handleStart = useCallback(async () => {
        if (isBriefingLimitReached) {
            onOpenLimitModal();
            setError("You've reached your weekly voice chat limit. Please try again next week.");
            return;
        }
        
        setStatus('connecting');
        setError(null);
        setTranscript([]);

        incrementUserBriefingCount(user.uid, 'voice');
        const updatedUser = getUser(user.uid);
        if (updatedUser) setUser(updatedUser);

        const newBriefing: Briefing = {
            id: Date.now(),
            userId: user.uid,
            type: 'voice',
            status: 'pending',
            createdAt: Date.now(),
            input: { prompt: 'Voice Chat Session' }
        };
        currentBriefingIdRef.current = newBriefing.id;
        saveBriefing(newBriefing);
        setBriefings(prev => [newBriefing, ...prev]);

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
            if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

            nextStartTimeRef.current = 0;
            audioSourcesRef.current = new Set();
            
            const sessionPromise = aiRef.current!.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        try {
                            if (statusRef.current !== 'connecting') {
                                return;
                            }
                            if (!stream || !stream.active) {
                                setError("The microphone stream was interrupted.");
                                handleStop();
                                return;
                            }

                            setStatus('connected');
                            setRemainingSeconds(SESSION_DURATION_SECONDS);

                            usageIntervalRef.current = window.setInterval(() => {
                                setRemainingSeconds(prev => {
                                    const newRemaining = prev - 1;
                                    if (newRemaining <= 0) {
                                        handleStop();
                                        return 0;
                                    }
                                    return newRemaining;
                                });
                            }, 1000);

                            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current = scriptProcessor;

                            scriptProcessor.onaudioprocess = (event) => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                const l = inputData.length;
                                const int16 = new Int16Array(l);
                                for (let i = 0; i < l; i++) {
                                    int16[i] = inputData[i] * 32768;
                                }
                                const pcmBlob: GenAI_Blob = {
                                    data: encode(new Uint8Array(int16.buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContextRef.current!.destination);
                        } catch (e) {
                            setError("Failed to connect your microphone.");
                            handleStop();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        setTranscript(prev => {
                            const newTranscript = [...prev];
                            let lastMessage = newTranscript[newTranscript.length - 1];

                            if (message.serverContent?.inputTranscription) {
                                const text = message.serverContent.inputTranscription.text;
                                if (lastMessage?.role === 'user') lastMessage.text += text;
                                else newTranscript.push({ role: 'user', text });
                            } else if (message.serverContent?.outputTranscription) {
                                const text = message.serverContent.outputTranscription.text;
                                if (lastMessage?.role === 'model') lastMessage.text += text;
                                else newTranscript.push({ role: 'model', text });
                            }
                            return newTranscript;
                        });

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                         if (message.serverContent?.interrupted) {
                            for (const source of audioSourcesRef.current.values()) source.stop();
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e) => {
                        setError('A connection error occurred.');
                        handleStop();
                    },
                    onclose: () => {
                        if (statusRef.current !== 'ended') handleStop();
                    },
                },
                config: {
                    systemInstruction: LIVE_CHAT_SYSTEM_PROMPT,
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            let errorMessage = "Could not start voice chat.";
            if ((err as Error).name === 'NotAllowedError') {
                errorMessage = "Microphone access required.";
            }
            setError(errorMessage);
            setStatus('error');
            if (currentBriefingIdRef.current) {
                const failedBriefing: Partial<Briefing> = { id: currentBriefingIdRef.current, status: 'failed' };
                updateBriefing(failedBriefing as Briefing);
                setBriefings(prev => prev.map(j => (j.id === failedBriefing.id ? { ...j, ...failedBriefing } : j)));
                currentBriefingIdRef.current = null;
            }
        }
    }, [user.uid, handleStop, isBriefingLimitReached, onOpenLimitModal, setUser, setBriefings]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderContent = () => {
        if (currentBriefingResult && currentBriefingResult.type === 'voice') {
            const pastTranscript = currentBriefingResult.output?.transcript || [];
            return (
                <div className="w-full h-full flex flex-col animate-fade-in">
                    <div className="flex-1 p-4 overflow-y-auto bg-light-bg/30 dark:bg-dark-bg/30">
                        {pastTranscript.length > 0 ? (
                            pastTranscript.map((msg, index) => <TranscriptBubble key={index} message={msg} />)
                        ) : (
                            <div className="text-center text-light-text/70 dark:text-dark-text/70 h-full flex items-center justify-center">
                                <p className="text-xl">No transcript was saved for this session.</p>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        
        if (status === 'idle' || status === 'ended' || status === 'error') {
            return (
                <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in">
                    <h2 className="font-heading font-semibold text-2xl sm:text-3xl mb-4">Real-time Voice Chat</h2>
                    <p className="text-xl max-w-lg mb-8 text-light-text/80 dark:text-dark-text/80">
                        Have a natural, voice-to-voice conversation with Scuba Steve.
                    </p>
                    {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mb-6">{error}</p>}
                    <button onClick={handleStart} disabled={isBriefingLimitReached} className="bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-bold text-2xl py-4 px-8 rounded-full hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20 flex items-center justify-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        {isBriefingLimitReached ? 'Weekly Limit Reached' : 'Talk to Scuba Steve'}
                    </button>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col animate-fade-in">
                <div className="flex-shrink-0 flex items-center justify-between p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        {/* Animated Live Indicator */}
                        <div className="relative flex h-4 w-4">
                          {status === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-4 w-4 ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        </div>
                        <span className="font-semibold text-lg">{status === 'connecting' ? 'Connecting...' : 'Live Conversation'}</span>
                    </div>
                    <div className="font-mono text-lg font-semibold text-light-text dark:text-dark-text">{formatTime(remainingSeconds)}</div>
                    <button onClick={handleStop} className="bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                        Stop
                    </button>
                </div>
                
                {/* Audio Visualizer Simulation */}
                {status === 'connected' && (
                    <div className="h-16 flex items-center justify-center gap-1 bg-gradient-to-b from-light-bg/50 to-transparent dark:from-dark-bg/50">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="w-2 bg-light-accent dark:bg-dark-accent rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: `${i * 0.15}s` }}></div>
                        ))}
                    </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto bg-light-bg/30 dark:bg-dark-bg/30">
                    {transcript.length === 0 && (
                        <div className="text-center text-light-text/70 dark:text-dark-text/70 h-full flex flex-col items-center justify-center gap-4">
                            <p className="text-xl animate-pulse">Listening...</p>
                        </div>
                    )}
                    {transcript.map((msg, index) => (
                        <TranscriptBubble key={index} message={msg} />
                    ))}
                </div>
            </div>
        );
    };

    const isHistoricalView = currentBriefingResult && currentBriefingResult.type === 'voice';
    const shellMinHeight = isHistoricalView ? 'auto' : 'min-h-[60vh]';

    return (
        <section className={`bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full ${shellMinHeight} flex flex-col`}>
            {renderContent()}
        </section>
    );
};
