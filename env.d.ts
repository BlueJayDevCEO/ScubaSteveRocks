/// <reference types=\"vite/client\" />
interface ImportMetaEnv {
  readonly VITE_GOOGLE_GENAI: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
