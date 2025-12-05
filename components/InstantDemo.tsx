
import React, { useState, useRef, useEffect } from 'react';
import { createPartnerDemoChat } from '../services/geminiService';
import { Chat as GeminiChat } from '@google/genai';
import { ChatMessage } from '../types';
import { ChatMessageBubble } from './Chat';

const MAX_USER_MESSAGES = 3; // Allow 3 user messages

export const InstantDemo: React.FC = () => {
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [chatSession, setChatSession] = useState<GeminiChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [userMessageCount, setUserMessageCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleCreateDemo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!websiteUrl.trim() || !location.trim()) {
            setError('Please provide both a website URL and a location.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessages([]);
        setUserMessageCount(0);
        setChatSession(null);

        try {
            const chat = createPartnerDemoChat(websiteUrl, location);
            setChatSession(chat);
            const response = await chat.sendMessage({ message: "Hello, please introduce yourself as an AI assistant for this dive shop and ask how you can help me plan a dive. Keep it brief." });
            setMessages([{ role: 'model', content: response.text }]);
        } catch (err) {
            console.error("Failed to create demo chat:", err);
            setError("Could not create the demo bot. Please check the URL and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatSession || isLoading || userMessageCount >= MAX_USER_MESSAGES) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]); // Add user message and placeholder for model
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chatSession.sendMessage({ message: userInput });
            const newModelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = newModelMessage; // Replace placeholder
                
                // Check if the message limit is now reached
                if (userMessageCount + 1 >= MAX_USER_MESSAGES) {
                    updatedMessages.push({
                        role: 'model',
                        content: "This has been a short demo of what's possible! To get a fully featured Scuba Steve for your shop with unlimited conversations, please see the 'Hire Scuba Steve' section above. 🤙"
                    });
                }
                return updatedMessages;
            });
            
        } catch (err) {
            console.error("Error in demo chat:", err);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I had a communication glitch. Please try asking again." };
            setMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = errorMessage;
                return updatedMessages;
            });
        } finally {
            setUserMessageCount(prev => prev + 1);
            setIsLoading(false);
        }
    };

    const isDemoEnded = userMessageCount >= MAX_USER_MESSAGES;

    return (
        <div id="demo" className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4 text-center">Try an Instant Demo</h2>
            <p className="max-w-3xl mx-auto text-lg text-light-text/80 dark:text-dark-text/80 mb-6 text-center">
                Enter your shop's website and location to generate a temporary AI assistant. See how Steve can answer questions based on your content.
            </p>
            
            <form onSubmit={handleCreateDemo} className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourdiveshop.com"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"
                    required
                />
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"
                    required
                />
                <button type="submit" disabled={isLoading} className="bg-light-accent dark:bg-dark-accent text-white font-bold text-lg py-3 px-6 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400">
                    {isLoading ? 'Building...' : 'Try Steve'}
                </button>
            </form>

            {error && <p className="text-center text-light-accent dark:text-dark-accent mb-4">{error}</p>}

            {chatSession && (
                <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-6">
                    <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 h-96 flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {messages.map((msg, index) => <ChatMessageBubble key={index} message={msg} />)}
                             {isLoading && (
                                <div className="w-full flex justify-start">
                                    <div className="max-w-md w-fit rounded-2xl px-4 py-3 mb-3 shadow-md bg-light-card dark:bg-dark-card self-start flex items-center gap-2">
                                        <div className="w-2 h-2 bg-light-text/50 dark:bg-dark-text/50 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-light-text/50 dark:bg-dark-text/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-light-text/50 dark:bg-dark-text/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={isDemoEnded ? "Demo ended." : "Ask about our dives..."}
                                className="w-full p-3 bg-white dark:bg-dark-card border border-black/20 dark:border-white/20 rounded-lg disabled:bg-gray-200 dark:disabled:bg-gray-700"
                                disabled={isLoading || isDemoEnded}
                            />
                            <button type="submit" disabled={!userInput.trim() || isLoading || isDemoEnded} className="bg-light-accent dark:bg-dark-accent text-white p-3 rounded-lg hover:opacity-90 disabled:bg-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
