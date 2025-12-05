
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import { AppConfig } from "../types";

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const docRef = doc(db, "appMeta", "config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AppConfig;
    } else {
      // Ideally we would log this, but to keep console clean for users, just return empty
      return {};
    }
  } catch (error) {
    // This often happens if the user is offline or rules deny access (unauthenticated)
    // Returning empty object ensures the app falls back to default assets gracefully
    return {};
  }
}
