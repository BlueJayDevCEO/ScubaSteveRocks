
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat as GeminiChat } from '@google/genai';
import { createScubaSteveChat } from '../services/geminiService';
import { getChatHistory, addChatMessage } from '../services/chatService';
import { incrementUserBriefingCount, canUserPerformBriefing, getUser } from '../services/userService';
import { ChatMessage, Briefing } from '../types';
import { AppContext } from '../App';
import { ScubaSteveLogo } from './ScubaSteveLogo';

const formatMarkdown = (content: string) => {
    if (!content) return { __html: '' };
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-light-accent dark:text-dark-accent hover:underline">$1</a>');
    return { __html: html };
};

export const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    const bubbleClasses = isModel
        ? 'bg-light-card dark:bg-dark-card self-start text-light-text dark:text-dark-text'
        : 'bg-gradient-to-r from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent self-end text-white';
    
    return (
        <div className={`w-full flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                {isModel && (
                    <div className="flex-shrink-0 mt-1">
                        <ScubaSteveLogo className="w-8 h-8 rounded-full shadow-sm bg-white dark:bg-black/20" />
                    </div>
                )}
                <div className={`rounded-2xl px-5 py-3 shadow-sm ${bubbleClasses}`}>
                    <div 
                        className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={formatMarkdown(message.content)}
                    />
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-xs opacity-80">
                            <p className="font-bold mb-1">Sources:</p>
                            <ul className="list-disc list-inside">
                                {message.sources.map((s, i) => (
                                    s.web ? (
                                        <li key={i}>
                                            <a href={s.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.web.title}</a>
                                        </li>
                                    ) : null
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ChatProps {
    initialContext: Briefing | null;
    initialMessage: string | null;
    onOpenLimitModal: () => void;
}

export const Chat: React.FC<ChatProps> = ({ initialContext, initialMessage, onOpenLimitModal }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<GeminiChat | null>(null);
    const [isListening, setIsListening] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const context = useContext(AppContext);
    const user = context?.user;
    const setUser = context?.setUser;

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(prev => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) {
                    console.error("Failed to start speech recognition", e);
                }
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        }
    };

    useEffect(() => {
        const initChat = async () => {
            if (!user) return;
            
            const history = await getChatHistory(user.uid);
            setMessages(history);

            const contextBriefings = initialContext ? [initialContext] : [];
            const session = createScubaSteveChat(history, contextBriefings, user);
            setChatSession(session);

            if (initialMessage) {
                const lastMsg = history[history.length - 1];
                if (!lastMsg || lastMsg.content !== initialMessage) {
                    handleSendMessageInternal(initialMessage, session);
                }
            }
        };

        initChat();
    }, [user, initialContext]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessageInternal = async (text: string, session: GeminiChat | null) => {
        if (!text.trim() || !user) return;
        
        const currentSession = session || chatSession;
        if (!currentSession) return;

        if (!canUserPerformBriefing(user.uid, 'chat')) {
            onOpenLimitModal();
            return;
        }

        const newUserMessage: ChatMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, newUserMessage]);
        addChatMessage(user.uid, newUserMessage);
        setIsLoading(true);

        try {
            incrementUserBriefingCount(user.uid, 'chat');
            const updatedUser = getUser(user.uid);
            if (updatedUser && setUser) setUser(updatedUser);

            const result = await currentSession.sendMessage({ message: text });
            const responseText = result.text;
            
            const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
                web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title || "Source" } : undefined
            })).filter(s => s.web) as any;

            const newModelMessage: ChatMessage = { 
                role: 'model', 
                content: responseText || "I'm having trouble thinking right now.",
                sources: sources
            };

            setMessages(prev => [...prev, newModelMessage]);
            addChatMessage(user.uid, newModelMessage);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting to the surface. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        
        const text = userInput;
        setUserInput('');
        await handleSendMessageInternal(text, chatSession);
    };

    // Correctly check limit logic
    const isSessionEnded = user ? !canUserPerformBriefing(user.uid, 'chat') : false;

    return (
        <div className="flex flex-col h-full min-h-[600px] relative">
            <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                        <ScubaSteveLogo className="w-24 h-24 mb-4 grayscale" />
                        <p className="text-lg font-bold">Start a conversation with Scuba Steve!</p>
                        <p className="text-sm">Ask about marine life, dive safety, or just say hi.</p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}
                
                {isLoading && (
                    <div className="w-full flex justify-start mb-4">
                        <div className="bg-light-card dark:bg-dark-card rounded-2xl px-5 py-4 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-light-text/40 dark:bg-dark-text/40 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-light-text/40 dark:bg-dark-text/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-light-text/40 dark:bg-dark-text/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-light-bg via-light-bg to-transparent dark:from-dark-bg dark:via-dark-bg pt-12">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full max-w-3xl mx-auto relative">
                    
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                            isListening 
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' 
                            : 'bg-light-card dark:bg-dark-card text-light-text/70 dark:text-dark-text/70 hover:bg-light-accent/10 hover:text-light-accent dark:hover:text-dark-accent shadow-sm border border-black/5 dark:border-white/5'
                        }`}
                        title={isListening ? "Stop Listening" : "Voice Input"}
                    >
                        {isListening ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 8a2 2 0 012-2h0a2 2 0 012 2v4a2 2 0 01-2 2h0a2 2 0 01-2-2V8z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : isSessionEnded ? "Daily limit reached..." : "Ask Scuba Steve..."}
                            className={`w-full py-3.5 pl-5 pr-12 bg-light-card dark:bg-dark-card border border-light-accent/20 dark:border-dark-accent/20 rounded-full focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-all shadow-sm text-light-text dark:text-dark-text placeholder-light-text/50 dark:placeholder-dark-text/50 ${isListening ? 'ring-2 ring-red-400 border-red-400 placeholder-red-400' : ''}`}
                            disabled={isSessionEnded}
                        />
                        <button 
                            type="submit" 
                            disabled={!userInput.trim() || isLoading || isSessionEnded} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-light-accent dark:bg-dark-accent text-white rounded-full hover:opacity-90 transition-all disabled:opacity-0 disabled:scale-75 transform duration-200 shadow-md flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};