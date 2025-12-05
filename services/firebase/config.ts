import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getDocs, 
  collection, 
  query, 
  limit 
} from "firebase/firestore";
import { getStorage, ref, uploadString, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKguyjFe_Ij85o8E4heF-QtqNkeKlTkj4",
  authDomain: "scubasteverocks-1b9a9.firebaseapp.com",
  projectId: "scubasteverocks-1b9a9",
  storageBucket: "scubasteverocks-1b9a9.firebasestorage.app",
  messagingSenderId: "400216295120",
  appId: "1:400216295120:web:fd46f6a78b91d6de95c0d5",
  measurementId: "G-DTQ7JP0FPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust settings for unstable networks
// 'experimentalForceLongPolling' fixes the "Could not reach backend" error on restricted networks
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, 
});

const storage = getStorage(app);

// Safely initialize analytics (it can fail in some environments like iframes, ad-blockers or restricted browsers)
let analytics: Analytics | null = null;
try {
  // Check if window exists and if we are not in a restricted environment that might block IndexedDB/Cookies
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase Analytics failed to initialize (likely due to environment restrictions). App will continue without it.");
}

/**
 * Diagnostic function to check if the app can successfully talk to Firestore.
 * Attempts to fetch 1 document from the public sightings collection.
 */
export const checkDbConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        // We query the 'marineSightings' collection because it's publicly readable.
        // Using limit(1) ensures the query is lightweight.
        const q = query(collection(db, "marineSightings"), limit(1));
        await getDocs(q);
        return { success: true, message: "Connected & Readable" };
    } catch (e: any) {
        console.error("Firebase Connection Diagnostic Failed:", e);
        let msg = "Connection Failed";
        if (e.code === 'permission-denied') msg = "Permission Denied (Check Rules)";
        if (e.code === 'unavailable') msg = "Network/Service Unavailable";
        return { success: false, message: msg };
    }
};

/**
 * Diagnostic function to check if the app can write to Storage.
 * Attempts to upload a tiny text file to the user's folder.
 */
export const checkStorageConnection = async (userId: string | undefined): Promise<{ success: boolean; message: string }> => {
    if (!userId || userId.startsWith('guest-') || userId === 'mock-demo-user') {
        return { success: false, message: "Auth/Guest Restricted" };
    }
    try {
        // Try to upload a small test file
        const testRef = ref(storage, `marine-photos/${userId}/diagnostics-test.txt`);
        await uploadString(testRef, "test");
        // Clean up immediately
        await deleteObject(testRef);
        return { success: true, message: "Write/Delete OK" };
    } catch (e: any) {
        console.error("Storage Diagnostic Failed:", e);
        let msg = "Upload Failed";
        if (e.code === 'storage/unauthorized') msg = "Permission Denied (Check Rules)";
        if (e.code === 'storage/cors-error' || e.message.includes('CORS')) msg = "CORS Error (Fix in Cloud Console)";
        return { success: false, message: msg };
    }
};

export { app, analytics, db, storage };