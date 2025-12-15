import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase"; // <-- use your real firebase file

export type UsageEventType =
  | "open_feature"
  | "marine_id_request"
  | "color_correction"
  | "calculator_used"
  | "game_round_played"
  | "dive_trip_plan"
  | "voice_chat_started"
  | "dive_site_lookup"
  | "scuba_news_viewed"
  | "app_session_start";

/**
 * Logs a specific usage event to the User's personal activity folder in Firestore.
 * This structure allows for future "Mentoring" review of a specific user's progress.
 * Path: users/{uid}/activity_logs/{logId}
 * 
 * @param uid The user's ID.
 * @param type The type of event.
 * @param details Optional object containing extra metadata.
 */
export async function logUsageEvent(
  type: UsageEventType,
  details?: Record<string, any>
) {
  const uid = auth.currentUser?.uid;

  if (!uid || uid === "mock-demo-user" || uid.startsWith("guest-")) return;

  try {
    await addDoc(collection(db, "users", uid, "activity_logs"), {
      type,
      details: details ?? {},
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[UsageService] Failed to log event:", e);
  }
}

// --- LIMIT GUARD (MOCK) ---
// Bypasses cloud function calls for the No-Build version.
export async function guardSteveRequest(uid: string) {
  // In the standalone/no-build version, limits are either handled client-side
  // or ignored for this specific check to ensure the app functions offline/locally.
  return {
    ok: true,
    tier: "free",
    used: 0,
    limit: 999,
  };
}
