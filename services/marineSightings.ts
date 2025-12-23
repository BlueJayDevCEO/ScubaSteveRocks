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

export const REGIONS = [
  "Global",
  "Caribbean",
  "Red Sea",
  "Mediterranean",
  "Indo-Pacific",
  "South Africa",
  "Atlantic",
  "Pacific",
  "Other",
] as const;

export type Region = (typeof REGIONS)[number];

export interface MarineSightingInput {
  userId: string;
  dataUrl?: string | null;
  commonName: string;
  species: string;
  confidence: number;
  lat?: number | null;
  lng?: number | null;
  locationName: string;
  region: string;
  description?: string;
}

// --- helpers ---
const resizeImageBlob = (originalBlob: Blob, maxWidth = 1280): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(originalBlob);

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxWidth) return resolve(originalBlob);

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
      if (!ctx) return resolve(originalBlob);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob ?? originalBlob),
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => resolve(originalBlob);
  });

const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

// --- main: save sighting ---
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

  if (!userId) return { success: false, mode: "error", error: "Missing User ID" };
  if (userId === "mock-demo-user" || userId.startsWith("guest-")) {
    return { success: false, mode: "local" };
  }

  let imageUrl: string | null = null;

  if (dataUrl && dataUrl.startsWith("data:image")) {
    try {
      const originalBlob = dataURLtoBlob(dataUrl);
      const compressedBlob = await resizeImageBlob(originalBlob);

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const photoRef = ref(storage, `marine-photos/${userId}/${fileName}`);

      const snapshot = await uploadBytes(photoRef, compressedBlob);
      imageUrl = await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.error("Upload failed:", err);
      imageUrl = null;
    }
  } else if (dataUrl && dataUrl.startsWith("http")) {
    imageUrl = dataUrl;
  }

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
    correctedSpecies: "",
    correctedCommonName: "",
    correctedImageUrl: "",
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "marineSightings"), docData);
    return { success: true, mode: "cloud", id: docRef.id };
  } catch (e: any) {
    return { success: false, mode: "error", error: e.message };
  }
}

// --- map feed ---
const SIGHTINGS_COLLECTION = "marineSightings";

export async function getRecentSightings(region: string): Promise<CommunitySighting[]> {
  const q = query(
    collection(db, SIGHTINGS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);

  const all = snap.docs.map((d) => {
    const data = d.data() as any;
    const createdAt =
      data.createdAt?.toMillis?.() ??
      (typeof data.createdAt === "number" ? data.createdAt : Date.now());

    const isCorrected = !!data.corrected;
    const displaySpecies =
      isCorrected && data.correctedSpecies ? data.correctedSpecies : (data.species ?? data.commonName ?? "Unknown species");
    const displayCommon =
      isCorrected && data.correctedCommonName ? data.correctedCommonName : (data.commonName ?? "");
    const displayImage =
      isCorrected && data.correctedImageUrl ? data.correctedImageUrl : (data.imageUrl ?? "");

    return {
      id: d.id,
      species: displaySpecies,
      commonName: displayCommon,
      imageUrl: displayImage,
      location: data.locationName ?? "Unknown location",
      region: data.region ?? "Other",
      description: data.description ?? "",
      createdAt,
      corrected: isCorrected,
      correctionsCount: data.correctionsCount ?? 0,
    } as any;
  });

  if (!region || region === "Global") return all;

  return all.filter((s: any) => s.region === region);
}

// --- corrections ---
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
    // ✅ IMPORTANT: this is the folder you should check in Storage
    const photoRef = ref(storage, `marine-photos/corrections/${sightingId}/${fileName}`);

    const snapshot = await uploadBytes(photoRef, compressedBlob);
    correctedImageUrl = await getDownloadURL(snapshot.ref);
  }

  // 1) create correction doc
  await addDoc(collection(db, "marineSightings", sightingId, "corrections"), {
  sightingId,
  submittedBy,
  status: "pending",
  correctedSpecies,
  correctedCommonName,
  correctedImageUrl: correctedImageUrl ?? "",
  createdAt: serverTimestamp(),
});

  // 2) update parent so the WORLD MAP can display it without extra queries
  await updateDoc(doc(db, "marineSightings", sightingId), {
    corrected: true,
    correctionsCount: increment(1),
    lastCorrectionAt: serverTimestamp(),
    correctedSpecies,
    correctedCommonName,
    correctedImageUrl: correctedImageUrl ?? "",
  });

  return { success: true, correctedImageUrl };
}
