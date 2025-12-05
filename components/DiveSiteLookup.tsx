
import React, { useState, useEffect, useContext } from 'react';
import { Briefing, SavedSite } from '../types';
import { BriefingResultContainer } from './JobResultContainer';
import { AppContext } from '../App';
import { toggleSavedSite } from '../services/userService';

interface DiveSiteLookupProps {
    startBriefing: (prompt: string) => void;
    currentBriefingResult: Briefing | null;
    isLoading: boolean;
    error: string | null;
    isBriefingLimitReached: boolean;
    hasSearched: boolean;
    onCancel?: () => void;
}

// Simple markdown formatter
const formatMarkdown = (content: string) => {
    if (!content) return { __html: '' };
    let html = content
        // A line that is entirely bold is a heading.
        .replace(/^\*\*(.*)\*\*$/gm, '<h3 class="font-heading font-bold text-2xl mt-4 mb-2">$1</h3>')
        // Any other bold text.
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Process lists: match consecutive lines starting with '* '
        .replace(/(?:^\* .*\r?\n?)+/gm, (match) => {
            const items = match.trim().split('\n').map(item => `<li>${item.substring(2).trim()}</li>`).join('');
            return `<ul class="list-disc list-inside space-y-1">${items}</ul>`;
        })
        .replace(/\n/g, '<br />');

    // The list processing might create <ul>...</ul><br />. Remove the trailing <br /> after a </ul>.
    html = html.replace(/<\/ul><br \/>/g, '</ul>');

    return { __html: html };
};

// --- Chilled Sonar Animation ---
const SonarLoader: React.FC = () => {
    const [text, setText] = useState("Scanning the horizon... 🌅");
    
    useEffect(() => {
        const messages = [
            "Ping... Ping... 📡",
            "Triangulating the reef... 🗺️",
            "Checking visibility... 👓",
            "Hailing the harbour master... 🛥️",
            "Reading the currents... 🌊",
            "Consulting the charts... 🧭"
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setText(messages[i]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
            {/* Sonar Screen */}
            <div className="relative w-40 h-40 bg-green-900/20 dark:bg-green-900/10 rounded-full border-2 border-green-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {/* Grid Lines */}
                <div className="absolute inset-0 border border-green-500/10 rounded-full transform scale-50"></div>
                <div className="absolute inset-0 border border-green-500/10 rounded-full transform scale-75"></div>
                <div className="absolute inset-0 w-[1px] h-full bg-green-500/20 left-1/2 -translate-x-1/2"></div>
                <div className="absolute inset-0 h-[1px] w-full bg-green-500/20 top-1/2 -translate-y-1/2"></div>

                {/* Sweep Arm */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-green-400/40 animate-[spin_3s_linear_infinite]"></div>
                
                {/* Blips */}
                <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80] animate-ping [animation-duration:2s]"></div>
                <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80] animate-ping [animation-duration:4s] [animation-delay:1s]"></div>
            </div>
            
            <p className="mt-6 text-lg font-medium text-light-text/80 dark:text-dark-text/80 font-mono animate-pulse">
                {text}
            </p>
        </div>
    );
};

const DiveSiteLookup: React.FC<DiveSiteLookupProps> = ({ startBriefing, currentBriefingResult, isLoading, error: appError, isBriefingLimitReached, hasSearched, onCancel }) => {
    const [siteName, setSiteName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'search' | 'saved'>('search');
    const [localViewingSite, setLocalViewingSite] = useState<SavedSite | null>(null);

    const context = useContext(AppContext);
    const user = context?.user;
    const savedSites = user?.savedSites || [];

    const handleLookup = async () => {
        if (!siteName.trim()) {
            setError('Please enter a dive site name.');
            return;
        }
        setLocalViewingSite(null); // Clear local saved view if performing new search
        setError(null);
        startBriefing(siteName);
    };
    
    const handleToggleSave = (siteToSave: SavedSite) => {
        if (!user) return;
        toggleSavedSite(user.uid, siteToSave);
        // Trigger context update or force rerender is handled by App.tsx logic updating user state
        if (context && context.setUser) {
             // Optimistically update user context for immediate feedback
             context.setUser(prev => {
                 if(!prev) return null;
                 return toggleSavedSite(prev.uid, siteToSave) || prev;
             });
        }
    };

    const handleDeleteSaved = (e: React.MouseEvent, site: SavedSite) => {
        e.stopPropagation();
        handleToggleSave(site);
        if (localViewingSite?.id === site.id) {
            setLocalViewingSite(null); // Close view if deleted
        }
    };

    // Determine what to show: A locally viewed saved site, OR the current result from API
    const activeBriefing = localViewingSite 
        ? { briefing: localViewingSite.briefingContent, sources: localViewingSite.sources || null, title: localViewingSite.name }
        : (currentBriefingResult && currentBriefingResult.type === 'dive_site' && currentBriefingResult.output?.briefing)
            ? { briefing: currentBriefingResult.output.briefing.briefing, sources: currentBriefingResult.output.briefing.sources, title: currentBriefingResult.input.prompt || 'Dive Site' }
            : null;

    const isCurrentSaved = activeBriefing && savedSites.some(s => s.name.toLowerCase() === activeBriefing.title.toLowerCase());

    const renderResult = () => {
        if (activeBriefing) {
             const briefingText = activeBriefing.briefing;
             
             if (briefingText.toLowerCase().includes("not found") || briefingText.toLowerCase().includes("couldn't find information")) {
                return (
                    <div className="text-center text-light-text/70 dark:text-dark-text/70 pt-12 animate-fade-in">
                        <h3 className="text-2xl font-semibold text-light-text dark:text-dark-text">Could not find "{activeBriefing.title}"</h3>
                        <p className="text-lg mt-2">Please check the spelling or try a more specific location.</p>
                    </div>
                );
            }
            
            return (
                 <BriefingResultContainer
                    briefing={currentBriefingResult || { createdAt: Date.now(), id: 0, userId: '', type: 'dive_site', input: {}, status: 'completed' }} // Mock briefing obj if local view
                    title={activeBriefing.title}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    actions={(
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleToggleSave({
                                    id: Date.now().toString(),
                                    name: activeBriefing.title,
                                    briefingContent: activeBriefing.briefing,
                                    sources: activeBriefing.sources || undefined,
                                    timestamp: Date.now()
                                })}
                                className={`bg-light-bg dark:bg-dark-bg font-bold py-2 px-4 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${isCurrentSaved ? 'text-red-500 border border-red-500/50' : 'text-light-text/50 dark:text-dark-text/50 hover:text-red-500 dark:hover:text-red-400'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {isCurrentSaved ? 'Saved' : 'Save to Favorites'}
                            </button>
                            
                            <button 
                                onClick={() => alert("PDF report generation is a premium feature coming soon!")}
                                title="Coming Soon! Premium Feature"
                                className="bg-light-bg dark:bg-dark-bg text-light-text/50 dark:text-dark-text/50 font-bold py-2 px-4 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                                PDF
                            </button>
                        </div>
                    )}
                >
                    <div className="space-y-4 text-left">
                        <div
                            className="prose dark:prose-invert max-w-none text-light-text dark:text-dark-text prose-strong:text-light-text dark:prose-strong:text-dark-text prose-headings:text-light-text dark:prose-headings:text-dark-text"
                            dangerouslySetInnerHTML={formatMarkdown(briefingText)}
                        />

                        {activeBriefing.sources && activeBriefing.sources.length > 0 && (
                            <div className="mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                                <h4 className="font-semibold text-lg font-heading mb-2">Sources from the web:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {activeBriefing.sources.map((source, index) => (
                                        source.web && <li key={index} className="text-light-text/70 dark:text-dark-text/70 truncate">
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-light-primary-end dark:text-dark-primary-end hover:underline" title={source.web.title}>
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </BriefingResultContainer>
            );
        }
        
        // Default empty/initial state
        return (
             <div className="text-center text-light-text/70 dark:text-dark-text/70 pt-12">
                {hasSearched && !currentBriefingResult && !localViewingSite ? (
                     <div className="text-center text-light-text/80 dark:text-dark-text/80 pt-12 animate-fade-in">
                        <h3 className="font-semibold text-2xl mb-2 font-heading text-light-text dark:text-dark-text">No Briefing Available</h3>
                        <p className="text-lg">Select this dive from your history to see the result again.</p>
                    </div>
                ) : (
                    <p className="text-lg">Enter a specific site (e.g. "SS Thistlegorm") or a region (e.g. "Thailand") to get a briefing.</p>
                )}
            </div>
        )
    };

    return (
        <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="font-heading font-semibold text-2xl sm:text-3xl">Dive Site & Conditions</h2>
                <div className="flex p-1 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <button 
                        onClick={() => { setTab('search'); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${tab === 'search' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-light-text/60 dark:text-dark-text/60'}`}
                    >
                        Search
                    </button>
                    <button 
                        onClick={() => { setTab('saved'); }}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${tab === 'saved' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-light-text/60 dark:text-dark-text/60'}`}
                    >
                        Saved ({savedSites.length})
                    </button>
                </div>
            </div>
            
            {tab === 'search' ? (
                <>
                    {isLoading ? (
                        <div className="py-4">
                            <SonarLoader />
                            {onCancel && (
                                <div className="text-center mt-4">
                                    <button 
                                        onClick={onCancel}
                                        className="text-red-500 dark:text-red-400 hover:underline text-sm font-bold"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                placeholder="e.g., 'Cozumel' or 'Red Sea'"
                                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-primary-end/30 dark:border-dark-primary-end/30 rounded-lg focus:ring-2 focus:ring-light-primary-end dark:focus:ring-dark-primary-end focus:border-light-primary-end dark:focus:border-dark-primary-end transition-shadow text-base placeholder-light-text/50 dark:placeholder-dark-text/50"
                                disabled={isBriefingLimitReached}
                                onKeyUp={(e) => e.key === 'Enter' && handleLookup()}
                            />
                            <button
                                onClick={handleLookup}
                                disabled={isBriefingLimitReached}
                                className="bg-light-primary-start/20 text-light-primary-start dark:bg-dark-primary-start/20 dark:text-dark-primary-start font-bold text-xl px-8 py-3 rounded-lg hover:bg-light-primary-start/30 dark:hover:bg-dark-primary-start/30 transition-colors shadow-md disabled:bg-gray-400/20 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isBriefingLimitReached ? 'Daily Limit Reached' : 'Get Briefing'}
                            </button>
                        </div>
                    )}

                    {!isLoading && (
                        <div className="mt-6">
                            {error ? (
                                <div className="text-center text-light-accent dark:text-dark-accent pt-12 animate-fade-in">
                                    <h3 className="font-semibold text-2xl mb-2 font-heading">Oops, something went wrong!</h3>
                                    <p className="text-lg">{error}</p>
                                </div>
                            ) : renderResult()}
                        </div>
                    )}
                </>
            ) : (
                <div className="animate-fade-in">
                    {savedSites.length === 0 ? (
                        <div className="text-center py-12 text-light-text/60 dark:text-dark-text/60">
                            <p className="text-lg mb-2">No saved briefings yet.</p>
                            <p className="text-sm">Search for a dive site and click the "Save" button to add it here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedSites.map(site => (
                                <div 
                                    key={site.id}
                                    onClick={() => { setLocalViewingSite(site); setTab('search'); }}
                                    className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl border border-black/5 dark:border-white/5 hover:border-light-accent/50 dark:hover:border-dark-accent/50 cursor-pointer group transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{site.name}</h4>
                                            <p className="text-xs text-light-text/60 dark:text-dark-text/60">Saved on {new Date(site.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDeleteSaved(e, site)}
                                            className="text-light-text/40 dark:text-dark-text/40 hover:text-red-500 dark:hover:text-red-400 p-1"
                                            title="Remove"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default DiveSiteLookup;
