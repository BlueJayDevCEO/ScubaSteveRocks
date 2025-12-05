
import React, { useState, useEffect } from 'react';
import { ScubaSteveLogo } from './ScubaSteveLogo';

const chilledMessages = [
  "Drifting with the current... 🌊",
  "Finding neutral buoyancy... ⚖️",
  "Watching the bubbles rise... 🫧",
  "Scanning the reef... 🐠",
  "Equalizing... 👂",
  "Just keep swimming... 🐢",
  "Checking air supply... 💨",
  "Enjoying the silence... 🤫",
  "Consulting the fish almanac... 📖"
];

interface GlobalLoaderProps {
    isLoading: boolean;
    onCancel?: () => void;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading, onCancel }) => {
    const [message, setMessage] = useState(chilledMessages[0]);
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (isLoading) {
            // Rotate messages slowly (every 4 seconds)
            const msgInterval = setInterval(() => {
                setMessage(prev => {
                    const currentIndex = chilledMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % chilledMessages.length;
                    return chilledMessages[nextIndex];
                });
            }, 4000);
            
            // Ellipsis animation
            const dotsInterval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 600);

            return () => {
                clearInterval(msgInterval);
                clearInterval(dotsInterval);
            };
        }
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-xl transition-all duration-700">
            {/* Gradient Overlay - Deep calm ocean vibes */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 via-blue-500/10 to-indigo-900/20 pointer-events-none"></div>
            
            {/* Ambient Bubbles */}
            <div className="bubble-container opacity-50">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bubble"></div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-8">
                {/* Animation Container */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                    {/* Slow Breathing Glow instead of frantic ripples */}
                    <div className="absolute inset-0 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 blur-2xl animate-[pulse_4s_ease-in-out_infinite]"></div>
                    
                    {/* Slow Rotating Rings */}
                    <div className="absolute inset-0 border-2 border-dashed border-light-accent/30 dark:border-dark-accent/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border-2 border-dotted border-light-accent/40 dark:border-dark-accent/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    
                    {/* Steve Floating Lazily */}
                    <div className="relative w-32 h-32 animate-float-steve">
                        <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(0,180,216,0.3)] flex items-center justify-center border border-white/30 p-2">
                            <ScubaSteveLogo className="w-full h-full drop-shadow-lg" />
                        </div>
                    </div>
                </div>

                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-light-text dark:text-dark-text mb-4 tracking-wide drop-shadow-md">
                    Thinking{dots}
                </h2>
                
                <div className="h-8 overflow-hidden flex items-center justify-center">
                    <p key={message} className="text-xl font-medium text-light-text/90 dark:text-dark-text/90 italic animate-fade-in text-center max-w-md px-4">
                        {message}
                    </p>
                </div>

                {onCancel && (
                    <button 
                        onClick={onCancel}
                        className="mt-12 px-8 py-3 bg-white/10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 text-light-text dark:text-dark-text rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl"
                    >
                        Cancel Request
                    </button>
                )}
            </div>
        </div>
    );
};
