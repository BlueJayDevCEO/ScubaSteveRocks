
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit, writeBatch, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase/config';
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
    "Other"
];

export interface MarineSightingInput {
  userId: string;
  dataUrl?: string | null;          // "data:image/jpeg;base64,...."
  commonName: string;
  species: string;
  confidence: number;               // 0–100
  lat?: number | null;              // Optional/Deprecated
  lng?: number | null;              // Optional/Deprecated
  locationName: string;             // REQUIRED: Manually entered specific location (e.g. "Blue Hole")
  region: string;                   // REQUIRED: Broad region category (e.g. "Caribbean")
  description?: string;             // Short summary of the ID
}

// Helper: Resize Image Blob
// Compresses large images to max 1280px to ensure fast, reliable uploads.
const resizeImageBlob = (originalBlob: Blob, maxWidth = 1280): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(originalBlob);
        
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;

            // If image is already smaller than limit, return original
            if (width <= maxWidth && height <= maxWidth) {
                resolve(originalBlob);
                return;
            }
            
            // Maintain aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                // Fallback to original if canvas fails
                resolve(originalBlob); 
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG 80%
            canvas.toBlob(blob => {
                if (blob) {
                    console.log(`[Image] Resized from ${(originalBlob.size/1024).toFixed(0)}KB to ${(blob.size/1024).toFixed(0)}KB`);
                    resolve(blob);
                } else {
                    resolve(originalBlob); // Fallback
                }
            }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => resolve(originalBlob); // Fallback on error
    });
};

// Helper to convert Base64 Data URL to Blob for reliable upload
const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

/**
 * Saves a marine sighting:
 * 1. Resizes & Uploads the image to Firebase Storage.
 * 2. Stores metadata in Firestore.
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
    description
  } = input;

  if (!userId) {
    console.error('saveMarineSighting: userId is required');
    return { success: false, mode: 'error', error: 'Missing User ID' };
  }

  // 1. Auth/Guest Check
  if (userId === 'mock-demo-user' || userId.startsWith('guest-')) {
      console.log("[Firestore] Guest/Offline. Skipping cloud save.");
      return { success: false, mode: 'local' };
  }

  let imageUrl: string | null = null;

  // 2. Upload image to Storage if we have a data URL
  if (dataUrl && dataUrl.startsWith('data:image')) {
    try {
      // Convert base64 to Blob
      const originalBlob = dataURLtoBlob(dataUrl);
      
      // OPTIMIZATION: Resize image before upload to prevent timeouts/quota limits
      const compressedBlob = await resizeImageBlob(originalBlob);

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const photoRef = ref(storage, `marine-photos/${userId}/${fileName}`);
      
      // Upload the compressed blob
      const snapshot = await uploadBytes(photoRef, compressedBlob);
      imageUrl = await getDownloadURL(snapshot.ref);
      
      console.log("[Storage] Image uploaded successfully:", imageUrl);
    } catch (err) {
      console.error('Failed to upload marine photo to Storage:', err);
      // Proceed to save data even if image fails, so user doesn't lose the log
      imageUrl = null;
    }
  } else if (dataUrl && dataUrl.startsWith('http')) {
      imageUrl = dataUrl;
  }

  // 3. Save the sighting document in Firestore
  try {
      const docData = {
        userId,
        commonName,
        species,
        confidence,
        imageUrl: imageUrl, // Will be null if upload failed
        lat: lat ?? 0,
        lng: lng ?? 0,
        locationName: locationName || "Unknown Location",
        region: region || "Other",
        description: description || "",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'marineSightings'), docData);
      console.log("[Firestore] Sighting saved:", docRef.id);
      return { success: true, mode: 'cloud', id: docRef.id };
  } catch (e: any) {
      console.warn("[Firestore] Save failed (likely permission or network):", e.message);
      return { success: false, mode: 'error', error: e.message };
  }
}

const SIGHTINGS_COLLECTION = "marineSightings";

/**
 * Returns recent community sightings, filtered by region name.
 * Uses typed `locationName` from Firestore, no GPS.
 */
export async function getRecentSightings(region: string): Promise<CommunitySighting[]> {
  const q = query(
    collection(db, SIGHTINGS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(100)
  );

  const snap = await getDocs(q);

  const allSightings: CommunitySighting[] = snap.docs.map((doc) => {
    const data = doc.data() as any;

    const createdAt =
      data.createdAt?.toMillis?.() ??
      (typeof data.createdAt === "number" ? data.createdAt : Date.now());

    return {
      id: doc.id,
      species: data.species ?? data.commonName ?? "Unknown species",
      imageUrl: data.imageUrl ?? "",
      // 🔥 use typed location from Firestore
      location: data.locationName ?? "Unknown location",
      region: data.region ?? "Other", // Read back the region
      description: data.description ?? "",
      createdAt,
    };
  });

  // If Global, return everything
  if (!region || region === 'Global') return allSightings;

  // Filter by the specific Region tag first (Exact Match)
  // Fallback to text search for older records that might not have the tag
  return allSightings.filter((s) => {
      // 1. Strict Region Match (New System)
      if (s.region === region) return true;
      
      // 2. Legacy Fallback (Old System - Text Search)
      // Only do this if the record doesn't have a valid region tag yet
      if ((!s.region || s.region === 'Other') && s.location.toLowerCase().includes(region.toLowerCase())) {
          return true;
      }
      return false;
  });
}
