
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Briefing } from '../types';
import { AppContext } from '../App';
import { BriefingResultContainer } from './JobResultContainer';

type Theme = 'light' | 'dark' | 'system';

interface SurfaceIntervalViewProps {
    startBriefing: (prompt: string, file: File | null) => void;
    currentBriefingResult: Briefing | null;
    isLoading: boolean;
    error: string | null;
    isBriefingLimitReached: boolean;
    onOpenChat: () => void;
    onCancel?: () => void;
}

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
}

const formatRecipe = (markdown: string): string => {
    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    let html = '';
    let inUl = false;
    let inOl = false;

    for (const line of lines) {
        if (!line.startsWith('* ') && inUl) { html += '</ul>'; inUl = false; }
        if (!line.match(/^\d+\. /) && inOl) { html += '</ol>'; inOl = false; }

        if (line.startsWith('### ')) {
            html += `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith('#### ')) {
            html += `<h4>${line.substring(5)}</h4>`;
        } else if (line.startsWith('* ')) {
            if (!inUl) { html += '<ul>'; inUl = true; }
            html += `<li>${line.substring(2).replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`;
        } else if (line.match(/^\d+\. /)) {
            if (!inOl) { html += '<ol>'; inOl = true; }
            html += `<li>${line.replace(/^\d+\. /, '').replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`;
        } else {
            html += `<p>${line.replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
        }
    }
    if (inUl) html += '</ul>';
    if (inOl) html += '</ol>';
    return html;
};

const RecipeResult: React.FC<{ markdown: string, briefing: Briefing }> = ({ markdown, briefing }) => {
    return (
        <BriefingResultContainer
            briefing={briefing}
            title="Steve's Dive Diet Recipe"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM15 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM1.088 6.088a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L1.088 7.502a1 1 0 010-1.414zM15.5 6.088a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 10a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>}
            actions={(
                <button 
                    onClick={() => alert("PDF report generation is a premium feature coming soon!")}
                    title="Coming Soon! Premium Feature"
                    className="bg-light-bg dark:bg-dark-bg text-light-text/50 dark:text-dark-text/50 font-bold py-2 px-4 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    Download PDF Report
                </button>
            )}
        >
             <div
                className="recipe-content"
                dangerouslySetInnerHTML={{ __html: formatRecipe(markdown) }}
            />
        </BriefingResultContainer>
    )
}

export const SurfaceIntervalView: React.FC<SurfaceIntervalViewProps> = ({ startBriefing, currentBriefingResult, isLoading, error: appError, isBriefingLimitReached, onOpenChat, onCancel }) => {
    const [ingredients, setIngredients] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [status, setStatus] = useState("What's in your galley? Let's whip up a post-dive meal! This counts as one daily Briefing.");
    const [countdown, setCountdown] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [loaderText, setLoaderText] = useState("Charting a course for your galley...");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const context = useContext(AppContext);
    const theme = context?.theme || 'system';
    
    useEffect(() => {
        if (isBriefingLimitReached) {
            setStatus("You've reached your daily briefing limit. Come back tomorrow! ⏳");
        } else {
            // Reset status if not limited or errored
            setStatus("What's in your galley? Let's whip up a post-dive meal! This counts as one daily Briefing.");
        }
    }, [isBriefingLimitReached]);


    // Countdown timer effect
    useEffect(() => {
        let timerId: number;
        if (isLoading && countdown > 0) {
            timerId = window.setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (isLoading && countdown === 0) {
            setLoaderText("Adding the final garnish...");
        }
        return () => clearTimeout(timerId);
    }, [isLoading, countdown]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const dataURL = await fileToDataURL(file);
            setPhotoPreview(dataURL);
        } else {
            // User cancelled, clear state
            setPhotoFile(null);
            setPhotoPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleGetRecipe = async () => {
        if (isBriefingLimitReached) return;

        const rawIngredients = ingredients.trim();
        if (!rawIngredients && !photoPreview) {
            setStatus("Add a few ingredients or a fridge photo.");
            return;
        }
        
        setHasSearched(true);
        setLoaderText("Charting a course for your galley…");
        setCountdown(7); // Start a 7-second countdown
        setStatus("Steve is checking the pantry...");
        startBriefing(rawIngredients, photoFile);
    };
    
    const handleClear = () => {
        setIngredients('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setHasSearched(false);
        setStatus("What's in your galley? Let's whip up a post-dive meal! This counts as one daily Briefing.");
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const themeClass = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;

    const recipeResult = currentBriefingResult?.type === 'surface_interval' && currentBriefingResult.output?.recipe
        ? currentBriefingResult.output.recipe
        : null;

    return (
        <section className="w-full">
             {!isLoading && !recipeResult && (
                <div id="si-wrap" className={`${themeClass} animate-fade-in`}>
                    <div id="si-head">
                        <h2 id="si-title">Steve's Dive Diet</h2>
                        <button id="si-cam" className="si-btn" onClick={() => fileInputRef.current?.click()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <textarea 
                        id="si-ingredients"
                        placeholder="Type ingredients (e.g., tuna, mayo, bread), or snap a photo of your fridge!"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        disabled={isBriefingLimitReached}
                        rows={3}
                    />
                    {photoPreview && (
                        <div className="my-4 h-48 w-full bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center relative">
                            <img src={photoPreview} alt="Ingredients" className="max-h-full max-w-full object-contain rounded-lg" />
                             <button 
                                onClick={() => { setPhotoFile(null); setPhotoPreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                                title="Remove Photo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                         {(ingredients || photoPreview) && (
                             <button 
                                onClick={handleClear}
                                className="si-btn"
                                style={{ background: 'rgba(100,100,100,0.1)', color: 'inherit', border: '1px solid rgba(100,100,100,0.2)' }}
                             >
                                 Clear
                             </button>
                         )}
                        <button id="si-btn" className="si-btn flex-grow" onClick={handleGetRecipe} disabled={isBriefingLimitReached || isLoading}>
                            {isBriefingLimitReached ? "Limit Reached" : "Get Recipe"}
                        </button>
                    </div>

                    <p id="si-status">{status}</p>
                </div>
            )}
            {isLoading && (
                <div id="si-loader" className={`${themeClass} animate-fade-in`}>
                    <div id="si-loader-text">{loaderText}</div>
                    <div id="si-countdown">{countdown > 0 ? countdown : '🍲'}</div>
                    <div id="si-loader-bubbles">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                     {onCancel && (
                        <button 
                            onClick={onCancel}
                            className="mt-4 bg-red-500/80 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-colors z-20 relative"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
            
            {recipeResult && currentBriefingResult && (
                 <div className="animate-fade-in">
                    <RecipeResult markdown={recipeResult} briefing={currentBriefingResult} />
                 </div>
            )}
            {!isLoading && !recipeResult && hasSearched && !appError && (
                 <div className="text-center text-light-text/80 dark:text-dark-text/80 pt-12 animate-fade-in">
                    <h3 className="font-semibold text-2xl mb-2 font-heading text-light-text dark:text-dark-text">No Recipe Available</h3>
                    <p className="text-lg">Select this from your history to see the result again.</p>
                </div>
            )}

        </section>
    );
};

export default SurfaceIntervalView;
