import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'static', // Puts JS/CSS in /static/ instead of /assets
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
            genai: ['@google/genai']
          }
        }
      }
    },
    define: {
      // Polyfill process.env for the Google GenAI SDK and existing code
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || process.env.API_KEY),
        NODE_ENV: JSON.stringify(mode)
      }
    }
  };
});