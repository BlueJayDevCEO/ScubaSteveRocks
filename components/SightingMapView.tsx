
import React, { useState, useCallback } from 'react';
import { getRecentSightings } from '../services/marineSightings'; // Updated import
import { getSightingSummary } from '../services/geminiService';
import { CommunitySighting } from '../types';
import { SightingMapSkeleton } from './SightingMapSkeleton';

const REGIONS = [
    "Caribbean",
    "Red Sea",
    "Indo-Pacific",
    "California",
    "Florida",
    "Mediterranean",
    "Hawaii",
    "Galapagos",
];

const SightingMapView: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [sightings, setSightings] = useState<CommunitySighting[]>([]);
    const [error, setError] = useState<string | null>(null);

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
                setSummary(`Looks like a quiet day in the ${region}. Be the first to log a sighting! 🐢`);
            } else {
                const speciesNames = communitySightings.map(s => s.species);
                // Only summarize if we have unique species
                const uniqueSpecies = Array.from(new Set(speciesNames));
                if (uniqueSpecies.length > 0) {
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
                        {sightings.length > 0 ? (
                             <div>
                                <h4 className="font-semibold text-lg mb-2">Recent Sightings:</h4>
                                <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                    {sightings.map(sighting => (
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
                                                <p className="text-sm text-light-text/80 dark:text-dark-text/80">{sighting.location}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
