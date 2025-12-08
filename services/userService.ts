
import { User, GameProgress, SavedSite } from '../types';
import { seedInitialBriefings } from './jobService';
import { seedInitialChat } from './chatService';
import { SCUBA_STEVE_AVATAR } from '../components/ScubaSteveLogo';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';

const ALL_USERS_KEY = 'scubaSteveAllUsers';

// --- DUAL LIMIT SYSTEM ---
export const DAILY_STANDARD_LIMIT = 20; // Chat, ID, Color (Cheap)
export const DAILY_PREMIUM_LIMIT = 3;   // Search, Planner (Expensive)
export const GUEST_DAILY_LIMIT = 3;     // Guests only get a few Standard actions (Teaser)
export const WEEKLY_CONTRIBUTION_LIMIT = 3; // Strict limit on map uploads to control storage costs

export const MAX_FREE_LEVEL = 5;
export const MAX_GAME_LEVEL = 25;

const PROMO_CODE = "BlueJAY8OSEA";

// Expensive actions involving Google Search Grounding or complex flows
// Voice removed from here to handle with weekly limit
const PREMIUM_ACTIONS = ['dive_site', 'live_report', 'trip_planner', 'scuba_news'];

// Standard actions using basic Gemini Flash
const STANDARD_ACTIONS = ['marine_id', 'color_correct', 'chat', 'surface_interval', 'species_search'];

// --- FIREBASE SYNC HELPER ---
const syncUserToFirestore = async (user: User) => {
    // Don't sync offline/demo users or guests
    if (!user || user.uid === 'mock-demo-user' || user.uid.startsWith('guest-')) return;
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        const now = serverTimestamp();

        if (!snap.exists()) {
            // First time seeing this user in Firestore
            await setDoc(userRef, {
                ...user,
                createdAt: now,
                lastActiveAt: now
            });
        } else {
            // Update existing user, merging new fields but preserving existing createdAt
            await setDoc(userRef, {
                ...user,
                lastActiveAt: now
            }, { merge: true });
        }
        // console.log(`[Firestore] Synced user profile for ${user.displayName}`);
    } catch (e) {
        console.error("[Firestore] Failed to sync user profile:", e);
    }
};

/**
 * Registers a new user or ensures an existing user has the necessary default fields.
 * @param newUser The user object from login.
 */
export const registerUser = (newUser: User | null): void => {
  if (!newUser || !newUser.uid) {
    return;
  }

  const users = getUsersFromStorage();
  const userIndex = users.findIndex(user => user.uid === newUser.uid);
  
  let finalUser: User;

  if (userIndex === -1) {
    // New user, add with defaults
    finalUser = { 
        ...newUser, 
        photoURL: newUser.photoURL || SCUBA_STEVE_AVATAR, // Use default if missing
        identificationCount: 0, 
        dailyUsage: { 
            date: getTodayDateString(), 
            briefingCount: 0,
            premiumCount: 0,
        },
        weeklyContributionCount: 0,
        lastWeeklyReset: Date.now(),
        contributesData: true,
        gameProgress: { totalXP: 0, level: 1, badges: [] },
        isPro: false,
        savedSites: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        lastPlatform: 'web'
    };
    setUsersToStorage([...users, finalUser]);
  } else {
      // Existing user: retrieve current local state to sync to cloud
      // This ensures if they logged in before the fix, they get synced now.
      finalUser = users[userIndex];
      // Backfill new properties if missing
      if (!finalUser.createdAt) finalUser.createdAt = Date.now();
      if (!finalUser.lastPlatform) finalUser.lastPlatform = 'web';
      if (finalUser.weeklyContributionCount === undefined) {
          finalUser.weeklyContributionCount = 0;
          finalUser.lastWeeklyReset = Date.now();
      }
      
      // Update last active time locally
      finalUser.lastActiveAt = Date.now();
      users[userIndex] = finalUser;
      setUsersToStorage(users);
  }

  // SYNC TO FIREBASE (Critical Step)
  // Fire and forget
  syncUserToFirestore(finalUser);
};

/**
 * Retrieves a single user's full profile from storage.
 * @param userId The UID of the user to find.
 * @returns The user object or null if not found.
 */
export const getUser = (userId: string): User | null => {
    if (!userId) return null;
    const users = getUsersFromStorage();
    return users.find(user => user.uid === userId) || null;
}

/**
 * Updates an existing user's profile in storage.
 * @param updatedUser The user object with updated fields.
 */
export const updateUser = (updatedUser: User | null): void => {
    if (!updatedUser) return;
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(user => user.uid === updatedUser.uid);
    
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        setUsersToStorage(users);
        
        // Sync updates (credits, XP, etc) to Firestore
        syncUserToFirestore(updatedUser);
    }
}

/**
 * Checks if the user can perform a new briefing/action based on daily limits.
 * STRICT GUEST RULE: Guests can perform limited Marine ID (teaser), but NO chat/tools.
 * @param userId The UID of the user.
 * @param type The type of briefing/action being requested.
 * @returns True if allowed, false otherwise.
 */
export const canUserPerformBriefing = (userId: string, type: string = 'generic'): boolean => {
    const user = getUser(userId);
    const isGuest = userId === 'mock-demo-user' || userId.startsWith('guest-') || user?.email === 'scubasteve@scubasteve.rocks';

    // 1. PRO USERS BYPASS LIMITS
    if (user?.isPro) return true;

    // 2. GUEST RESTRICTIONS
    if (isGuest) {
        // Allow Marine ID / Color Correct (Teaser)
        if (type === 'marine_id' || type === 'color_correct') {
             // Use a simple local storage check for anonymous guest usage
             const guestUsage = parseInt(localStorage.getItem('scubaSteveGuestUsage') || '0', 10);
             return guestUsage < GUEST_DAILY_LIMIT;
        }
        // BLOCK everything else (Chat, Voice, Trip Plan, etc.)
        return false;
    }

    // 3. SIGNED-UP USER CHECK
    if (!user) return false;

    // Check Weekly Voice Limit
    if (type === 'voice') {
        if (!user.lastVoiceUsage) return true; // Never used
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        return (Date.now() - user.lastVoiceUsage) > oneWeekMs;
    }

    // Check reset date
    const today = getTodayDateString();
    if (user.dailyUsage.date !== today) {
        return true; // Will reset on increment
    }

    // Check PREMIUM limits (Search, Plans)
    if (PREMIUM_ACTIONS.includes(type)) {
        const currentPremium = user.dailyUsage.premiumCount || 0;
        return currentPremium < DAILY_PREMIUM_LIMIT;
    }

    // Check STANDARD limits (Chat, ID)
    if (STANDARD_ACTIONS.includes(type)) {
        return user.dailyUsage.briefingCount < DAILY_STANDARD_LIMIT;
    }

    // Light actions (calculators, game navigation) are unlimited.
    return true;
};

/**
 * Checks if the user can upload a finding to the Global Map based on WEEKLY limit.
 * Pro users: Unlimited.
 * Free users: 3 per week.
 */
export const canUserContributeToMap = (userId: string): boolean => {
    const user = getUser(userId);
    if (!user) return false;
    if (user.isPro) return true; // Pro users have no limit

    // Check if week has passed
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const lastReset = user.lastWeeklyReset || 0;
    
    if ((Date.now() - lastReset) > oneWeekMs) {
        return true; // Will reset on increment
    }

    // Check count
    const currentCount = user.weeklyContributionCount || 0;
    return currentCount < WEEKLY_CONTRIBUTION_LIMIT;
};

/**
 * Increments the user's contribution count specifically, handling weekly resets.
 */
export const incrementContributionCount = (userId: string): void => {
    const user = getUser(userId);
    if (!user) return;

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const lastReset = user.lastWeeklyReset || 0;
    
    // Check if it's been more than a week since last reset
    if ((Date.now() - lastReset) > oneWeekMs) {
        user.weeklyContributionCount = 1; // Start new week with this 1
        user.lastWeeklyReset = Date.now();
    } else {
        user.weeklyContributionCount = (user.weeklyContributionCount || 0) + 1;
    }
    
    updateUser(user);
};

/**
 * Increments the user's briefing count for the day.
 * Resets the count if the date has changed.
 * Increment the correct counter based on action type.
 * @param userId The UID of the user.
 * @param type The type of action performed.
 */
export const incrementUserBriefingCount = (userId: string, type: string = 'generic'): void => {
    const user = getUser(userId);
    const isGuest = userId === 'mock-demo-user' || userId.startsWith('guest-') || user?.email === 'scubasteve@scubasteve.rocks';

    // GUEST INCREMENT
    if (isGuest) {
        if (type === 'marine_id' || type === 'color_correct') {
             const currentUsage = parseInt(localStorage.getItem('scubaSteveGuestUsage') || '0', 10);
             localStorage.setItem('scubaSteveGuestUsage', (currentUsage + 1).toString());
        }
        return;
    }

    // REGISTERED USER INCREMENT
    if (!user) return;

    // Voice has its own timestamp, handled separately
    if (type === 'voice') {
        user.lastVoiceUsage = Date.now();
        updateUser(user);
        return;
    }

    const today = getTodayDateString();
    
    // Reset if new day
    if (user.dailyUsage.date !== today) {
        user.dailyUsage = {
            date: today,
            briefingCount: 0,
            premiumCount: 0
        };
    }

    // Handle Counters
    if (PREMIUM_ACTIONS.includes(type)) {
        user.dailyUsage.premiumCount = (user.dailyUsage.premiumCount || 0) + 1;
    } else if (STANDARD_ACTIONS.includes(type)) {
        user.dailyUsage.briefingCount += 1;
    }

    updateUser(user);
};

export const updateGameProgress = (userId: string, xp: number, achievement?: string): GameProgress => {
    const user = getUser(userId);
    if (!user) return { totalXP: 0, level: 1, badges: [] };

    const currentProgress = user.gameProgress || { totalXP: 0, level: 1, badges: [] };
    const newXP = currentProgress.totalXP + xp;
    let newLevel = Math.floor(newXP / 100) + 1; // Level up every 100 XP
    
    // Cap at MAX_GAME_LEVEL
    if (newLevel > MAX_GAME_LEVEL) {
        newLevel = MAX_GAME_LEVEL;
    }
    
    let newBadges = [...currentProgress.badges];
    if (achievement && !newBadges.includes(achievement)) {
        newBadges.push(achievement);
    }

    const newProgress = {
        totalXP: newXP,
        level: newLevel,
        badges: newBadges
    };

    user.gameProgress = newProgress;
    updateUser(user);
    return newProgress;
};

export const upgradeUserToPro = (userId: string): void => {
    const user = getUser(userId);
    if (user) {
        user.isPro = true;
        updateUser(user);
    }
};

export const redeemPromoCode = (userId: string, code: string): boolean => {
    if (code.trim() === PROMO_CODE) {
        upgradeUserToPro(userId);
        return true;
    }
    return false;
};

export const toggleSavedSite = (userId: string, site: SavedSite): User | null => {
    const user = getUser(userId);
    if (!user) return null;

    const currentSites = user.savedSites || [];
    const existingIndex = currentSites.findIndex(s => s.name.toLowerCase() === site.name.toLowerCase());

    let newSites;
    if (existingIndex >= 0) {
        // Remove
        newSites = currentSites.filter((_, i) => i !== existingIndex);
    } else {
        // Add to top
        newSites = [site, ...currentSites];
    }

    user.savedSites = newSites;
    updateUser(user);
    return user;
};

export const getTotalUserCount = async (): Promise<number> => {
    // Mock async delay
    return new Promise(resolve => {
        setTimeout(() => {
            const users = getUsersFromStorage();
            resolve(users.length);
        }, 300);
    });
}

export const getAllUsers = async (): Promise<User[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getUsersFromStorage());
        }, 300);
    });
}

// --- Helper Functions ---

const getUsersFromStorage = (): User[] => {
    try {
        const storedUsers = localStorage.getItem(ALL_USERS_KEY);
        return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        return [];
    }
};

const setUsersToStorage = (users: User[]): void => {
    try {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Failed to write users to localStorage", e);
    }
};

const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};
