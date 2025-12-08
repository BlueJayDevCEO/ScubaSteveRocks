
import React from 'react';

export const GlobalStyles: React.FC = () => (
  <style>{`
      /* --- GLOBAL SCROLLBAR HIDING (The "Sexy" Clean Look) --- */
      /* Hide scrollbar for Chrome, Safari and Opera */
      ::-webkit-scrollbar {
          display: none;
          width: 0px;
          height: 0px;
          background: transparent;
      }

      /* Hide scrollbar for IE, Edge and Firefox */
      * {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }

      /* --- CORE TYPOGRAPHY & UX --- */
      html {
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }

      body {
        padding-bottom: 90px; /* Space for bottom navigation bar */
        overflow-x: hidden; /* Prevent horizontal scroll */
      }
      
      /* Selection Color */
      ::selection {
        background: rgba(0, 180, 216, 0.3); /* Light Cyan */
        color: inherit;
      }

      a, button { 
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        cursor: pointer;
        -webkit-tap-highlight-color: transparent; /* Remove mobile tap gray box */
      }

      /* --- Cinematic Full Screen Background --- */
      .living-ocean-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1; 
          background-color: #011627; 
          /* Image is now set dynamically in App.tsx via inline styles */
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          transition: background-image 0.5s ease-in-out;
      }

      /* Dark overlay + Sun Rays Effect */
      .living-ocean-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(1, 22, 39, 0.3), rgba(1, 22, 39, 0.8));
          backdrop-filter: blur(0px); 
      }
      
      /* Sun Rays Animation Layer */
      .living-ocean-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
                      conic-gradient(from 90deg at 50% 0%, transparent 0deg, rgba(255, 255, 255, 0.03) 20deg, transparent 40deg, rgba(255, 255, 255, 0.03) 60deg, transparent 80deg);
          animation: sun-rays-rotate 60s linear infinite;
          pointer-events: none;
          z-index: 0;
      }

      @keyframes sun-rays-rotate {
          0% { transform: rotate(-5deg) translateY(0); opacity: 0.5; }
          50% { transform: rotate(5deg) translateY(-2%); opacity: 0.8; }
          100% { transform: rotate(-5deg) translateY(0); opacity: 0.5; }
      }

      .dark .living-ocean-bg::after {
          background: linear-gradient(to bottom, rgba(1, 10, 20, 0.4), rgba(0, 0, 0, 0.85));
      }

      /* --- Glassmorphism System (Refined) --- */
      .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
      }

      .dark .glass-panel {
          background: rgba(10, 25, 47, 0.65); /* Deep blue glass */
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
      }
      
      /* --- Text Gradients --- */
      .text-gradient-primary {
          background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
      }
      .dark .text-gradient-primary {
          background: linear-gradient(135deg, #48cae4 0%, #90e0ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(72, 202, 228, 0.4);
      }
      
      /* --- Shimmer Animation for Text --- */
      @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
      }
      
      .animate-text-shimmer {
          background: linear-gradient(to right, #ffffff 20%, #48cae4 40%, #48cae4 60%, #ffffff 80%);
          background-size: 200% auto;
          color: #fff;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-shimmer 5s linear infinite;
      }

      /* Landing Page Specifics */
      .mask-image-linear-gradient {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      }

      /* --- Surface Interval Widget Styles --- */
      #si-wrap.dark{
        --bg: #071426; --card:#0e2a47; --text:#e0fbfc; --muted:#89d2e2;
        --btn-start: #f78c6b; --btn-end: #ffde7d; --btnText:#071426;
        --cam-start: #00a9e0; --cam-end: #89d2e2;
      }
      #si-wrap.light{
        --bg: #f0f9ff; --card:#ffffff; --text:#0c2d48; --muted:#0096c7;
        --btn-start: #ef476f; --btn-end: #ffd166; --btnText:#ffffff;
        --cam-start: #0096c7; --cam-end: #48cae4;
      }
      #si-wrap{
        font-family:Inter,system-ui,Segoe UI,Roboto,Arial;
        border-radius:16px;
        width: 100%;
        margin:0 auto;
        padding:1.5rem;
        background:var(--card);
        color:var(--text);
        box-shadow:0 10px 30px rgba(0,0,0,.08);
        border:1px solid rgba(0,0,0,.05)
      }
      #si-head{display:flex;gap:12px;align-items:center;justify-content:space-between}
      #si-title{font-weight:600;font-size:1.25rem}
      #si-ingredients{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:var(--bg);color:var(--text)}
      .si-btn{border:0;border-radius:12px;padding:10px 14px;cursor:pointer;font-weight:600}
      #si-btn{background:linear-gradient(90deg, var(--btn-start), var(--btn-end));color:var(--btnText)}
      #si-cam{background:linear-gradient(90deg, var(--cam-start), var(--cam-end)); color: #f7fff7;}
      #si-status{color:var(--muted);font-size:.9rem}
      
      /* Loader styles */
      #si-loader { text-align: center; padding: 2rem 1rem; position: relative; overflow: hidden; background: var(--bg); border-radius: 12px; margin-top: 12px; }
      #si-loader-text { font-size: 1.1rem; font-weight: 600; color: var(--muted); margin-bottom: 0.5rem; position: relative; z-index: 2; }
      #si-countdown { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 3rem; color: var(--btn-start); line-height: 1; position: relative; z-index: 2; }
      #si-loader-bubbles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
      #si-loader-bubbles span { position: absolute; bottom: -50px; width: 20px; height: 20px; background-color: var(--cam-end); border-radius: 50%; opacity: 0.5; animation: rise 15s infinite ease-in; }
      #si-loader-bubbles span:nth-child(2) { width: 15px; height: 15px; left: 10%; animation-duration: 12s; animation-delay: 2s; }
      #si-loader-bubbles span:nth-child(3) { width: 25px; height: 25px; left: 35%; animation-duration: 18s; animation-delay: 2s; }
      #si-loader-bubbles span:nth-child(4) { width: 10px; height: 10px; left: 60%; animation-duration: 10s; animation-delay: 1s; }
      #si-loader-bubbles span:nth-child(5) { width: 30px; height: 30px; left: 85%; animation-duration: 14s; animation-delay: 3s; }
      
      /* Hero Section - Transparent to show global bg */
      .hero-section {
        background: transparent;
      }

      /* Sonar sweep animation */
      @keyframes sonar-sweep {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Custom Prose styles */
      .prose {
        --tw-prose-body: #01579b;
        --tw-prose-headings: #01579b;
        --tw-prose-links: #0077b6;
        --tw-prose-bold: #01579b;
        --tw-prose-bullets: #0096c7;
        --tw-prose-code: #0077b6;
        --tw-prose-code-bg: rgba(0, 180, 216, 0.1);
        color: var(--tw-prose-body);
      }
      .dark .prose {
        --tw-prose-body: #ade8f4;
        --tw-prose-headings: #ffffff;
        --tw-prose-links: #90e0ef;
        --tw-prose-bold: #ffffff;
        --tw-prose-bullets: #48cae4;
        --tw-prose-code: #90e0ef;
        --tw-prose-code-bg: rgba(142, 202, 230, 0.1);
      }

      /* Enhanced Loader Animations */
      .bubble-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
      }
      .bubble {
          position: absolute;
          bottom: -20px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          opacity: 0;
          animation: rise 20s infinite ease-in;
      }
      .bubble:nth-child(1) { width: 40px; height: 40px; left: 10%; animation-duration: 18s; }
      .bubble:nth-child(2) { width: 20px; height: 20px; left: 20%; animation-duration: 12s; animation-delay: 1s; }
      .bubble:nth-child(3) { width: 50px; height: 50px; left: 35%; animation-duration: 25s; animation-delay: 2s; }
      .bubble:nth-child(4) { width: 80px; height: 80px; left: 50%; animation-duration: 22s; animation-delay: 0s; }
      .bubble:nth-child(5) { width: 35px; height: 35px; left: 55%; animation-duration: 15s; animation-delay: 1s; }
      .bubble:nth-child(6) { width: 45px; height: 45px; left: 65%; animation-duration: 19s; animation-delay: 3s; }
      .bubble:nth-child(7) { width: 90px; height: 90px; left: 70%; animation-duration: 28s; animation-delay: 2s; }
      .bubble:nth-child(8) { width: 25px; height: 25px; left: 80%; animation-duration: 14s; animation-delay: 2s; }
      .bubble:nth-child(9) { width: 15px; height: 15px; left: 70%; animation-duration: 10s; animation-delay: 1s; }
      .bubble:nth-child(10) { width: 90px; height: 90px; left: 25%; animation-duration: 24s; animation-delay: 4s; }

      @keyframes rise {
          0% { bottom: -100px; transform: translateX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { bottom: 120vh; transform: translateX(-40px); opacity: 0; }
      }

      @keyframes float-steve {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
      }
      .animate-float-steve {
          animation: float-steve 6s ease-in-out infinite;
      }

      @keyframes ripple-slow {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
      }
      .animate-ripple-slow {
          animation: ripple-slow 4s linear infinite;
      }
  `}</style>
);
