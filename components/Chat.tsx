import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat as GeminiChat } from '@google/genai';
import { AppContext } from '../App';
import { createScubaSteveChat, getContextualChatGreeting } from '../services/geminiService';
import { ChatMessage, Briefing, GroundingChunk } from '../types';
import { addChatMessage, getChatHistory } from '../services/chatService';
import { canUserPerformBriefing, incrementUserBriefingCount } from '../services/userService';


interface ChatProps {
    initialContext: Briefing | null;
    initialMessage: string | null;
    onOpenLimitModal: () => void;
}

export const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    if (message.type === 'limit_reached' && message.payload) {
        const payload = message.payload;
        return (
            <div className="w-full flex justify-start animate-fade-in">
                <div className="max-w-md w-fit rounded-2xl px-5 py-4 mb-3 shadow-soft dark:shadow-soft-dark bg-light-card dark:bg-dark-card self-start border border-light-accent/50 dark:border-dark-accent/50">
                    <h3 className="font-bold text-xl text-light-accent dark:text-dark-accent mb-2 font-heading">{payload.title}</h3>
                    <p className="mb-4 text-base">{payload.message}</p>
                    <a
                        href={payload.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center bg-light-accent dark:bg-dark-accent text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity shadow-md"
                    >
                        {payload.donation_button_text}
                    </a>
                </div>
            </div>
        );
    }
    
    const isModel = message.role === 'model';
    const bubbleClasses = isModel
        ? 'bg-light-card dark:bg-dark-card self-start rounded-tl-none'
        : 'bg-gradient-to-br from-light-primary-start to-light-primary-end dark:from-dark-primary-start dark:to-dark-primary-end self-end text-white rounded-tr-none';
    
    // Enhanced text formatting
    const formatContent = (content: string) => {
        // 1. Escape basic HTML to prevent XSS (though input usually controlled)
        let safe = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // 2. Bold (Markdown style)
        let formatted = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 3. Code blocks (inline)
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 rounded-sm font-mono text-sm">$1</code>');
        
        // 4. Lists and Paragraphs
        // Split by double newline to detect paragraphs
        const blocks = formatted.split(/\n\n+/);
        
        const htmlBlocks = blocks.map(block => {
            // Check if block is a list
            if (block.trim().startsWith('* ') || block.trim().startsWith('- ')) {
                const items = block.split(/\n/).map(line => {
                    const cleanLine = line.replace(/^[\*\-] /, '').trim();
                    if (!cleanLine) return '';
                    return `<li>${cleanLine}</li>`;
                }).join('');
                return `<ul class="list-disc list-inside ml-2 space-y-1 mb-2">${items}</ul>`;
            } else {
                // Regular paragraph - preserve single newlines as <br> if needed, or let wrapping handle it
                // Using whitespace-pre-wrap CSS class handles the actual spacing better than <br> spam
                return `<p class="mb-2">${block}</p>`;
            }
        });

        return { __html: htmlBlocks.join('') };
    };

    return (
        <div className={`w-full flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`max-w-[85%] sm:max-w-md w-fit rounded-2xl px-5 py-3.5 mb-3 shadow-sm ${bubbleClasses} text-sm sm:text-base leading-relaxed whitespace-pre-wrap`}
            >
                <div dangerouslySetInnerHTML={formatContent(message.content)} />
                {message.sources && message.sources.length > 0 && (
                     <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10">
                        <h5 className="text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" /></svg>
                            Sources:
                        </h5>
                        <ol className="list-decimal list-inside text-xs space-y-1 opacity-90">
                            {message.sources.map((source, index) => {
                                const sourceData = source.web || source.maps;
                                if (!sourceData) return null;
                                return (
                                <li key={index} className="truncate">
                                    <a href={sourceData.uri} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold" title={sourceData.title}>
                                        {sourceData.title || new URL(sourceData.uri).hostname}
                                    </a>
                                </li>
                            )})}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};


export const Chat: React.FC<ChatProps> = ({ initialContext, initialMessage, onOpenLimitModal }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, briefings, setUser } = context;

    const [chatSession, setChatSession] = useState<GeminiChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [isContextualChat, setIsContextualChat] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    // We use a container ref to scroll just the chat area, not the whole window.
    // This prevents the navigation bar from jumping.
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const recognitionRef = useRef<any>(null);
    const lastProcessedMessage = useRef<string | null>(null);

    // --- Voice Recognition Setup ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            };
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice input is not supported in this browser.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // --- Chat Setup ---
    useEffect(() => {
        setIsSessionEnded(false);
            const setupChat = async () => {
                setIsLoading(true);

                if (initialContext && initialContext.output?.suggestion) {
                    // Contextual chat
                    setIsContextualChat(true);
                    try {
                        const suggestionData = initialContext.output.suggestion;
                        const speciesName = initialContext.correction?.final_species || suggestionData.species_name;
                        
                        const greeting = await getContextualChatGreeting(
                            speciesName, 
                            suggestionData.confidence, 
                            suggestionData.main_text
                        );

                        const primerHistory: ChatMessage[] = [
                            {
                                role: 'user',
                                content: `We are discussing the marine animal I just identified. Here is the information about it:\n\nSpecies Name: ${speciesName}\nConfidence Score: ${suggestionData.confidence}%\nKey Identification Details:\n${suggestionData.main_text}`
                            },
                            {
                                role: 'model',
                                content: greeting
                            }
                        ];
                        
                        const newChat = createScubaSteveChat(primerHistory, [], user);
                        setChatSession(newChat);
                        setMessages([{ role: 'model', content: greeting }]);

                    } catch (error) {
                         console.error("Error priming contextual chat:", error);
                        const errorMessage: ChatMessage = {
                            role: 'model',
                            content: "I'm having a little trouble remembering that fish. What can I help you with?"
                        };
                        setMessages([errorMessage]);
                        setChatSession(createScubaSteveChat([], [], user)); 
                    }

                } else {
                    // General chat
                    setIsContextualChat(false);
                    let history = await getChatHistory(user.uid);
                    let sessionHistory: ChatMessage[] = [];

                    if (initialMessage) {
                        // Guard against infinite loops: If sending the message updates 'user',
                        // this effect re-runs. We check if we already processed this exact initial string.
                        if (lastProcessedMessage.current === initialMessage) {
                            // Don't re-send, but make sure chat session is initialized with latest context
                            const newChat = createScubaSteveChat(history, briefings, user);
                            setChatSession(newChat);
                            setMessages(history); 
                        } else {
                            lastProcessedMessage.current = initialMessage;
                            const userMessage: ChatMessage = { role: 'user', content: initialMessage };
                            const newChat = createScubaSteveChat(history, briefings, user);
                            setChatSession(newChat);
                            setMessages(history);
                            sendMessage(initialMessage, newChat, history);
                        }
                    } else if (history.length > 0) {
                        sessionHistory = history;
                        const newChat = createScubaSteveChat(history, briefings, user);
                        setChatSession(newChat);
                        setMessages(sessionHistory);
                    } else {
                        const firstMessage: ChatMessage = {
                            role: 'model',
                            content: `Ahoy, ${user.displayName?.split(' ')[0] || 'diver'}! I'm Scuba Steve, your AI dive buddy. 🐠 I can look back at our dive log if you have questions about past dives. Ask me anything about marine life, dive gear, or safety! How can I help you today?`
                        };
                        addChatMessage(user.uid, firstMessage);
                        sessionHistory = [firstMessage];
                        const newChat = createScubaSteveChat(history, briefings, user);
                        setChatSession(newChat);
                        setMessages(sessionHistory);
                    }
                }
                setIsLoading(false);
            };

            setupChat();
    }, [initialContext, user, initialMessage, briefings]);
    
    // Robust Auto-scroll logic that doesn't jump the whole page
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            // Using scrollTo on the container is safer than scrollIntoView for nested scrolling
            scrollContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight + 20, // +20 to ensure margin is cleared
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        // Small timeout ensures DOM is fully updated before scrolling
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, isLoading]);
    
    const sendMessage = async (messageContent: string, session?: GeminiChat | null, existingHistory?: ChatMessage[]) => {
        const currentSession = session || chatSession;
        if (!messageContent.trim() || !currentSession || isLoading || isSessionEnded) return;

        // 1. Strict Quota Check (blocks guests automatically)
        const allowed = canUserPerformBriefing(user.uid, 'chat');
        
        if (!allowed) {
            const isGuest = user.uid === 'mock-demo-user' || user.email === 'guest@scubasteve.rocks';
            const denialMessage: ChatMessage = {
                role: 'model',
                content: isGuest 
                    ? "🔒 **Guest Mode is View Only.**\n\nTo chat with Scuba Steve, identify marine life, or use AI tools, please sign in with Google." 
                    : "⏳ **Daily Chat Limit Reached.**\n\nYou've used your 10 free messages for today. Your quota will reset at midnight."
            };
            setMessages(prev => [...prev, { role: 'user', content: messageContent }, denialMessage]);
            
            if (!isGuest) {
                onOpenLimitModal();
            }
            return;
        }

        // Increment Usage
        incrementUserBriefingCount(user.uid, 'chat');
        // Force UI update for remaining count in header
        setUser(prev => prev ? { ...prev, dailyUsage: { ...prev.dailyUsage, briefingCount: prev.dailyUsage.briefingCount + 1 } } : null);

        const lowerUserInput = messageContent.toLowerCase();
        const donationKeywords = ['crypto', 'btc', 'bitcoin', 'xrp', 'ripple', 'support', 'donate'];
        const isDonationRequest = donationKeywords.some(keyword => lowerUserInput.includes(keyword));

        if (isDonationRequest) {
            const userMessage: ChatMessage = { role: 'user', content: messageContent };
            const donationMessage: ChatMessage = {
                role: 'model',
                content: `🌊 Thanks for supporting Scuba Steve! You can donate crypto to help us grow and keep developing ocean-AI tools.\n\n💰 **Bitcoin (BTC):**\n\`1ET6vBxCqy1uWS6FVSuamFueER6xDBnzr\`\n\n💎 **Ripple (XRP):**\nAddress: \`r34mWrX3cZCZpJEsqe1F6PNotREXwj1f3r\`\nDestination Tag: \`214572013\`\n\nEvery donation helps maintain the servers, add new marine-ID features, and fund ocean conservation. 🌍💦`
            };
            if (!isContextualChat) {
                addChatMessage(user.uid, userMessage);
                addChatMessage(user.uid, donationMessage);
            }
            setMessages(prev => [...prev, userMessage, donationMessage]);
            return;
        }
        
        const userMessage: ChatMessage = { role: 'user', content: messageContent };

        if (!isContextualChat && !initialMessage) {
            addChatMessage(user.uid, userMessage);
        }
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        abortControllerRef.current = new AbortController();
        let modelResponse = '';

        try {
            // Optimistic placeholder for streaming
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            const stream = await currentSession.sendMessageStream({ 
                message: messageContent,
            });

            const sources: GroundingChunk[] = [];
            const sourceUris = new Set<string>();

            for await (const chunk of stream) {
                 if (abortControllerRef.current?.signal?.aborted) {
                    console.log("Stream aborted by user.");
                    break;
                }
                modelResponse += chunk.text;

                const newChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web || c.maps);
                if (newChunks) {
                    for (const c of newChunks) {
                        const uri = c.web?.uri || c.maps?.uri;
                        if (uri && !sourceUris.has(uri)) {
                            sources.push(c as GroundingChunk);
                            sourceUris.add(uri);
                        }
                    }
                }

                setMessages(prev => prev.map((m, i) => 
                    i === prev.length - 1
                    ? { ...m, content: modelResponse, sources: sources.length > 0 ? sources : undefined } 
                    : m
                ));
            }
            const finalModelMessage: ChatMessage = { role: 'model', content: modelResponse, sources: sources.length > 0 ? sources : undefined };
             if (!isContextualChat) {
                 if (initialMessage) {
                    addChatMessage(user.uid, userMessage);
                 }
                addChatMessage(user.uid, finalModelMessage);
            }

        } catch (error: any) {
            if (error.name === 'AbortError') return;

            // If we have a partial response and catch a TypeError (likely 'signal of null'), 
            // assume the request actually succeeded and suppress the error UI.
            if (error instanceof TypeError && modelResponse.length > 0) {
                console.warn("Suppressing internal TypeError after successful stream:", error);
                return;
            }

            console.error("Error sending message:", error);
            
            const errorMessage: ChatMessage = {
                role: 'model',
                content: "Oops, looks like my radio is on the fritz. Please try again in a moment."
            };
             if (!isContextualChat) {
                addChatMessage(user.uid, errorMessage);
            }
            setMessages(prev => {
                const newMessages = [...prev];
                // Remove the empty placeholder if it exists or replace it
                if(newMessages[newMessages.length - 1].content === '') {
                    newMessages[newMessages.length - 1] = errorMessage;
                } else {
                    newMessages.push(errorMessage);
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
        setUserInput('');
    };
    
    const handleAbort = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    }

    // Dynamic height calculation to fit between header and keyboard/nav on mobile
    // h-[calc(100dvh-140px)] attempts to fill available vertical space accurately
    return (
        <div className="relative bg-light-bg dark:bg-dark-bg shadow-inner rounded-2xl w-full h-[calc(100dvh-180px)] sm:h-[75vh] flex flex-col overflow-hidden border border-black/5 dark:border-white/5">
            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scroll-smooth">
                {messages.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}

                 {isLoading && (
                    <div className="w-full flex justify-start animate-fade-in">
                        <div className="max-w-md w-fit rounded-2xl rounded-tl-none px-5 py-4 shadow-soft bg-light-card dark:bg-dark-card self-start flex items-center gap-2 border border-light-accent/10">
                            <span className="flex gap-1.5">
                                <span className="w-2 h-2 bg-light-accent/60 dark:bg-dark-accent/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-light-accent/60 dark:bg-dark-accent/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-light-accent/60 dark:bg-dark-accent/60 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 dark:bg-black/30 backdrop-blur-md border-t border-black/5 dark:border-white/5 relative z-10">
                 {isLoading && !isSessionEnded ? (
                    <button onClick={handleAbort} className="mx-auto w-fit bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-2 px-6 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Stop Generating
                    </button>
                ) : (
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-3xl mx-auto relative">
                    
                    {/* Voice Input Button */}
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                            isListening 
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' 
                            : 'bg-light-bg dark:bg-dark-bg text-light-text/70 dark:text-dark-text/70 hover:bg-light-accent/10 hover:text-light-accent dark:hover:text-dark-accent'
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
                            className={`w-full py-3.5 pl-5 pr-12 bg-light-card dark:bg-dark-card border border-light-accent/20 dark:border-dark-accent/20 rounded-full focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-all shadow-sm ${isListening ? 'ring-2 ring-red-400 border-red-400 placeholder-red-400' : ''}`}
                            disabled={isSessionEnded}
                        />
                        <button 
                            type="submit" 
                            disabled={!userInput.trim() || isLoading || isSessionEnded} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-light-accent dark:bg-dark-accent text-white rounded-full hover:opacity-90 transition-all disabled:opacity-0 disabled:scale-75 transform duration-200 shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};