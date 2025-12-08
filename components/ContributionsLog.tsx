
import React, { useState, useMemo, useEffect, useContext } from 'react';
import { Briefing, User } from '../types';
import { AppContext, LogbookTab } from '../App';
import { DiveLogImporter } from './DiveLogImporter';

interface LogbookViewProps {
  onSelectBriefing: (briefing: Briefing) => void;
  onImportBriefings: (briefings: Briefing[]) => void;
  initialTab?: LogbookTab;
}

export const BriefingCard: React.FC<{ briefing: Briefing; onSelectBriefing: (briefing: Briefing) => void }> = ({ briefing, onSelectBriefing }) => {
    const isUserCorrection = !!briefing.correction?.final_species;
    let title = 'Briefing';
    let imageUrl: string | undefined;
    let details: string | undefined;

    switch (briefing.type) {
        case 'marine_id':
            title = briefing.correction?.final_species || briefing.output?.suggestion?.species_name || 'Marine ID';
            imageUrl = briefing.input?.imageUrls?.[0];
            details = briefing.output?.suggestion?.confidence !== undefined ? `Confidence: ${briefing.output.suggestion.confidence}%` : 'View Details';
            break;
        case 'species_search':
            title = briefing.output?.suggestion?.species_name || briefing.input.prompt || 'Species Search';
            details = "View Info";
            break;
        case 'color_correct':
            title = 'Color Correction';
            imageUrl = briefing.output?.correctedImageUrl || briefing.input?.imageUrls?.[0];
            details = "Corrected Photo";
            break;
        case 'dive_site':
            title = briefing.input.prompt || 'Dive Site Briefing';
            details = "View Briefing";
            break;
        case 'live_report':
            title = 'Live Dive Report';
            details = "View Report";
            break;
        case 'trip_planner':
            title = `Trip to ${briefing.input.prompt || 'destination'}`;
            details = "View Plan";
            break;
        case 'voice':
            title = 'Voice Chat Session';
            details = "View Transcript";
            break;
        case 'imported_dive':
            title = briefing.location || 'Imported Dive';
            imageUrl = briefing.input?.imageUrls?.[0];
            details = `${briefing.max_depth || '--'}m / ${briefing.dive_time || '--'}min`;
            break;
        case 'surface_interval':
            title = "Dive Diet Recipe";
            details = "View Recipe";
            break;
        case 'game_round':
            title = briefing.input.prompt || "Training Game";
            details = briefing.output?.gameRound?.is_correct ? "✅ Correct Answer" : "❌ Incorrect Answer";
            break;
        case 'calculator':
            title = briefing.output?.calculatorData?.title || "Calculator Result";
            details = briefing.output?.calculatorData?.result || "View Calculation";
            break;
        default:
             title = "Log Entry";
             details = "View Details";
    }

    const placeholderIcon = () => {
        switch (briefing.type) {
            case 'dive_site': return (
                <div className="text-sky-500 dark:text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
            );
            case 'trip_planner': return (
                <div className="text-emerald-500 dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>
                </div>
            );
            case 'voice': return (
                <div className="text-fuchsia-500 dark:text-fuchsia-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
            );
            case 'imported_dive': return (
                <div className="text-blue-500 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
            );
            case 'species_search': return (
                <div className="text-cyan-500 dark:text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            );
            case 'surface_interval': return (
                <div className="text-lime-500 dark:text-lime-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM15 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM1.088 6.088a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L1.088 7.502a1 1 0 010-1.414zM15.5 6.088a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 10a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>
                </div>
            );
            case 'game_round': return (
                <div className="text-amber-500 dark:text-amber-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            );
            case 'calculator': return (
                <div className="text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v6m0-6L9 13" /></svg>
                </div>
            );
            default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-light-accent/50 dark:text-dark-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
        }
    }

    return (
        <div
            onClick={() => onSelectBriefing(briefing)}
            className="relative bg-light-card dark:bg-dark-card rounded-lg shadow-soft dark:shadow-soft-dark overflow-hidden cursor-pointer group border border-black/5 dark:border-white/5 transition-all hover:-translate-y-1"
        >
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
                <div className="w-full h-32 flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                   {placeholderIcon()}
                </div>
            )}
            <div className="p-3">
                <h4 className="font-bold text-sm truncate group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{title}</h4>
                <p className="text-xs text-light-text/70 dark:text-dark-text/70">{details}</p>
                 {isUserCorrection && <span className="absolute top-2 right-2 text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 dark:bg-yellow-500/20 px-2 py-0.5 rounded-full">Corrected</span>}
            </div>
        </div>
    );
};


const LogbookView: React.FC<LogbookViewProps> = ({ onSelectBriefing, onImportBriefings, initialTab }) => {
    const [activeTab, setActiveTab] = useState<LogbookTab>(initialTab || 'dives');
    const [searchTerm, setSearchTerm] = useState('');
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, briefings } = context;

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const filteredAndSortedBriefings = useMemo(() => {
        const sorted = [...briefings].sort((a, b) => b.createdAt - a.createdAt);
        
        // 1. Filter by Tab Category
        let tabFiltered = sorted;
        if (activeTab === 'dives') {
            // "Actual" Dives: Imported CSV logs or manually added logs (future)
            // Ideally also 'marine_id' if user flagged it as a dive, but for now strict separation
            tabFiltered = sorted.filter(b => b.type === 'imported_dive');
        } else if (activeTab === 'activity') {
            // App Usage: Everything NOT an imported dive
            tabFiltered = sorted.filter(b => b.type !== 'imported_dive');
        }

        // 2. Filter by Search Term
        if (!searchTerm.trim()) {
            return tabFiltered;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();

        return tabFiltered.filter(b => {
            const searchableText = [
                b.correction?.final_species,
                b.output?.suggestion?.species_name,
                b.location,
                b.input.prompt,
                b.notes,
                b.species_sighted,
                b.output?.calculatorData?.title,
                b.output?.calculatorData?.result
            ].filter(Boolean).join(' ').toLowerCase();

            return searchableText.includes(lowerCaseSearch);
        });
    }, [briefings, searchTerm, activeTab]);

    return (
        <div className="w-full animate-fade-in">
            <h2 className="font-heading font-bold text-3xl text-center mb-6">Your Dive Logbook</h2>
            
            <div className="flex items-center justify-center border-b border-black/10 dark:border-white/10 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('dives')} 
                    className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'dives' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}
                >
                    🤿 Dive Logs
                </button>
                <button 
                    onClick={() => setActiveTab('activity')} 
                    className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}
                >
                    🤖 App Activity
                </button>
                <button 
                    onClick={() => setActiveTab('import')} 
                    className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'import' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}
                >
                    📥 Import
                </button>
            </div>

            {(activeTab === 'dives' || activeTab === 'activity') && (
                 <div>
                      <div className="mb-6 relative">
                        <input
                            type="search"
                            placeholder={activeTab === 'dives' ? "Search locations, dates, notes..." : "Search IDs, chats, recipes..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-text/20 dark:border-dark-text/20 rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-all"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text/50 dark:text-dark-text/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                     {filteredAndSortedBriefings.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredAndSortedBriefings.map(b => (
                                <BriefingCard key={b.id} briefing={b} onSelectBriefing={onSelectBriefing} />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center text-lg text-light-text/70 dark:text-dark-text/70 py-12">
                            <p>{searchTerm ? `No results found for "${searchTerm}".` : "No entries found in this category."}</p>
                            {!searchTerm && activeTab === 'dives' && (
                                <div className="mt-4">
                                    <p className="mb-4">You haven't imported any dives yet.</p>
                                    <button onClick={() => setActiveTab('import')} className="text-light-accent dark:text-dark-accent font-bold hover:underline">Import Dives Now &rarr;</button>
                                </div>
                            )}
                        </div>
                     )}
                </div>
            )}
            
            {activeTab === 'import' && (
                <DiveLogImporter onImport={onImportBriefings} user={user} />
            )}
        </div>
    );
};

export default LogbookView;
