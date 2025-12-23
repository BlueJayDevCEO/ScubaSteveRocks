import { db, storage } from "./firebase/config";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type UserProfile = {
  displayName: string;
  email: string;
  photoURL: string;
  contributesData: boolean;
  premium: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export async function ensureUserProfile(uid: string, profile: Partial<UserProfile>) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: profile.displayName ?? "Diver",
      email: profile.email ?? "",
      photoURL: profile.photoURL ?? "",
      contributesData: profile.contributesData ?? true,
      premium: profile.premium ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadUserAvatar(uid: string, file: File) {
  const avatarRef = ref(storage, `users/${uid}/avatar.jpg`);
  await uploadBytes(avatarRef, file, { contentType: file.type });
  const url = await getDownloadURL(avatarRef);
  await updateUserProfile(uid, { photoURL: url });
  return url;
}

