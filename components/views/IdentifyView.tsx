
import React, { useState, useContext, useMemo } from 'react';
import { AppContext, IdentifyViewTab } from '../../App';
import { Briefing } from '../../types';
import { BriefingCard } from '../ContributionsLog';
import { ResultDisplay } from '../ResultDisplay';
import { InputSection } from '../InputSection';
import { ColorCorrectionView } from '../ColorCorrectionView';
import { DAILY_STANDARD_LIMIT, incrementUserBriefingCount, getUser, updateUser } from '../../services/userService';
import { CorrectionStyle, generateSpeciesImage } from '../../services/geminiService';
import { updateBriefing } from '../../services/jobService';

interface IdentifyViewProps {
    initialTab: IdentifyViewTab;
    selectedFiles: File[] | null;
    setSelectedFiles: (files: File[] | null) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    handleMarineId: (files: File[] | null, prompt: string, location: string, region: string) => void;
    handleColorCorrect: (files: File[], style: CorrectionStyle) => void;
    handleSpeciesSearch: (query: string) => void;
    handleStartNewIdentification: () => void;
    isLoading: boolean;
    error: string | null;
    isCorrecting: boolean;
    currentBriefingResult: Briefing | null;
    setCurrentBriefingResult: (briefing: Briefing | null) => void;
    handleCorrection: (briefingId: number, correctedName: string) => void;
    handleConfirmIdentification: (briefingId: number) => void;
    handleUpdateBriefingDetails: (briefingId: number, details: Partial<Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>>) => void;
    handleOpenChat: (context?: Briefing | null, message?: string | null) => void;
    onOpenLimitModal: () => void;
    isBriefingLimitReached: boolean;
    handleSelectBriefingFromHistory: (briefing: Briefing) => void;
    onCancel?: () => void;
    onShowMap: () => void;
}

const IdentifyView: React.FC<IdentifyViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<IdentifyViewTab>(props.initialTab || 'upload');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'species_asc' | 'species_desc'>('date_desc');
    const [location, setLocation] = useState(''); // Lifted location state
    const [region, setRegion] = useState(''); // Lifted region state

    const context = useContext(AppContext);
    if (!context) return null;
    const { user, briefings, setBriefings, setUser } = context;

    const sortedGalleryBriefings = useMemo(() => {
        const filtered = briefings.filter(b => 
            (b.type === 'marine_id' || b.type === 'color_correct') && 
            b.input.imageUrls && 
            b.input.imageUrls.length > 0
        );

        return filtered.sort((a, b) => {
            if (sortOption === 'date_desc') return b.createdAt - a.createdAt;
            if (sortOption === 'date_asc') return a.createdAt - b.createdAt;
            
            const nameA = (a.correction?.final_species || a.output?.suggestion?.species_name || 'Unknown').toLowerCase();
            const nameB = (b.correction?.final_species || b.output?.suggestion?.species_name || 'Unknown').toLowerCase();
            
            if (sortOption === 'species_asc') return nameA.localeCompare(nameB);
            if (sortOption === 'species_desc') return nameB.localeCompare(nameA);
            
            return 0;
        });
    }, [briefings, sortOption]);

    const handleGenerateImage = async (briefingId: number, speciesName: string) => {
        if (props.isBriefingLimitReached) {
            props.onOpenLimitModal();
            return;
        }
        
        setIsGeneratingImage(true);
        
        // Image generation counts as a heavy action
        incrementUserBriefingCount(user.uid, 'marine_id'); // Using marine_id as a proxy for heavy gen usage
        const updatedUser = getUser(user.uid);
        if(updatedUser) setUser(updatedUser);

        try {
            const imageUrl = await generateSpeciesImage(speciesName);
            
            const updatedBriefings = briefings.map(b => {
                if (b.id === briefingId) {
                    const updated = { 
                        ...b, 
                        output: { 
                            ...b.output, 
                            generatedImageUrl: imageUrl 
                        } 
                    };
                    // Persist to storage
                    updateBriefing(updated as Briefing);
                    // Update local state if this is the current result
                    if (props.currentBriefingResult && props.currentBriefingResult.id === briefingId) {
                        props.setCurrentBriefingResult(updated as Briefing);
                    }
                    return updated as Briefing;
                }
                return b;
            });
            
            setBriefings(updatedBriefings);

        } catch (e) {
            console.error("Failed to generate species image", e);
            // Optionally show error toast here
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleStartNew = () => {
        setLocation(''); // Clear location on reset
        setRegion(''); // Clear region on reset
        props.handleStartNewIdentification();
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-center border-b border-black/10 dark:border-white/10 mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('upload')} className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'upload' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}>Photo Upload</button>
                <button onClick={() => setActiveTab('search')} className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'search' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}>Species Search</button>
                <button onClick={() => setActiveTab('gallery')} className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'gallery' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}>Gallery</button>
                <button onClick={() => setActiveTab('color')} className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === 'color' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-light-text/70 dark:text-dark-text/70'}`}>Color Correction</button>
                <button onClick={props.onShowMap} className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent`}>
                    World Sightings 🌍
                </button>
            </div>
            
            <div className="animate-fade-in">
                {activeTab === 'upload' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                            <InputSection
                                files={props.selectedFiles}
                                onFileChange={props.setSelectedFiles}
                                prompt={props.prompt}
                                onPromptChange={props.setPrompt}
                                location={location}
                                onLocationChange={setLocation}
                                region={region}
                                onRegionChange={setRegion}
                                onAttemptIdentify={() => props.handleMarineId(props.selectedFiles, props.prompt, location, region)}
                                isLoading={props.isLoading}
                                isBriefingLimitReached={props.isBriefingLimitReached}
                                remainingBriefings={DAILY_STANDARD_LIMIT - (user.dailyUsage.briefingCount || 0)}
                                onCancel={props.onCancel}
                            />
                        </div>
                        <div>
                            {(props.currentBriefingResult && props.currentBriefingResult.type === 'marine_id') ? (
                                <ResultDisplay
                                    briefing={props.currentBriefingResult}
                                    onCorrectionSubmit={props.handleCorrection}
                                    onConfirmIdentification={props.handleConfirmIdentification}
                                    onUpdateBriefingDetails={props.handleUpdateBriefingDetails}
                                    isLoading={props.isLoading}
                                    onStartChat={() => props.handleOpenChat(props.currentBriefingResult)}
                                    isCorrecting={props.isCorrecting}
                                    isDemo={false}
                                    onStartNewIdentification={handleStartNew}
                                    onGenerateImage={handleGenerateImage}
                                    isGeneratingImage={isGeneratingImage}
                                />
                            ) : (
                                <div className="sticky top-24 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 h-full flex flex-col items-center justify-center text-center text-light-text/70 dark:text-dark-text/70 min-h-[400px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-light-accent/30 dark:text-dark-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 14.5l5-5m0 0l-5-5m5 5H3" /></svg>
                                    <h3 className="font-heading font-bold text-2xl mt-4">Awaiting Signal</h3>
                                    <p>Your identification result will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'search' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 flex flex-col gap-6 mb-8">
                            <div className="text-center">
                                <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-2">Marine Species Search</h2>
                                <p className="text-light-text/70 dark:text-dark-text/70">Know the name? Look up detailed info, facts, and photos instantly.</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <input 
                                    type="text" 
                                    value={props.prompt} 
                                    onChange={(e) => props.setPrompt(e.target.value)} 
                                    placeholder="Enter species name (e.g., Great Barracuda)" 
                                    className="w-full p-4 bg-light-bg dark:bg-dark-bg border border-light-text/20 dark:border-dark-text/20 rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent text-lg"
                                    onKeyDown={(e) => e.key === 'Enter' && props.handleSpeciesSearch(props.prompt)}
                                    disabled={props.isLoading || props.isBriefingLimitReached}
                                />
                                {props.isLoading && props.onCancel ? (
                                    <button 
                                        onClick={props.onCancel}
                                        className="w-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50 font-heading font-bold text-xl py-3 rounded-lg hover:bg-red-500/30 transition-all shadow-lg"
                                    >
                                        Cancel Search
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => props.handleSpeciesSearch(props.prompt)}
                                        disabled={props.isBriefingLimitReached || !props.prompt.trim()}
                                        className="w-full bg-gradient-to-r from-light-primary-start to-light-accent text-white font-heading font-bold text-xl py-3 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        {props.isBriefingLimitReached ? 'Limit Reached' : 'Search'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {(props.currentBriefingResult && props.currentBriefingResult.type === 'species_search') && (
                             <ResultDisplay
                                briefing={props.currentBriefingResult}
                                onCorrectionSubmit={props.handleCorrection}
                                onConfirmIdentification={props.handleConfirmIdentification}
                                onUpdateBriefingDetails={props.handleUpdateBriefingDetails}
                                isLoading={props.isLoading}
                                onStartChat={() => props.handleOpenChat(props.currentBriefingResult)}
                                isCorrecting={props.isCorrecting}
                                isDemo={false}
                                onStartNewIdentification={handleStartNew}
                                onGenerateImage={handleGenerateImage}
                                isGeneratingImage={isGeneratingImage}
                            />
                        )}
                    </div>
                )}
                {activeTab === 'gallery' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-1">
                            <h2 className="font-heading font-bold text-3xl text-center sm:text-left">Your Gallery</h2>
                            <select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value as any)}
                                className="p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-lg text-sm font-semibold text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                            >
                                <option value="date_desc">Newest First</option>
                                <option value="date_asc">Oldest First</option>
                                <option value="species_asc">Species (A-Z)</option>
                                <option value="species_desc">Species (Z-A)</option>
                            </select>
                        </div>
                        {sortedGalleryBriefings.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {sortedGalleryBriefings.map(b => (
                                    <BriefingCard key={b.id} briefing={b} onSelectBriefing={props.handleSelectBriefingFromHistory} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-lg text-light-text/70 dark:text-dark-text/70 py-12">Your identified species and color corrections will appear here.</p>
                        )}
                    </div>
                )}
                {activeTab === 'color' && (
                    <ColorCorrectionView 
                        isLoading={props.isLoading} 
                        startBriefing={props.handleColorCorrect} 
                        currentBriefingResult={props.currentBriefingResult} 
                        error={props.error} 
                        isBriefingLimitReached={props.isBriefingLimitReached}
                        onOpenChat={() => props.handleOpenChat(null, null)}
                        onStartNew={handleStartNew}
                        onCancel={props.onCancel}
                    />
                )}
            </div>
        </div>
    );
};

export default IdentifyView;
