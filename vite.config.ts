import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    resolve: {
      alias: {
          "@": path.resolve(__dirname, "."),
          "@services": path.resolve(__dirname, "./services"),
          "@components": path.resolve(__dirname, "./components"),
      },
   },      

    build: {
      outDir: "dist",
      assetsDir: "static",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "firebase/app",
              "firebase/auth",
              "firebase/firestore",
            ],
            genai: ["@google/genai"],
          },
        },
      },
    },

    define: {
      "process.env": {
        API_KEY: JSON.stringify(env.API_KEY || process.env.API_KEY),
        NODE_ENV: JSON.stringify(mode),
      },
    },
  };
});
