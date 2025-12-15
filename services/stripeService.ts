import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/config";

const STRIPE_PRICE_IDS = {
  SUBSCRIPTION_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
  DONATION_ONETIME: import.meta.env.VITE_STRIPE_PRICE_DONATION_5,
} as const;

function getPriceId(type: "subscription" | "donation") {
  const priceId =
    type === "subscription"
      ? STRIPE_PRICE_IDS.SUBSCRIPTION_MONTHLY
      : STRIPE_PRICE_IDS.DONATION_ONETIME;

  if (!priceId) throw new Error(`Missing Stripe price env var for ${type}`);
  return priceId;
}

export async function createCheckoutSession(uid: string, type: "subscription" | "donation") {
  if (!uid) throw new Error("User must be logged in");

  const priceId = getPriceId(type);
  const mode = type === "subscription" ? "subscription" : "payment";

  const collectionRef = collection(db, "customers", uid, "checkout_sessions");

  const docRef = await addDoc(collectionRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    mode,
  });

  onSnapshot(docRef, (snap) => {
    const data = snap.data() as { error?: { message: string }; url?: string } | undefined;
    if (!data) return;

    if (data.error?.message) {
      console.error("Stripe Error:", data.error.message);
      alert(`Payment Error: ${data.error.message}`);
      return;
    }

    if (data.url) window.location.assign(data.url);
  });
}
