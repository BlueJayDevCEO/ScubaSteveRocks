
import React, { useState, useEffect, useRef } from 'react';
import { ScubaSteveLogo } from './ScubaSteveLogo';

interface Step {
    title: string;
    content: string;
    targetSelector: string | null;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: Step[] = [
    {
        title: "Ahoy, Diver!",
        content: "I'm Scuba Steve, your AI Dive Buddy. Let me give you a quick tour of your new digital logbook and tool kit!",
        targetSelector: null, // Centered
    },
    {
        title: "Identify Marine Life",
        content: "Got a photo of a fish you can't name? Upload it here, and I'll identify it for you in seconds.",
        targetSelector: '[data-tour-id="nav-identify"]',
        position: 'top',
    },
    {
        title: "Chat & Plan",
        content: "This is the command center! Ask me anything about diving, plan trips, or get live conditions for local dive sites.",
        targetSelector: '[data-tour-id="nav-chat"]',
        position: 'top',
    },
    {
        title: "Sighting Map",
        content: "Explore a global map of recent marine life sightings logged by divers in the community.",
        targetSelector: '[data-tour-id="nav-map"]',
        position: 'top',
    },
    {
        title: "Your Dive Log",
        content: "All your activities are automatically saved here. Review your IDs, import old dives, and add notes to your log.",
        targetSelector: '[data-tour-id="nav-logbook"]',
        position: 'top',
    },
    {
        title: "Quick Chat",
        content: "Tap this button anytime, anywhere in the app to quickly start a new chat with me.",
        targetSelector: '[data-tour-id="fab-chat"]',
        position: 'left',
    },
    {
        title: "Your Profile",
        content: "Here you can check your daily usage, change your theme, and edit your profile details.",
        targetSelector: '[data-tour-id="profile-button"]',
        position: 'bottom',
    },
    {
        title: "You're all set!",
        content: "That's the basics. Time to dive in and explore. Happy bubbles! 🐠",
        targetSelector: null,
    },
];

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const Arrow: React.FC<{ pointsTo: 'up' | 'down' | 'left' | 'right' }> = ({ pointsTo }) => {
    const baseClasses = 'absolute w-0 h-0';
    let positionClasses = '';

    switch (pointsTo) {
        case 'down': // Attached to bubble bottom, points down
            positionClasses = 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-light-card dark:border-t-dark-card';
            break;
        case 'up': // Attached to bubble top, points up
            positionClasses = 'top-[-8px] left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-light-card dark:border-b-dark-card';
            break;
        case 'right': // Attached to bubble right, points right
            positionClasses = 'right-[-8px] top-1/2 -translate-y-1/2 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-light-card dark:border-l-dark-card';
            break;
        case 'left': // Attached to bubble left, points left
            positionClasses = 'left-[-8px] top-1/2 -translate-y-1/2 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-light-card dark:border-r-dark-card';
            break;
    }

    return <div className={`${baseClasses} ${positionClasses}`} />;
};

export const OnboardingGuide: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [isExiting, setIsExiting] = useState(false);

    const step = steps[currentStep];

    useEffect(() => {
        if (step.targetSelector) {
            const element = document.querySelector<HTMLElement>(step.targetSelector);
            if (element) {
                // Scroll the element into view smoothly.
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                // Wait for scrolling to finish before getting the element's position.
                const scrollTimeout = setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    });
                }, 300); // 300ms delay to allow for smooth scrolling.

                return () => clearTimeout(scrollTimeout);
            } else {
                setTargetRect(null); // If target not found, center the bubble.
            }
        } else {
            setTargetRect(null); // No target selector, so center the bubble.
        }
    }, [currentStep, step.targetSelector]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(() => {
            onComplete();
        }, 300); // Corresponds to animation duration
    };

    const getBubblePosition = (): React.CSSProperties => {
        if (!targetRect) { // Center screen for steps without a target
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const position = step.position || 'bottom';
        switch (position) {
            case 'top':
                return { top: targetRect.top - 16, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
            case 'bottom':
                return { top: targetRect.top + targetRect.height + 16, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
            case 'left':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.left - 16, transform: 'translate(-100%, -50%)' };
            case 'right':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.left + targetRect.width + 16, transform: 'translate(0, -50%)' };
            default:
                return {};
        }
    };
    
    const getArrowDirection = (position: 'top' | 'bottom' | 'left' | 'right'): 'up' | 'down' | 'left' | 'right' => {
        switch (position) {
            case 'top': return 'down';
            case 'bottom': return 'up';
            case 'left': return 'right';
            case 'right': return 'left';
        }
    };
    
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-live="polite">
            {/* Spotlight element: a div that creates a cutout effect using box-shadow */}
            <div
                className="absolute rounded-lg border-2 border-dashed border-white/80 transition-all duration-300 ease-in-out pointer-events-none"
                style={{
                    top: (targetRect?.top ?? window.innerHeight / 2) - 8,
                    left: (targetRect?.left ?? window.innerWidth / 2) - 8,
                    width: (targetRect?.width ?? 0) + 16,
                    height: (targetRect?.height ?? 0) + 16,
                    // The magic: a huge box-shadow creates the overlay effect.
                    boxShadow: '0 0 0 9999px rgba(0, 20, 30, 0.7)',
                }}
            />
            
            {/* Info Bubble */}
            <div
                className="absolute bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-4 w-72 flex flex-col gap-3 transition-all duration-300 ease-in-out"
                style={getBubblePosition()}
            >
                {step.targetSelector && <Arrow pointsTo={getArrowDirection(step.position || 'bottom')} />}
                <div className="flex items-center gap-3">
                    <ScubaSteveLogo className="w-12 h-12 rounded-full flex-shrink-0" />
                    <h3 className="font-heading font-bold text-xl">{step.title}</h3>
                </div>
                <p className="text-sm text-light-text/80 dark:text-dark-text/80">{step.content}</p>
                <div className="flex justify-between items-center mt-2">
                    <button onClick={handleComplete} className="text-sm text-light-text/60 dark:text-dark-text/60 hover:underline">Skip Tour</button>
                    <button onClick={handleNext} className="bg-gradient-to-r from-light-accent to-light-secondary text-white font-bold py-2 px-4 rounded-md">
                        {isLastStep ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
