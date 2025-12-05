import { Briefing, CommunitySighting } from '../types';

const ALL_BRIEFINGS_KEY = 'scubaSteveAllBriefings';
const PUBLIC_BRIEFINGS_KEY = 'scubaStevePublicBriefings';
const CONTRIBUTIONS_LOG_KEY = 'scubaStevePublicContributions';
const MAX_JOBS = 50; // keep last 50
const MAX_PUBLIC_JOBS = 50; // keep last 50 shared jobs
// Reduced to 1.5MB for Mobile Stability (iOS Safari crashes ~5MB total)
const MAX_JSON_BYTES = 1_500_000; 

// Helper to get byte size of a string
const bytes = (s: string): number => new Blob([s]).size;

// Helper to remove large base64 fields from a briefing object before persisting
function stripLargeFields(briefing: Briefing): Briefing {
  const j = { ...briefing };

  // Create shallow copies of nested objects to avoid mutating the original state object
  if (j.output) j.output = { ...j.output };
  if (j.input) j.input = { ...j.input };
  
  // By not stripping image URLs, we ensure they persist in the user's log for a better UX.
  // The size-limiting logic in safeSetBriefings will act as the safeguard against exceeding storage quotas.
  
  return j;
}

// Safely gets and parses briefings from localStorage, handling potential errors
function safeGetBriefings(): Briefing[] {
  try {
    const raw = localStorage.getItem(ALL_BRIEFINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse briefings from localStorage", e);
    return [];
  }
}

// Safely sets briefings to localStorage, with size and count limits
function safeSetBriefings(briefings: Briefing[]) {
  // Enforce max briefing count and strip large fields from all briefings
  let pruned = briefings.slice(0, MAX_JOBS).map(stripLargeFields);

  // If the stringified JSON is too large, progressively shrink it
  let payload = JSON.stringify(pruned);
  while (bytes(payload) > MAX_JSON_BYTES && pruned.length > 1) {
    pruned.pop(); // Drop the oldest briefing (from the end of the array)
    payload = JSON.stringify(pruned);
  }

  try {
    localStorage.setItem(ALL_BRIEFINGS_KEY, payload);
  } catch (e) {
    console.error("LocalStorage write error. Falling back to smaller save.", e);
    // Final fallback: try to save only the most recent briefing
    try {
      const firstOnly = pruned.slice(0, 1);
      localStorage.setItem(ALL_BRIEFINGS_KEY, JSON.stringify(firstOnly));
    } catch (finalError) {
      console.error("LocalStorage fallback failed. History could not be saved.", finalError);
    }
  }
}

function safeGetPublicBriefings(): Briefing[] {
  try {
    const raw = localStorage.getItem(PUBLIC_BRIEFINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse public briefings from localStorage", e);
    return [];
  }
}

function safeSetPublicBriefings(briefings: Briefing[]) {
    // Create copies of briefings, stripping large image data from non-color-correction briefings
    // to save significant space in localStorage.
    const strippedBriefings = briefings.map(briefing => {
        const publicBriefing: Briefing = {
            ...briefing,
            userId: 'shared', // Anonymize user ID for public log
            input: { ...briefing.input }, // Create shallow copy to modify
            output: briefing.output ? { ...briefing.output } : undefined, // Create shallow copy
        };

        // For non-color-correction briefings, we don't need the large image data for the shared view.
        if (publicBriefing.type !== 'color_correct') {
            if (publicBriefing.input.imageUrls) {
                delete publicBriefing.input.imageUrls;
            }
            if (publicBriefing.output?.correctedImageUrl) {
                delete publicBriefing.output.correctedImageUrl;
            }
        }
        
        return publicBriefing;
    });

    let pruned = strippedBriefings.slice(0, MAX_PUBLIC_JOBS);

    // If the stringified JSON is too large, progressively shrink it by removing the oldest briefings.
    // This is the primary defense against the quota error.
    let payload = JSON.stringify(pruned);
    while (bytes(payload) > MAX_JSON_BYTES && pruned.length > 1) {
        pruned.pop(); // Drop the oldest briefing
        payload = JSON.stringify(pruned);
    }

    try {
        localStorage.setItem(PUBLIC_BRIEFINGS_KEY, payload);
    } catch (e) {
        console.error("Failed to save public briefings", e);
        // Final fallback: if still too large, try saving only the most recent briefing.
        try {
            const firstOnly = pruned.slice(0, 1);
            localStorage.setItem(PUBLIC_BRIEFINGS_KEY, JSON.stringify(firstOnly));
        } catch (finalError) {
            console.error("LocalStorage fallback for public briefings failed.", finalError);
        }
    }
}


// Re-implementing the exported functions using the new safe helpers

export const saveBriefing = (newBriefing: Briefing): void => {
    const allBriefings = safeGetBriefings();
    // Prepend the new briefing to keep the list sorted by most recent
    safeSetBriefings([newBriefing, ...allBriefings]);
};

export const saveBriefings = (briefingsToAdd: Briefing[]): void => {
    const allBriefings = safeGetBriefings();
    // Prepend the new briefings to keep the list sorted by most recent
    safeSetBriefings([...briefingsToAdd, ...allBriefings]);
};


export const updateBriefing = (updatedBriefing: Briefing): void => {
    const allBriefings = safeGetBriefings();
    // Find and update the briefing, preserving order.
    // This handles the case where a briefing is first saved with partial data, then updated with the full result.
    const mergedBriefings = allBriefings.map(j => (j.id === updatedBriefing.id ? { ...j, ...updatedBriefing } : j));
    safeSetBriefings(mergedBriefings);
};

export const getUserBriefings = async (userId: string): Promise<Briefing[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        const allBriefings = safeGetBriefings();
        resolve(allBriefings.filter(briefing => briefing.userId === userId));
    }, 300); // Simulate network delay
  });
};


export const shareBriefing = (briefing: Briefing): string => {
    const publicBriefings = safeGetPublicBriefings();
    // Avoid duplicates
    if (!publicBriefings.some(p => p.id === briefing.id)) {
        safeSetBriefings([briefing, ...publicBriefings]);
    }
    
    // Construct the URL from parts for robustness, especially in sandboxed environments.
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const url = new URL(baseUrl);
    
    // Clear any existing search parameters from the path.
    url.search = '';
    
    // Set the specific search parameter for sharing.
    url.searchParams.set('shareBriefingId', briefing.id.toString());
    
    return url.toString();
};


export const getSharedBriefing = (briefingId: number): Briefing | null => {
    // A shared briefing could be in the public log OR the current user's log
    const publicBriefings = safeGetPublicBriefings();
    let briefing = publicBriefings.find(j => j.id === briefingId);
    if (briefing) return briefing;
    
    // Fallback to checking the regular briefing log
    const allBriefings = safeGetBriefings();
    briefing = allBriefings.find(j => j.id === briefingId);

    return briefing || null;
}

export const logSightingContribution = (briefing: Briefing, speciesToLog: string): void => {
    // Only log if a location has been provided.
    if (!briefing.location) return;

    try {
        const raw = localStorage.getItem(CONTRIBUTIONS_LOG_KEY);
        const contributions = raw ? JSON.parse(raw) : [];
        
        // Anonymize the data
        const anonymizedSighting = {
            id: briefing.id,
            species: speciesToLog,
            location: briefing.location,
            createdAt: briefing.createdAt,
        };

        // Avoid duplicate entries
        if (contributions.some((c: any) => c.id === briefing.id)) return;

        contributions.unshift(anonymizedSighting); // Add to the top
        localStorage.setItem(CONTRIBUTIONS_LOG_KEY, JSON.stringify(contributions.slice(0, 200))); // Limit to 200 entries
    } catch (e) {
        console.error("Failed to save contribution to localStorage", e);
    }
};

export const getCommunitySightings = async (region: string): Promise<CommunitySighting[]> => {
  try {
    const raw = localStorage.getItem(CONTRIBUTIONS_LOG_KEY);
    const contributions = raw ? JSON.parse(raw) : [];

    const sightings: CommunitySighting[] = contributions
        .filter((sighting: any) => 
            sighting.location &&
            sighting.location.toLowerCase().includes(region.toLowerCase()) &&
            sighting.species
        )
        .map((sighting: any) => ({
            id: sighting.id,
            species: sighting.species,
            location: sighting.location,
            createdAt: sighting.createdAt,
        }));
    
    return sightings.slice(0, 50);
  } catch (e) {
    console.error("Failed to get community sightings", e);
    return [];
  }
};

export const seedInitialBriefings = (userId: string) => {
    const demoBriefing: Briefing = {
        id: 1,
        userId: userId,
        type: 'marine_id',
        status: 'completed',
        createdAt: Date.now() - 86400000, // 1 day ago
        input: {
            prompt: 'Identify this please',
            originalFileNames: ['clownfish.jpg'],
            imageUrls: ['https://storage.googleapis.com/static.osea.app/clownfish.jpg'], // A real, publicly accessible URL for the demo
        },
        output: {
            suggestion: {
                greeting: "G'day, diver! What a classic find! 🐠",
                main_text: "This is a **Clown Anemonefish** (Amphiprion percula).\n\n**Key Characteristics**\n* Vibrant orange body.\n* Three distinct white bars, each outlined in black.\n\n**Habitat & Range**\nThese fish are found in the warmer waters of the Indian and Pacific Oceans, including the Great Barrier Reef and the Red Sea. They famously live within the tentacles of sea anemones.\n\n**Diet**\nClownfish primarily eat small zooplankton from the water column, such as copepods and tunicate larvae, with a small portion of their diet coming from algae.\n\n**Fascinating Facts**\nAll clownfish are born male! They have the ability to change their sex to become the dominant female of a group when the previous female dies.",
                footer: "Identified by Scuba Steve – Your AI Dive Buddy from OSEA Diver 🐢",
                species_name: "Clown Anemonefish",
                scientific_name: "Amphiprion percula",
                confidence: 99
            }
        },
        contributionLogged: true,
    };
    saveBriefing(demoBriefing);
};