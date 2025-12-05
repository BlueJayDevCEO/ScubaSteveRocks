
import React, { useState, useContext } from 'react';
import { Briefing } from '../types';
import { AppContext } from '../App';
import { BriefingResultContainer } from './JobResultContainer';

interface DiveTripPlannerViewProps {
    startBriefing: (destination: string, duration: number, certification: string, interests: string) => void;
    currentBriefingResult: Briefing | null;
    isLoading: boolean;
    error: string | null;
    isBriefingLimitReached: boolean;
    onCancel?: () => void;
}

const formatMarkdown = (content: string) => {
    if (!content) return { __html: '' };

    let html = content
        .replace(/^### (.*$)/gim, '<h3 class="font-heading font-bold text-3xl mt-6 mb-3">$1</h3>')
        .replace(/^\*\*(.*)\*\*$/gm, '<h4 class="font-heading font-semibold text-2xl mt-4 mb-2">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?:^\* .*\r?\n?)+/gm, (match) => {
            const items = match.trim().split('\n').map(item => `<li>${item.substring(2).trim()}</li>`).join('');
            return `<ul class="list-disc list-inside space-y-1 ml-4">${items}</ul>`;
        })
        .replace(/\n/g, '<br />');
        
    html = html.replace(/<\/ul><br \/>/g, '</ul>');
    html = html.replace(/<br \/>(<h[34]>)/g, '$1');

    return { __html: html };
};

export const DiveTripPlannerView: React.FC<DiveTripPlannerViewProps> = ({ startBriefing, currentBriefingResult, isLoading, error, isBriefingLimitReached, onCancel }) => {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState(5);
    const [certification, setCertification] = useState('Advanced Open Water');
    const [interests, setInterests] = useState('Wrecks, vibrant reefs');
    
    const context = useContext(AppContext);
    const user = context?.user;

    const tripPlanResult = (currentBriefingResult && currentBriefingResult.type === 'trip_planner' && currentBriefingResult.output?.tripPlan) ? currentBriefingResult.output.tripPlan : null;
    
    const handleGeneratePlan = () => {
        if (!destination.trim() || isBriefingLimitReached || isLoading) return;
        startBriefing(destination, duration, certification, interests);
    };

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 flex flex-col gap-6">
                <h2 className="font-heading font-semibold text-2xl sm:text-3xl">AI Dive Trip Planner</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="destination" className="block font-semibold mb-1">Destination</label>
                        <input id="destination" type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Cozumel, Mexico" className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"/>
                    </div>
                     <div>
                        <label htmlFor="duration" className="block font-semibold mb-1">Duration ({duration} days)</label>
                        <input id="duration" type="range" min="2" max="14" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full" />
                    </div>
                     <div>
                        <label htmlFor="certification" className="block font-semibold mb-1">Certification Level</label>
                        <select id="certification" value={certification} onChange={e => setCertification(e.target.value)} className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg">
                            <option>Open Water Diver</option>
                            <option>Advanced Open Water</option>
                            <option>Rescue Diver</option>
                            <option>Divemaster</option>
                            <option>Technical Diver</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="interests" className="block font-semibold mb-1">Interests</label>
                        <textarea id="interests" value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g., Wrecks, macro photography, sharks" rows={3} className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"></textarea>
                    </div>
                </div>
                {isLoading && onCancel ? (
                    <button 
                        onClick={onCancel}
                        className="w-full bg-red-500/80 text-white font-heading font-bold text-2xl py-3 rounded-lg hover:bg-red-600 transition-all shadow-lg"
                    >
                        Cancel Planning
                    </button>
                ) : (
                    <button
                        onClick={handleGeneratePlan}
                        disabled={isBriefingLimitReached || !destination.trim()}
                        className="w-full bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-heading font-bold text-2xl py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20 disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {isBriefingLimitReached ? 'Daily Limit Reached' : 'Generate Plan'}
                    </button>
                )}
            </div>

            {tripPlanResult && currentBriefingResult ? (
                <BriefingResultContainer
                    briefing={currentBriefingResult}
                    title="Your Custom Dive Plan"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>}
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
                    <div className="text-left space-y-4">
                        <div
                            className="prose dark:prose-invert max-w-none text-light-text dark:text-dark-text"
                            dangerouslySetInnerHTML={formatMarkdown(tripPlanResult.plan)}
                        />
                        {tripPlanResult.sources && tripPlanResult.sources.length > 0 && (
                            <div className="mt-6 border-t border-black/10 dark:border-white/10 pt-4">
                                <h4 className="font-semibold text-lg font-heading mb-2">Sources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {tripPlanResult.sources.map((source, index) => (
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
            ) : (
                <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-2xl sm:text-3xl mb-4 font-heading">Let's Plan Your Next Adventure</h3>
                    <p className="text-xl max-w-md">Fill out the form to get a personalized dive trip itinerary from Scuba Steve.</p>
                </div>
            )}
        </section>
    );
};

export default DiveTripPlannerView;
