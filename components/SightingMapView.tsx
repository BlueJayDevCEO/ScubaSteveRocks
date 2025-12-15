
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { getRecentSightings, REGIONS } from '../services/marineSightings';
import { getSightingSummary } from '../services/geminiService';
import { CommunitySighting } from '../types';
import { SightingMapSkeleton } from './SightingMapSkeleton';
import { AppContext } from '../App';

const SightingMapView: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>("Global");
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [sightings, setSightings] = useState<CommunitySighting[]>([]);
    const [error, setError] = useState<string | null>(null);

    const context = useContext(AppContext);
    const user = context?.user;
    
    // FREE USER LIMIT
    const DISPLAY_LIMIT = 50;
    const isPro = user?.isPro || false;

    const handleRegionSelect = useCallback(async (region: string) => {
        setSelectedRegion(region);
        setIsLoading(true);
        setError(null);
        setSummary(null);
        setSightings([]);

        try {
            // Fetch real data from Firestore
            const communitySightings = await getRecentSightings(region);
            
            setSightings(communitySightings);
            
            if (communitySightings.length === 0) {
                setSummary(region === "Global" 
                    ? "No sightings logged yet. Be the first to contribute!" 
                    : `Looks like a quiet day in the ${region}. Be the first to log a sighting! 🐢`
                );
            } else {
                const speciesNames = communitySightings.map(s => s.species);
                // Only summarize if we have unique species
                const uniqueSpecies = Array.from(new Set(speciesNames));
                
                if (region === "Global") {
                     setSummary(`Divers are reporting activity all over the world! ${uniqueSpecies.length} unique species spotted recently.`);
                } else if (uniqueSpecies.length > 0) {
                    const generatedSummary = await getSightingSummary(uniqueSpecies.slice(0, 10), region);
                    setSummary(generatedSummary);
                } else {
                    setSummary(`Divers are reporting activity in the ${region}. Check out the list below!`);
                }
            }

        } catch (err) {
            console.error("Failed to get sighting data:", err);
            setError("Could not fetch sighting data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-load Global data on mount
    useEffect(() => {
        handleRegionSelect("Global");
    }, [handleRegionSelect]);

    // Slice data for view
    const visibleSightings = isPro ? sightings : sightings.slice(0, DISPLAY_LIMIT);
    const isLimitEnforced = !isPro && sightings.length > DISPLAY_LIMIT;

    return (
        <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full flex flex-col gap-6">
            <div>
                <h2 className="font-heading font-semibold text-2xl sm:text-3xl mb-2">Global Sighting Map</h2>
                <p className="text-light-text/80 dark:text-dark-text/80">See what other divers are spotting around the world! Select a region to get a live summary.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {REGIONS.map(region => (
                    <button
                        key={region}
                        onClick={() => handleRegionSelect(region)}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedRegion === region 
                            ? 'bg-light-accent text-white dark:bg-dark-accent' 
                            : 'bg-light-bg dark:bg-dark-bg hover:bg-light-accent/20 dark:hover:bg-dark-accent/20'
                        }`}
                    >
                        {region}
                    </button>
                ))}
            </div>

            <div className="mt-4 min-h-[300px]">
                {isLoading ? (
                    <SightingMapSkeleton />
                ) : error ? (
                    <div className="text-center text-light-accent dark:text-dark-accent py-12">{error}</div>
                ) : selectedRegion ? (
                    <div className="animate-fade-in">
                        <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg mb-6">
                            <h3 className="font-heading font-semibold text-xl mb-2">Dive Report: {selectedRegion}</h3>
                            <p className="text-lg">{summary || "Loading report..."}</p>
                        </div>
                        
                        {visibleSightings.length > 0 ? (
                             <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-lg">Recent Sightings:</h4>
                                    <span className="text-xs font-mono opacity-60">
                                        Showing {visibleSightings.length} of {sightings.length} total
                                    </span>
                                </div>
                                
                                <ul className="space-y-2">
                                    {visibleSightings.map(sighting => (
                                        <li key={sighting.id} className="p-3 bg-light-card dark:bg-dark-card rounded-md border border-black/5 dark:border-white/5 flex gap-4 items-start">
                                            {sighting.imageUrl ? (
                                                <img src={sighting.imageUrl} alt={sighting.species} className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0" loading="lazy" />
                                            ) : (
                                                <div className="w-16 h-16 bg-light-bg dark:bg-dark-bg rounded-md flex items-center justify-center text-2xl flex-shrink-0">
                                                    🐟
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-light-accent dark:text-dark-accent">{sighting.species}</p>
                                                    <span className="text-xs text-light-text/60 dark:text-dark-text/60 whitespace-nowrap ml-2">{new Date(sighting.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                
                                                {/* Prominent display of Manual Location Name */}
                                                <div className="flex items-center gap-1 mt-1 text-sm text-light-text/70 dark:text-dark-text/70">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{sighting.location}</span>
                                                    {sighting.region && sighting.region !== 'Other' && (
                                                        <span className="ml-2 text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">{sighting.region}</span>
                                                    )}
                                                </div>

                                                {/* Short Description - Moved below location */}
                                                {sighting.description && (
                                                    <p className="text-sm text-light-text/90 dark:text-dark-text/90 mt-2 italic line-clamp-2">
                                                        "{sighting.description}"
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* PREMIUM LOCK - UPSELL */}
                                {isLimitEnforced && (
                                    <div className="mt-4 p-6 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/20 rounded-xl border border-yellow-400/50 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="font-heading font-bold text-xl text-yellow-800 dark:text-yellow-400 mb-2">
                                                🔒 Unlock Global Sightings
                                            </h3>
                                            <p className="text-sm text-yellow-900/80 dark:text-yellow-200/80 mb-4 max-w-md mx-auto">
                                                You are viewing the top {DISPLAY_LIMIT} recent sightings. Upgrade to Pro to access the full history of over {sightings.length} sightings in this region.
                                            </p>
                                            <a 
                                                href="https://buy.stripe.com/price_1sbeO9L3mNCUAVdPpmmf4AQ4"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transition-transform shadow-lg"
                                            >
                                                Unlock Full Map ($5)
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4 text-light-text/60 dark:text-dark-text/60">
                                No sightings logged for this region recently.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-light-text/70 dark:text-dark-text/70 pt-16">
                        <p className="text-xl">Select a region to begin exploring.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SightingMapView;
