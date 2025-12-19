import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { LiveServerMessage, Modality, Blob as GenAI_Blob } from "@google/genai";
import { AppContext } from "../App";
import {
  ai,
  encode,
  decode,
  decodeAudioData,
  LIVE_CHAT_SYSTEM_PROMPT,
} from "../services/geminiService";
import { incrementUserBriefingCount, getUser } from "../services/userService";
import { saveBriefing, updateBriefing } from "../services/jobService";
import { LiveChatMessage, Briefing } from "../types";

const SESSION_DURATION_SECONDS = 180;
type SessionStatus = "idle" | "connecting" | "connected" | "error" | "ended";

interface VoiceChatViewProps {
  isBriefingLimitReached: boolean;
  onOpenLimitModal: () => void;
  currentBriefingResult: Briefing | null;
}

const TranscriptBubble: React.FC<{ message: LiveChatMessage }> = ({ message }) => {
  const isModel = message.role === "model";
  const bubbleClasses = isModel
    ? "bg-light-card dark:bg-dark-card self-start"
    : "bg-gradient-to-r from-light-primary-start to-light-primary-end dark:from-dark-primary-start dark:to-dark-primary-end self-end text-white";

  return (
    <div className={`w-full flex ${isModel ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-xl w-fit rounded-2xl px-4 py-3 mb-3 shadow-soft dark:shadow-soft-dark ${bubbleClasses}`}>
        <p>{message.text || "..."}</p>
      </div>
    </div>
  );
};

export const VoiceChatView: React.FC<VoiceChatViewProps> = ({
  isBriefingLimitReached,
  onOpenLimitModal,
  currentBriefingResult,
}) => {
  const [status, _setStatus] = useState<SessionStatus>("idle");
  const [transcript, setTranscript] = useState<LiveChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);

  const context = useContext(AppContext);
  if (!context) return null;
  const { user, setUser, setBriefings } = context;

  const statusRef = useRef<SessionStatus>("idle");
  const stoppingRef = useRef(false);
  const mountedRef = useRef(true);

  const setStatus = (s: SessionStatus) => {
    statusRef.current = s;
    _setStatus(s);
  };

  const transcriptRef = useRef<LiveChatMessage[]>([]);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Session + audio refs
  const sessionRef = useRef<any>(null); // resolved live session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const usageIntervalRef = useRef<number | null>(null);
  const currentBriefingIdRef = useRef<number | null>(null);

  const safeSetError = (msg: string | null) => {
    if (!mountedRef.current) return;
    setError(msg);
  };

  const safeSetTranscript = (fn: (prev: LiveChatMessage[]) => LiveChatMessage[]) => {
    if (!mountedRef.current) return;
    setTranscript(fn);
  };

  const handleStop = useCallback(() => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    // stop timer
    if (usageIntervalRef.current) {
      clearInterval(usageIntervalRef.current);
      usageIntervalRef.current = null;
    }

    // stop mic
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    // disconnect processor
    try {
      scriptProcessorRef.current?.disconnect();
    } catch {}
    scriptProcessorRef.current = null;

    // close audio contexts
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== "closed") {
      inputAudioContextRef.current.close().catch(() => {});
    }
    inputAudioContextRef.current = null;

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== "closed") {
      outputAudioContextRef.current.close().catch(() => {});
    }
    outputAudioContextRef.current = null;

    // close live session
    try {
      sessionRef.current?.close?.();
    } catch {}
    sessionRef.current = null;

    // finalize briefing transcript
    if (currentBriefingIdRef.current) {
      const finalTranscript = transcriptRef.current;
      const briefingToUpdate: Partial<Briefing> = {
        id: currentBriefingIdRef.current,
        status: "completed",
        output: { transcript: finalTranscript },
      };
      updateBriefing(briefingToUpdate as Briefing);
      setBriefings((prev) =>
        prev.map((j) => (j.id === briefingToUpdate.id ? { ...j, ...briefingToUpdate } : j))
      );
      currentBriefingIdRef.current = null;
    }

    setStatus("ended");
    stoppingRef.current = false;
  }, [setBriefings]);

  useEffect(() => () => handleStop(), [handleStop]);

  const handleStart = useCallback(async () => {
    if (isBriefingLimitReached) {
      onOpenLimitModal();
      safeSetError("You've reached your weekly voice chat limit.");
      return;
    }

    setStatus("connecting");
    safeSetError(null);
    setTranscript([]);
    setRemainingSeconds(SESSION_DURATION_SECONDS);

    // optimistic usage increment (don’t let failures break start)
    try {
      await Promise.resolve(incrementUserBriefingCount(user.uid, "voice"));
      const updatedUser = await Promise.resolve(getUser(user.uid));
      if (updatedUser) setUser(updatedUser);
    } catch {
      // ignore — voice can still start
    }

    const newBriefing: Briefing = {
      id: Date.now(),
      userId: user.uid,
      type: "voice",
      status: "pending",
      createdAt: Date.now(),
      input: { prompt: "Voice Chat Session" },
    };

    currentBriefingIdRef.current = newBriefing.id;
    saveBriefing(newBriefing);
    setBriefings((prev) => [newBriefing, ...prev]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      if (inputAudioContextRef.current.state === "suspended") await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === "suspended") await outputAudioContextRef.current.resume();

      // connect live
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: async () => {
            if (!mediaStreamRef.current?.active) {
              safeSetError("Microphone lost.");
              handleStop();
              return;
            }

            setStatus("connected");

            // resolve session once (no per-frame .then spam)
            try {
              sessionRef.current = await sessionPromise;
            } catch {
              safeSetError("Could not establish session.");
              handleStop();
              return;
            }

            // countdown
            usageIntervalRef.current = window.setInterval(() => {
              setRemainingSeconds((prev) => {
                if (prev <= 1) {
                  handleStop();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            // mic -> processor
            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (event) => {
              const session = sessionRef.current;
              const streamOk = mediaStreamRef.current?.active;
              const ctxOk = inputAudioContextRef.current && inputAudioContextRef.current.state !== "closed";
              if (!session || !streamOk || !ctxOk) return;

              const inputData = event.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);

              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16[i] = Math.round(s * 32767);
              }

              const pcmBlob: GenAI_Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: "audio/pcm;rate=16000",
              };

              try {
                session.sendRealtimeInput({ media: pcmBlob });
              } catch {
                // if send fails, let onerror/onclose handle it
              }
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },

          onmessage: async (msg: LiveServerMessage) => {
            const inputT = msg.serverContent?.inputTranscription?.text;
            const outputT = msg.serverContent?.outputTranscription?.text;

            if (inputT) safeSetTranscript((prev) => [...prev, { role: "user", text: inputT }]);
            if (outputT) safeSetTranscript((prev) => [...prev, { role: "model", text: outputT }]);

            // audio out (sometimes parts can vary; guard hard)
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              try {
                const outputCtx = outputAudioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                const src = outputCtx.createBufferSource();
                src.buffer = audioBuffer;
                src.connect(outputCtx.destination);
                src.start();
              } catch {
                // ignore audio decode errors
              }
            }
          },

          onerror: () => {
            safeSetError("A connection error occurred.");
            handleStop();
          },

          onclose: () => {
            if (statusRef.current !== "ended") handleStop();
          },
        },
        config: {
          systemInstruction: LIVE_CHAT_SYSTEM_PROMPT,
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
        },
      });

      // kick off promise
      // (sessionRef is assigned in onopen after awaiting this)
      void sessionPromise;
    } catch (err) {
      console.error(err);
      safeSetError("Could not start voice chat.");
      setStatus("error");

      if (currentBriefingIdRef.current) {
        const failed: Partial<Briefing> = { id: currentBriefingIdRef.current, status: "failed" };
        updateBriefing(failed as Briefing);
        setBriefings((prev) =>
          prev.map((j) => (j.id === failed.id ? { ...j, ...failed } : j))
        );
        currentBriefingIdRef.current = null;
      }
    }
  }, [isBriefingLimitReached, onOpenLimitModal, setUser, setBriefings, user.uid, handleStop]);

  const formatTime = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  // Read-only transcript view for saved briefings
  if (currentBriefingResult?.type === "voice") {
    return (
      <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full min-h-[60vh]">
        <div className="flex-1 p-4 overflow-y-auto">
          {currentBriefingResult.output?.transcript?.length ? (
            currentBriefingResult.output.transcript.map((m: any, i: number) => (
              <TranscriptBubble key={i} message={m} />
            ))
          ) : (
            <p className="text-center opacity-70">No transcript was saved.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full min-h-[60vh]">
      {["idle", "ended", "error"].includes(status) ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-3xl font-heading mb-4">Real-time Voice Chat</h2>
          <p className="opacity-75 mb-6">Talk naturally with Scuba Steve.</p>

          {error && (
            <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleStart}
            disabled={isBriefingLimitReached}
            className="bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white text-xl px-8 py-4 rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBriefingLimitReached ? "Weekly Limit Reached" : "Talk to Scuba Steve"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-t-lg">
            <div className="flex items-center gap-3">
              <span>{status === "connecting" ? "Connecting..." : "Live Conversation"}</span>
            </div>
            <span className="font-mono text-lg">{formatTime(remainingSeconds)}</span>
            <button
              onClick={handleStop}
              className="text-red-500 py-2 px-4 rounded-lg hover:bg-red-500/10"
            >
              Stop
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {transcript.length === 0 ? (
              <p className="opacity-70 text-center animate-pulse">Listening...</p>
            ) : (
              transcript.map((m, i) => <TranscriptBubble key={i} message={m} />)
            )}
          </div>
        </div>
      )}
    </section>
  );
};
