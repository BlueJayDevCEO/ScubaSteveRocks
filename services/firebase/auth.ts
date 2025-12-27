
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  signInAnonymously,
  getRedirectResult, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  User as FirebaseUser, 
  setPersistence, 
  browserLocalPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { app } from "./config";
import { User } from '../../types';
import { SCUBA_STEVE_AVATAR } from '../../components/ScubaSteveLogo';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export Demo User for UI Fallbacks (Offline Mode)
export const DEMO_USER: User = {
    uid: 'mock-demo-user',
    displayName: 'Ocean Explorer (Offline)',
    email: 'scubasteve@scubasteve.rocks',
    photoURL: SCUBA_STEVE_AVATAR,
    identificationCount: 0,
    dailyUsage: {
        date: new Date().toISOString().split('T')[0],
        briefingCount: 0,
    },
    contributesData: false,
    isPro: false,
    lastPlatform: 'web'
};

// Helper to map Firebase user to App user
const mapFirebaseUserToAppUser = (fbUser: FirebaseUser): User => {
    const isAnonymous = fbUser.isAnonymous;
    return {
        uid: fbUser.uid,
        displayName: fbUser.displayName || (isAnonymous ? 'Ocean Explorer (Guest)' : 'Diver'),
        email: fbUser.email || (isAnonymous ? 'steve@scubasteve.rocks' : null),
        photoURL: fbUser.photoURL || SCUBA_STEVE_AVATAR,
        identificationCount: 0,
        dailyUsage: {
            date: new Date().toISOString().split('T')[0],
            briefingCount: 0,
        },
        contributesData: true, // Guests default to true to populate map, can toggle off
        lastPlatform: 'web',
    };
};

// Detect if the error is something we should just bypass and let the user in as Guest
const isSystemError = (error: any): boolean => {
    const code = error?.code || '';
    const message = error?.message || '';
    
    // If user cancelled, we want to let them try again, not auto-login as guest
    if (
        code === 'auth/popup-closed-by-user' || 
        code === 'auth/cancelled-popup-request' ||
        message.includes('closed by user')
    ) {
        return false;
    }

    // All other errors (domain, network, config, internal) should trigger fallback
    return true;
};

/**
 * Signs in with Google using Firebase Auth.
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    try {
        await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
        console.warn("Local persistence restricted. Falling back to session memory.");
        await setPersistence(auth, inMemoryPersistence);
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUserToAppUser(result.user);
  } catch (error: any) {
    const errorCode = error.code;
    console.warn(`Firebase Login Logic: Intercepted error ${errorCode}`);

    // 1. Check specifically for unauthorized domain (Preview Environments)
    if (errorCode === 'auth/unauthorized-domain' || errorCode === 'auth/operation-not-allowed') {
        const domain = window.location.hostname || 'Local/Preview Environment';
        console.warn(`NOTICE: Domain '${domain}' is not authorized in Firebase. Auto-activating Guest Mode.`);
        return DEMO_USER;
    }

    // 2. Check if we should fallback to Demo Mode for other system errors
    if (isSystemError(error)) {
        
        // Special case: Popup blocked -> Try Redirect first before giving up
        if (errorCode === 'auth/popup-blocked' || String(error.message).toLowerCase().includes('popup blocked')) {
            console.warn("Popup blocked. Attempting redirect login...");
            try {
                await signInWithRedirect(auth, googleProvider);
                return null; // Redirecting...
            } catch (redirectError: any) {
                if (redirectError.code === 'auth/unauthorized-domain' || isSystemError(redirectError)) {
                     console.warn("Redirect failed. Falling back to Demo Mode.");
                     return DEMO_USER;
                }
            }
        }

        console.warn("System auth error detected. Falling back to Demo Mode to ensure access.");
        return DEMO_USER;
    }

    throw new Error("Login cancelled by user.");
  }
};

/**
 * Checks if the user just returned from a redirect login.
 */
export const checkRedirectResult = async (): Promise<User | null> => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            return mapFirebaseUserToAppUser(result.user);
        }
        return null;
    } catch (error: any) {
        console.error("Redirect result error:", error);
        if (error.code === 'auth/unauthorized-domain' || isSystemError(error)) {
             return DEMO_USER;
        }
        return null;
    }
};

/**
 * Login as guest.
 * PRIORITY 1: Try Anonymous Auth (Real Firebase User, allows DB reads).
 * PRIORITY 2: Fallback to DEMO_USER (Local object, no DB access) if Auth fails (e.g. domain restriction).
 */
export const loginAsGuest = async (): Promise<User> => {
    try {
        // Attempt real anonymous login
        const result = await signInAnonymously(auth);
        console.log("Guest login successful (Anonymous Auth)");
        return mapFirebaseUserToAppUser(result.user);
    } catch (error: any) {
        console.warn("Anonymous auth failed (likely domain restriction). Using Offline Demo User.", error.code);
        // Fallback to offline user so app is still usable
        return DEMO_USER;
    }
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
