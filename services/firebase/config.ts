import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import { getFirestore, getDocs, collection, query, limit } from "firebase/firestore";
import { getStorage, ref, uploadString, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC-uj0wLBnsND_vjzmebSnSLYyq7CtiBe4",
  authDomain: "scubasteverocks-1b9a9.firebaseapp.com",
  projectId: "scubasteverocks-1b9a9",
  storageBucket: "scubasteverocks-1b9a9.firebasestorage.app",
  messagingSenderId: "400216295120",
  appId: "1:400216295120:web:fd46f6a78b91d6de95c0d5",
  measurementId: "G-DTQ7JP0FPR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore (simple + compatible)
const db = getFirestore(app);

// Storage
const storage = getStorage(app);

// Analytics (safe init)
let analytics: Analytics | null = null;
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch {
  console.warn("Firebase Analytics failed to initialize. Continuing without it.");
}

/**
 * Diagnostic function to check if the app can successfully talk to Firestore.
 * Attempts to fetch 1 document from the public sightings collection.
 */
export const checkDbConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const q = query(collection(db, "marineSightings"), limit(1));
    await getDocs(q);
    return { success: true, message: "Connected & Readable" };
  } catch (e: any) {
    console.error("Firebase Connection Diagnostic Failed:", e);
    let msg = "Connection Failed";
    if (e?.code === "permission-denied") msg = "Permission Denied (Check Rules)";
    if (e?.code === "unavailable") msg = "Network/Service Unavailable";
    return { success: false, message: msg };
  }
};

/**
 * Diagnostic function to check if the app can write to Storage.
 * Attempts to upload a tiny text file to the user's folder.
 */
export const checkStorageConnection = async (
  userId: string | undefined
): Promise<{ success: boolean; message: string }> => {
  if (!userId || userId.startsWith("guest-") || userId === "mock-demo-user") {
    return { success: false, message: "Auth/Guest Restricted" };
  }

  try {
    const testRef = ref(storage, `marine-photos/${userId}/diagnostics-test.txt`);
    await uploadString(testRef, "test");
    await deleteObject(testRef);
    return { success: true, message: "Write/Delete OK" };
  } catch (e: any) {
    console.error("Storage Diagnostic Failed:", e);
    let msg = "Upload Failed";
    if (e?.code === "storage/unauthorized") msg = "Permission Denied (Check Rules)";
    if (e?.code === "storage/cors-error" || String(e?.message || "").includes("CORS")) {
      msg = "CORS Error (Fix in Cloud Console)";
    }
    return { success: false, message: msg };
  }
};

export { db, auth, app, storage, analytics };
