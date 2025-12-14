import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { LiveServerMessage, Modality, Blob as GenAI_Blob } from "@google/genai";
import { AppContext } from "../App";
import { ai, encode, decode, decodeAudioData, LIVE_CHAT_SYSTEM_PROMPT } from "../services/geminiService";
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

export const VoiceChatView: React.FC<VoiceChatViewProps> = ({ isBriefingLimitReached, onOpenLimitModal, currentBriefingResult }) => {
  const [status, _setStatus] = useState<SessionStatus>("idle");
  const [transcript, setTranscript] = useState<LiveChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);

  const context = useContext(AppContext);
  if (!context) return null;
  const { user, setUser, setBriefings } = context;

  const statusRef = useRef<SessionStatus>("idle");
  const setStatus = (s: SessionStatus) => {
    statusRef.current = s;
    _setStatus(s);
  };

  const transcriptRef = useRef<LiveChatMessage[]>([]);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const usageIntervalRef = useRef<number | null>(null);
  const currentBriefingIdRef = useRef<number | null>(null);

  const handleStop = useCallback(() => {
    if (usageIntervalRef.current) {
      clearInterval(usageIntervalRef.current);
      usageIntervalRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== "closed") {
      inputAudioContextRef.current.close().catch(console.error);
    }
    inputAudioContextRef.current = null;

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== "closed") {
      outputAudioContextRef.current.close().catch(console.error);
    }
    outputAudioContextRef.current = null;

    sessionPromiseRef.current?.then((session) => session.close()).catch(console.error);
    sessionPromiseRef.current = null;

    if (currentBriefingIdRef.current) {
      const finalTranscript = transcriptRef.current;
      const briefingToUpdate: Partial<Briefing> = {
        id: currentBriefingIdRef.current,
        status: "completed",
        output: { transcript: finalTranscript },
      };
      updateBriefing(briefingToUpdate as Briefing);
      setBriefings((prev) => prev.map((j) => (j.id === briefingToUpdate.id ? { ...j, ...briefingToUpdate } : j)));
      currentBriefingIdRef.current = null;
    }

    setStatus("ended");
  }, [setBriefings]);

  useEffect(() => () => handleStop(), [handleStop]);

  const handleStart = useCallback(async () => {
    if (isBriefingLimitReached) {
      onOpenLimitModal();
      setError("You've reached your weekly voice chat limit.");
      return;
    }

    setStatus("connecting");
    setError(null);
    setTranscript([]);
    setRemainingSeconds(SESSION_DURATION_SECONDS);

    incrementUserBriefingCount(user.uid, "voice");
    const updatedUser = getUser(user.uid);
    if (updatedUser) setUser(updatedUser);

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

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            if (!stream.active) {
              setError("Microphone lost.");
              handleStop();
              return;
            }

            setStatus("connected");

            usageIntervalRef.current = window.setInterval(() => {
              setRemainingSeconds((prev) => {
                if (prev <= 1) {
                  handleStop();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;

              const pcmBlob: GenAI_Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: "audio/pcm;rate=16000",
              };

              sessionPromiseRef.current?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },

          onmessage: async (msg: LiveServerMessage) => {
            const inputT = msg.serverContent?.inputTranscription?.text;
            const outputT = msg.serverContent?.outputTranscription?.text;

            if (inputT) setTranscript((prev) => [...prev, { role: "user", text: inputT }]);
            if (outputT) setTranscript((prev) => [...prev, { role: "model", text: outputT }]);

            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const outputCtx = outputAudioContextRef.current;
              const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const src = outputCtx.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(outputCtx.destination);
              src.start();
            }
          },

          onerror: () => {
            setError("A connection error occurred.");
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
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Could not start voice chat.");
      setStatus("error");

      if (currentBriefingIdRef.current) {
        const failed: Partial<Briefing> = { id: currentBriefingIdRef.current, status: "failed" };
        updateBriefing(failed as Briefing);
        setBriefings((prev) => prev.map((j) => (j.id === failed.id ? { ...j, ...failed } : j)));
        currentBriefingIdRef.current = null;
      }
    }
  }, [isBriefingLimitReached, onOpenLimitModal, setUser, setBriefings, user.uid, handleStop]);

  const formatTime = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  if (currentBriefingResult?.type === "voice") {
    return (
      <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full min-h-[60vh]">
        <div className="flex-1 p-4 overflow-y-auto">
          {currentBriefingResult.output?.transcript?.length
            ? currentBriefingResult.output.transcript.map((m: any, i: number) => <TranscriptBubble key={i} message={m} />)
            : <p className="text-center opacity-70">No transcript was saved.</p>}
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

          {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4">{error}</p>}

          <button
            onClick={handleStart}
            disabled={isBriefingLimitReached}
            className="bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white text-xl px-8 py-4 rounded-full shadow-lg"
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
            <button onClick={handleStop} className="text-red-500 py-2 px-4 rounded-lg hover:bg-red-500/10">
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
