
import React from 'react';

export const GlobalStyles: React.FC = () => (
  <style>{`
      a, button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

      body {
        padding-bottom: 90px; /* Space for bottom navigation bar */
        overflow-x: hidden;
      }

      /* --- Cinematic Full Screen Background --- */
      .living-ocean-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1; /* Adjusted to -1 to sit just behind content but above default HTML bg */
          background-color: #011627; /* Fallback Dark Blue Color */
          /* Sexy, high-quality underwater shot with sunrays */
          background-image: url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
      }

      /* Dark overlay to ensure text readability and sexy mood */
      /* Updated: Reduced opacity to let more image shine through */
      .living-ocean-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(1, 22, 39, 0.4), rgba(1, 22, 39, 0.6));
          backdrop-filter: blur(0px); 
      }

      .dark .living-ocean-bg::after {
          background: linear-gradient(to bottom, rgba(1, 10, 20, 0.5), rgba(0, 0, 0, 0.7));
      }

      /* --- Glassmorphism System (Enhanced) --- */
      .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      }

      .dark .glass-panel {
          background: rgba(10, 25, 47, 0.75); /* Deep blue glass */
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          text-shadow: 0 0 20px rgba(72, 202, 228, 0.3);
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

      html {
        scroll-behavior: smooth;
        scroll-padding-top: 90px;
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
