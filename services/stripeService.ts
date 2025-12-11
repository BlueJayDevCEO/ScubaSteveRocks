
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc 
} from "firebase/firestore";
import { db } from "../lib/firebase";  // adjust the path if stripeService is elsewhere

// ACTUAL STRIPE PRICE IDs (Test Mode)
const STRIPE_PRICE_IDS = {
    // Scuba Steve Pro ($9.99/mo) - derived from your link price_1SbeO9L3mNCUAVdPPmmf4AQ4
    SUBSCRIPTION_MONTHLY: "price_1SbeO9L3mNCUAVdPPmmf4AQ4", 
    // One-Time Donation - derived from your link price_1SbeQoL3mNCUAVdPEcfWzvIL
    DONATION_ONETIME: "price_1SbeQoL3mNCUAVdPEcfWzvIL"     
};

/**
 * Starts a Stripe Checkout session by creating a doc in Firestore.
 * The Firebase Extension listens to this, talks to Stripe, and returns a URL.
 */
export async function createCheckoutSession(uid: string, type: 'subscription' | 'donation'): Promise<void> {
  if (!uid) throw new Error("User must be logged in");

  const priceId = type === 'subscription' 
    ? STRIPE_PRICE_IDS.SUBSCRIPTION_MONTHLY 
    : STRIPE_PRICE_IDS.DONATION_ONETIME;

  const mode = type === 'subscription' ? 'subscription' : 'payment';

  // 1. Create a doc in customers/{uid}/checkout_sessions
  // The Firebase Extension watches this collection
  const collectionRef = collection(db, "customers", uid, "checkout_sessions");
  
  const docRef = await addDoc(collectionRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    mode: mode, 
  });

  // 2. Listen for the Extension to attach the 'url' or 'error'
  onSnapshot(docRef, (snap) => {
    const { error, url } = snap.data() as { error?: { message: string }, url?: string } || {};
    
    if (error) {
      console.error("Stripe Error:", error.message);
      alert(`Payment Error: ${error.message}`);
    }
    
    if (url) {
      // 3. Redirect the user to Stripe
      window.location.assign(url);
    }
  });
}

/**
 * Setup a listener for the user's subscription status.
 * Returns an unsubscribe function.
 */
export function listenForSubscription(uid: string, callback: (isPro: boolean) => void) {
    const subsRef = collection(db, "customers", uid, "subscriptions");
    
    // Listen to the active subscriptions
    const unsubscribe = onSnapshot(subsRef, (snapshot) => {
        // Check if any doc has status 'active' or 'trialing'
        const hasActiveSub = snapshot.docs.some(doc => {
            const data = doc.data();
            return data.status === 'active' || data.status === 'trialing';
        });
        
        callback(hasActiveSub);
    });

    return unsubscribe;
}
