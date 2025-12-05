
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { playDiveGame } from '../services/geminiService';
import { updateGameProgress, upgradeUserToPro, MAX_FREE_LEVEL, MAX_GAME_LEVEL } from '../services/userService';
import { GameRound, GameProgress, Briefing } from '../types';
import { SkeletonLoader } from './SkeletonLoader';

interface DiveTrainingGameViewProps {
    onBack: () => void;
    onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void;
}

const GAME_PATHS = [
    { id: 'marine_life', label: 'Marine Life ID', icon: '🐠', description: 'Identify fish & corals' },
    { id: 'safety', label: 'Safety & Rescue', icon: '⛑️', description: 'Emergency protocols' },
    { id: 'equipment', label: 'Equipment Mastery', icon: '🤿', description: 'Regulators to BCDs' },
    { id: 'environment', label: 'Eco-Diver', icon: '🌱', description: 'Conservation knowledge' },
    { id: 'hand_signals', label: 'Hand Signals', icon: '👌', description: 'Underwater communication' },
    { id: 'physics', label: 'Dive Physics', icon: '📐', description: 'Pressure & gas laws' },
];

const DIFFICULTY_LABELS = ['Beginner', 'Intermediate', 'Advanced', 'Divemaster', 'Instructor'];

const LevelCapOverlay: React.FC<{ onUpgrade: () => void, isUpgrading: boolean }> = ({ onUpgrade, isUpgrading }) => (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 animate-fade-in rounded-2xl">
        <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl max-w-md border border-yellow-500/50">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-heading font-bold text-3xl mb-4">Level Limit Reached</h2>
            <p className="text-lg mb-6">
                You've completed the Open Water training (Level {MAX_FREE_LEVEL}). To continue your journey to <strong>Master Diver (Level {MAX_GAME_LEVEL})</strong>, you need to upgrade to Pro.
            </p>
            <button 
                onClick={onUpgrade}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xl py-3 rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:transform-none"
            >
                {isUpgrading ? 'Unlocking...' : 'Upgrade to Pro - $5/mo'}
            </button>
            <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-4">
                Unlocks all 25 levels, advanced scenarios, and supports ocean conservation.
            </p>
        </div>
    </div>
);

export const DiveTrainingGameView: React.FC<DiveTrainingGameViewProps> = ({ onBack, onLogActivity }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, setUser } = context;

    const [gameState, setGameState] = useState<'menu' | 'loading' | 'playing' | 'feedback'>('menu');
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<GameProgress>(user.gameProgress || { totalXP: 0, level: 1, badges: [] });
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Check if user is capped
    const isCapped = !user.isPro && progress.level >= MAX_FREE_LEVEL;

    const handleStartRound = async (path: string) => {
        if (isCapped) return;

        setSelectedPath(path);
        setCurrentRound(null); // Clear previous round
        setGameState('loading');
        setError(null);
        try {
            const round = await playDiveGame(path, progress.level);
            setCurrentRound(round);
            setGameState('playing');
            setSelectedOption(null);
        } catch (e) {
            console.error(e);
            setError("Steve's underwater slate got washed away. Try again.");
            setGameState('menu');
        }
    };

    const checkCorrectness = (option: string, correct: string) => {
        const normOption = option.trim().toLowerCase();
        const normCorrect = correct.trim().toLowerCase();
        
        // If correct answer is short (e.g. "A", "B"), verify start of option
        if (normCorrect.length === 1) {
             return normOption.startsWith(`${normCorrect}.`) || normOption.startsWith(`${normCorrect})`) || normOption === normCorrect;
        }

        // Otherwise check for loose match to handle AI formatting variations
        return normOption === normCorrect || normOption.includes(normCorrect) || normCorrect.includes(normOption);
    };

    const handleOptionSelect = (option: string) => {
        if (!currentRound) return;
        setSelectedOption(option);
        setGameState('feedback');

        const isCorrect = checkCorrectness(option, currentRound.correct_answer);

        if (isCorrect) {
            const newProgress = updateGameProgress(
                user.uid, 
                currentRound.xp_reward, 
                currentRound.achievement_unlock
            );
            setProgress(newProgress);
            // Update global user state to reflect progress immediately
            setUser(prev => prev ? { ...prev, gameProgress: newProgress } : null);
        }
        
        // Log activity
        if (onLogActivity) {
            onLogActivity('game_round', {
                gameRound: {
                    ...currentRound,
                    user_answer: option,
                    is_correct: isCorrect
                }
            }, `Training: ${currentRound.title} (${isCorrect ? 'Correct' : 'Incorrect'})`);
        }
    };

    const handleNextRound = () => {
        // If user hits the cap after this round, they will see the overlay on the menu
        if (selectedPath) {
            // Check cap again before starting next round
            if (!user.isPro && progress.level >= MAX_FREE_LEVEL) {
                setGameState('menu');
            } else {
                handleStartRound(selectedPath);
            }
        } else {
            setGameState('menu');
        }
    };

    const handleUpgrade = () => {
        setIsUpgrading(true);
        // Simulate API call
        setTimeout(() => {
            upgradeUserToPro(user.uid);
            const updatedUser = { ...user, isPro: true };
            setUser(updatedUser); // Update global state
            setIsUpgrading(false);
        }, 2000);
    };

    // Calculate percentage for circle progress (0-100 for current level)
    const levelProgress = progress.totalXP % 100;

    return (
        <section className="w-full animate-fade-in bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-6 sm:p-8 border-2 border-light-primary-start/20 dark:border-dark-primary-start/20 relative overflow-hidden min-h-[500px]">
            
            {/* Level Cap Overlay */}
            {isCapped && gameState === 'menu' && (
                <LevelCapOverlay onUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
            )}

            {/* Header Stats */}
            <div className="flex items-center justify-between mb-6 border-b border-black/10 dark:border-white/10 pb-4 relative z-0">
                <button onClick={onBack} className="text-sm font-bold text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Exit Game
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-light-text/50 dark:text-dark-text/50">Level {progress.level} / {MAX_GAME_LEVEL}</p>
                        <p className="font-heading font-bold text-light-accent dark:text-dark-accent">{DIFFICULTY_LABELS[Math.min(Math.floor((progress.level - 1) / 5), DIFFICULTY_LABELS.length - 1)]}</p>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-light-bg dark:text-dark-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-light-primary-start dark:text-dark-primary-start transition-all duration-1000 ease-out" strokeDasharray={`${levelProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        <span className="absolute text-xs font-bold">{progress.totalXP}</span>
                    </div>
                </div>
            </div>

            {/* Menu State */}
            {gameState === 'menu' && (
                <div className="animate-fade-in relative z-0">
                    <div className="text-center mb-8">
                        <h2 className="font-heading font-bold text-3xl mb-2">Dive Training Simulator</h2>
                        <p className="text-light-text/80 dark:text-dark-text/80">Choose a specialization to begin your training.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {GAME_PATHS.map(path => (
                            <button
                                key={path.id}
                                onClick={() => handleStartRound(path.label)}
                                disabled={isCapped}
                                className="flex items-center gap-4 p-4 bg-light-bg dark:bg-dark-bg rounded-xl hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 border border-transparent hover:border-light-accent dark:hover:border-dark-accent transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform">{path.icon}</span>
                                <div>
                                    <h3 className="font-bold text-lg">{path.label}</h3>
                                    <p className="text-xs text-light-text/60 dark:text-dark-text/60">{path.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                </div>
            )}

            {/* Loading State */}
            {gameState === 'loading' && (
                <div className="flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                    <div className="w-16 h-16 bg-light-bg dark:bg-dark-bg rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-light-bg dark:bg-dark-bg rounded mb-2"></div>
                    <div className="h-3 w-32 bg-light-bg dark:bg-dark-bg rounded"></div>
                    <p className="mt-4 font-bold text-light-accent dark:text-dark-accent animate-[bounce_2s_infinite]">Steve is checking the dive charts...</p>
                </div>
            )}

            {/* Playing & Feedback States */}
            {(gameState === 'playing' || gameState === 'feedback') && currentRound && (
                <div className="animate-fade-in max-w-2xl mx-auto">
                    <h3 className="font-heading font-bold text-2xl mb-4 text-center">{currentRound.title}</h3>
                    <div className="bg-light-bg/50 dark:bg-dark-bg/50 p-6 rounded-xl mb-6 text-lg font-medium leading-relaxed">
                        {currentRound.scenario}
                    </div>

                    <div className="space-y-3">
                        {currentRound.options.map((option, idx) => {
                            let btnClass = "w-full p-4 rounded-xl text-left font-semibold transition-all border-2 ";
                            const isSelected = selectedOption === option;
                            
                            const isCorrect = checkCorrectness(option, currentRound.correct_answer);

                            if (gameState === 'playing') {
                                btnClass += "bg-light-bg dark:bg-dark-bg border-transparent hover:border-light-accent dark:hover:border-dark-accent hover:shadow-md";
                            } else {
                                // Feedback state
                                if (isCorrect) {
                                    btnClass += "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300";
                                } else if (isSelected && !isCorrect) {
                                    btnClass += "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 opacity-60";
                                } else {
                                    btnClass += "bg-light-bg dark:bg-dark-bg border-transparent opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => gameState === 'playing' && handleOptionSelect(option)}
                                    disabled={gameState !== 'playing'}
                                    className={btnClass}
                                >
                                    <span className="inline-block w-6 font-bold opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {gameState === 'feedback' && (
                        <div className="mt-8 animate-fade-in">
                            {(() => {
                                const isCorrect = selectedOption 
                                    ? checkCorrectness(selectedOption, currentRound.correct_answer)
                                    : false;

                                return (
                                    <>
                                        <div className={`p-4 rounded-xl mb-4 border-l-4 ${
                                            isCorrect
                                            ? 'bg-green-500/10 border-green-500' 
                                            : 'bg-red-500/10 border-red-500'
                                        }`}>
                                            <h4 className="font-bold mb-1">
                                                {isCorrect
                                                    ? `Correct! +${currentRound.xp_reward} XP` 
                                                    : 'Not quite right.'}
                                            </h4>
                                            <p className="text-sm opacity-90">{currentRound.explanation}</p>
                                        </div>
                                        
                                        {/* Achievement Unlock: Only show if correct */}
                                        {isCorrect && currentRound.achievement_unlock && (
                                            <div className="flex items-center justify-center gap-2 p-2 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-lg mb-4 font-bold animate-pop-out" style={{ animationFillMode: 'none' }}>
                                                <span>🏆 Achievement Unlocked:</span>
                                                <span>{currentRound.achievement_unlock}</span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            <button 
                                onClick={handleNextRound}
                                className="w-full py-4 bg-gradient-to-r from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent text-white font-bold text-xl rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                            >
                                Next Dive Scenario &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
