/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_GENAI: string;
  readonly VITE_STRIPE_PRICE_PRO_MONTHLY: string;
  readonly VITE_STRIPE_PRICE_DONATION_5: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
