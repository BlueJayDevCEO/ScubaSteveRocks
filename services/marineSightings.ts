// services/marineSightings.ts

import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from './firebase/config';
import { CommunitySighting } from "../types";

export interface MarineSightingInput {
  userId: string;
  dataUrl?: string | null;          // "data:image/jpeg;base64,...."
  commonName: string;
  species: string;
  confidence: number;               // 0–100
  lat?: number | null;
  lng?: number | null;
  locationName?: string | null;
}

/**
 * Saves a marine sighting:
 * 1. Uploads the image (dataUrl) to Firebase Storage: marine-photos/{userId}/...
 * 2. Stores only the public download URL + metadata in Firestore (marineSightings).
 *
 * Storage rules must allow:
 * match /marine-photos/{userId}/{allPaths=**} { ... }
 */
export async function saveMarineSighting(input: MarineSightingInput) {
  const {
    userId,
    dataUrl,
    commonName,
    species,
    confidence,
    lat = null,
    lng = null,
    locationName = null,
  } = input;

  if (!userId) {
    throw new Error('saveMarineSighting: userId is required');
  }

  // 1. Auth/Guest Check
  if (userId === 'mock-demo-user' || userId.startsWith('guest-')) {
      console.log("[Firestore] Guest/Offline. Skipping cloud save.");
      return { id: 'local-only-' + Date.now() };
  }

  let imageUrl: string | null = null;

  // 2. Upload image to Storage if we have a data URL
  if (dataUrl && dataUrl.startsWith('data:image')) {
    try {
      // Unique path inside marine-photos/{userId}/
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const photoRef = ref(storage, `marine-photos/${userId}/${fileName}`);

      // dataUrl is "data:image/jpeg;base64,..."
      // Using 'data_url' format ensures Firebase handles the base64 string correctly
      await uploadString(photoRef, dataUrl, 'data_url');

      // Public download URL
      imageUrl = await getDownloadURL(photoRef);
      console.log("[Storage] Image uploaded successfully:", imageUrl);
    } catch (err) {
      console.error('Failed to upload marine photo to Storage:', err);
      // Fallback: leave imageUrl as null to avoid breaking Firestore save
      imageUrl = null;
    }
  } else if (dataUrl && dataUrl.startsWith('http')) {
      // It's already a URL (e.g. from previous save)
      imageUrl = dataUrl;
  }

  // 3. Save the sighting document in Firestore
  try {
      const docData = {
        userId,
        commonName,
        species,
        confidence,
        imageUrl: imageUrl,        // ✅ Storage URL or null
        lat: lat ?? 0,
        lng: lng ?? 0,
        locationName: locationName ?? null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'marineSightings'), docData);
      console.log("[Firestore] Sighting saved:", docRef.id);
      return docRef;
  } catch (e: any) {
      console.warn("[Firestore] Save failed (likely permission or network):", e.message);
      // Return a mock ID so the UI doesn't show an error to the user
      return { id: 'error-' + Date.now() };
  }
}

// Fetch recent sightings
export async function getRecentSightings(region?: string): Promise<CommunitySighting[]> {
  try {
    const sightingsRef = collection(db, "marineSightings");
    // Limit to 100 to prevent reading too many docs at once
    const q = query(sightingsRef, orderBy("createdAt", "desc"), limit(100));
    
    const snapshot = await getDocs(q);
    
    const allSightings = snapshot.docs.map(doc => {
      const d = doc.data();
      let createdAtMillis = Date.now();
      if (d.createdAt?.toMillis) {
          createdAtMillis = d.createdAt.toMillis();
      } else if (typeof d.createdAt === 'number') {
          createdAtMillis = d.createdAt;
      }
      
      return {
        id: doc.id,
        species: d.species || "Unknown Species",
        location: d.locationName || "Unknown Location",
        imageUrl: d.imageUrl || undefined,
        createdAt: createdAtMillis
      };
    });

    if (region) {
        const lowerRegion = region.toLowerCase();
        return allSightings.filter(s => s.location.toLowerCase().includes(lowerRegion));
    }

    return allSightings;
  } catch (e) {
    console.warn("[Firestore] Could not fetch sightings:", e);
    return [];
  }
}