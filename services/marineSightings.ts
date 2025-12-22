import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase/config";
import { CommunitySighting } from "../types";

// Master list of regions to ensure data consistency
export const REGIONS = [
  "Global",
  "Caribbean",
  "Red Sea",
  "Indo-Pacific",
  "Mediterranean",
  "South Africa",
  "Australia / GBR",
  "Hawaii",
  "California",
  "Florida",
  "Galapagos",
  "Atlantic",
  "Other",
];

export interface MarineSightingInput {
  userId: string;
  dataUrl?: string | null; // "data:image/jpeg;base64,...."
  commonName: string;
  species: string;
  confidence: number; // 0–100
  lat?: number | null;
  lng?: number | null;
  locationName: string;
  region: string;
  description?: string;
}

// Helper: Resize Image Blob
const resizeImageBlob = (originalBlob: Blob, maxWidth = 1280): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(originalBlob);

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      // If already small enough
      if (width <= maxWidth && height <= maxWidth) {
        resolve(originalBlob);
        return;
      }

      // Maintain aspect ratio
      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(originalBlob);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(originalBlob);
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => resolve(originalBlob);
  });
};

// Helper: Base64 Data URL to Blob
const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

/**
 * Saves a marine sighting:
 * 1) Upload image to Storage (marine-photos/{uid}/{file}.jpg)
 * 2) Store metadata in Firestore (marineSightings)
 */
export async function saveMarineSighting(input: MarineSightingInput) {
  const {
    userId,
    dataUrl,
    commonName,
    species,
    confidence,
    lat = 0,
    lng = 0,
    locationName,
    region,
    description,
  } = input;

  if (!userId) {
    console.error("saveMarineSighting: userId is required");
    return { success: false, mode: "error", error: "Missing User ID" };
  }

  // guest/offline
  if (userId === "mock-demo-user" || userId.startsWith("guest-")) {
    console.log("[Firestore] Guest/Offline. Skipping cloud save.");
    return { success: false, mode: "local" };
  }

  let imageUrl: string | null = null;

  // Upload if data URL
  if (dataUrl && dataUrl.startsWith("data:image")) {
    try {
      const originalBlob = dataURLtoBlob(dataUrl);
      const compressedBlob = await resizeImageBlob(originalBlob);

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const photoRef = ref(storage, `marine-photos/${userId}/${fileName}`);

      const snapshot = await uploadBytes(photoRef, compressedBlob);
      imageUrl = await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.error("Failed to upload marine photo to Storage:", err);
      imageUrl = null;
    }
  } else if (dataUrl && dataUrl.startsWith("http")) {
    imageUrl = dataUrl;
  }

  // Save sighting doc
  try {
    const docData = {
      userId,
      commonName,
      species,
      confidence,
      imageUrl,
      lat: lat ?? 0,
      lng: lng ?? 0,
      locationName: locationName || "Unknown Location",
      region: region || "Other",
      description: description || "",
      corrected: false,
      correctionsCount: 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "marineSightings"), docData);
    console.log("[Firestore] Sighting saved:", docRef.id);
    return { success: true, mode: "cloud", id: docRef.id };
  } catch (e: any) {
    console.warn("[Firestore] Save failed:", e.message);
    return { success: false, mode: "error", error: e.message };
  }
}

const SIGHTINGS_COLLECTION = "marineSightings";

/**
 * Returns recent community sightings, filtered by region name.
 */
export async function getRecentSightings(region: string): Promise<CommunitySighting[]> {
  const q = query(collection(db, SIGHTINGS_COLLECTION), orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);

  const allSightings: CommunitySighting[] = snap.docs.map((d) => {
    const data = d.data() as any;

    const createdAt =
      data.createdAt?.toMillis?.() ??
      (typeof data.createdAt === "number" ? data.createdAt : Date.now());

    return {
      id: d.id,
      species: data.species ?? data.commonName ?? "Unknown species",
      imageUrl: data.imageUrl ?? "",
      location: data.locationName ?? "Unknown location",
      region: data.region ?? "Other",
      description: data.description ?? "",
      createdAt,
      // optional display helpers:
      corrected: !!data.corrected,
      correctionsCount: data.correctionsCount ?? 0,
    } as any;
  });

  if (!region || region === "Global") return allSightings;

  return allSightings.filter((s) => {
    if (s.region === region) return true;
    if (
      (!s.region || s.region === "Other") &&
      s.location.toLowerCase().includes(region.toLowerCase())
    ) {
      return true;
    }
    return false;
  });
}

/**
 * ✅ Submit a correction for a sighting:
 * - uploads optional corrected image
 * - writes to marineSightings/{sightingId}/corrections
 * - marks parent sighting corrected + increments counter
 */
export async function submitSightingCorrection(input: {
  sightingId: string;
  submittedBy: string; // uid
  correctedSpecies: string;
  correctedCommonName: string;
  note?: string;
  correctedDataUrl?: string | null;
}) {
  const {
    sightingId,
    submittedBy,
    correctedSpecies,
    correctedCommonName,
    note = "",
    correctedDataUrl = null,
  } = input;

  if (!sightingId) throw new Error("Missing sightingId");
  if (!submittedBy) throw new Error("Missing submittedBy uid");

  let correctedImageUrl: string | null = null;

  // Upload corrected image (optional)
  if (correctedDataUrl && correctedDataUrl.startsWith("data:image")) {
    const originalBlob = dataURLtoBlob(correctedDataUrl);
    const compressedBlob = await resizeImageBlob(originalBlob);

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const photoRef = ref(storage, `marine-photos/corrections/${sightingId}/${fileName}`);

    const snapshot = await uploadBytes(photoRef, compressedBlob);
    correctedImageUrl = await getDownloadURL(snapshot.ref);
  }

  // 1) Create correction doc (✅ includes sightingId field required by rules)
  await addDoc(collection(db, "marineSightings", sightingId, "corrections"), {
    sightingId,
    submittedBy,
    status: "pending",
    correctedSpecies,
    correctedCommonName,
    note,
    correctedImageUrl,
    createdAt: serverTimestamp(),
  });

  // 2) Mark parent as corrected (rules allow ONLY these fields)
  await updateDoc(doc(db, "marineSightings", sightingId), {
    corrected: true,
    correctionsCount: increment(1),
    lastCorrectionAt: serverTimestamp(),
  });

  return { success: true };
}
