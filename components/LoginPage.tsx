
import React, { useState, FC, useEffect } from 'react';
import { signInWithGoogle, loginAsGuest, DEMO_USER } from '../services/firebase/auth';
import { User, AppConfig } from '../types';
import { ScubaSteveLogo } from './ScubaSteveLogo';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  config?: AppConfig;
}

const FeatureCard: FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-500/20">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2 font-heading">{title}</h3>
    <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
  </div>
);

export const LoginPage: FC<LoginPageProps> = ({ onLoginSuccess, config }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const brandLogo = config?.logoUrl;
  const avatarUrl = config?.avatarUrl;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage("Connecting to OSEA Network...");
    try {
      const user = await signInWithGoogle();
      if (user) {
        if (user.uid === DEMO_USER.uid) {
             setStatusMessage("Preview Mode Detected...");
             setTimeout(() => onLoginSuccess(user), 1500);
        } else {
             onLoginSuccess(user);
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMessage("Login failed. Try Guest Mode.");
    }
  };

  const handleGuestLogin = async () => {
      setIsLoading(true);
      setStatusMessage("Preparing Guest Session...");
      try {
          const user = await loginAsGuest();
          onLoginSuccess(user);
      } catch (e) {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#011627] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#011627]/80 via-[#011627]/90 to-[#011627]"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#011627]/90 backdrop-blur-md border-b border-white/5 py-3' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ScubaSteveLogo className="w-10 h-10 rounded-lg" src={avatarUrl} />
            <span className="font-heading font-bold text-xl text-white tracking-tight">Scuba Steve AI<span className="text-cyan-400">.</span></span>
          </div>
          <button 
            onClick={handleLogin}
            className="hidden sm:block px-5 py-2 rounded-full border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Now Available Offline
          </div>
          
          <h1 className="font-heading text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            Explore the Ocean <br /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your AI Dive Buddy for marine identification, trip planning, and dive logs. 
            Built for divers, by divers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-1"
            >
              {isLoading ? statusMessage || 'Loading...' : 'Start for Free (Guest)'}
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-lg rounded-xl backdrop-blur-sm transition-all"
            >
              Member Login
            </button>
          </div>
          
          <p className="mt-6 text-sm text-slate-500">
            No credit card required • Works on iOS & Android
          </p>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6 border-t border-white/5 bg-[#011627]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              title="Marine ID"
              desc="Snap a photo of any fish, coral, or critter. Scuba Steve identifies it instantly with 95% accuracy and provides fun facts."
            />
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>}
              title="Dive Planning"
              desc="Calculate MOD, EAD, SAC rates, and plan complex trips. Get live condition reports for any dive site on Earth."
            />
            <FeatureCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
              title="Voice Assistant"
              desc="Talk to Scuba Steve hands-free. Ask about safety protocols, gear advice, or identifying that weird thing you saw."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center">
        <p className="text-slate-500 mb-4">
          Powered by <span className="text-slate-300 font-semibold">Gemini 2.5 Flash</span> & OSEA Diver™
        </p>
        <div className="flex justify-center gap-6 text-sm text-slate-400">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
        </div>
        {brandLogo && (
            <div className="mt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <img src={brandLogo} alt="OSEA" className="h-8 mx-auto" />
            </div>
        )}
      </footer>
    </div>
  );
};
