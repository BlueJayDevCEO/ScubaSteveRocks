import React, { useState, FC, useContext } from 'react';
import { signInWithGoogle, loginAsGuest, DEMO_USER } from '../services/firebase/auth';
import { User } from '../types';
import { ScubaSteveLogo } from './ScubaSteveLogo';
import { AppContext } from '../App';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const context = useContext(AppContext);
  const brandLogo = context?.config?.logoUrl;

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Connecting to OSEA Network...");
    
    try {
      const user = await signInWithGoogle();
      if (user) {
        if (user.uid === DEMO_USER.uid) {
             setStatusMessage("Preview Environment detected. Auto-switching to Guest Mode...");
             setTimeout(() => onLoginSuccess(user), 1500);
        } else {
             setStatusMessage("Success! Preparing your logbook...");
             onLoginSuccess(user);
        }
      }
    } catch (err: any) {
      console.error('Login flow error:', err);
      setIsLoading(false);
      setStatusMessage(null);
      
      if (err.message !== 'Login cancelled by user.') {
          setError("Authentication failed. Please use 'Continue as Guest'.");
      }
    }
  };

  const handleGuestLogin = async () => {
      setIsLoading(true);
      setError(null);
      setStatusMessage("Preparing Guest Session...");
      try {
          const user = await loginAsGuest();
          onLoginSuccess(user);
      } catch (e) {
          setIsLoading(false);
          setError("Guest login failed. Please refresh.");
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-light-bg dark:bg-dark-bg">
      <div className="w-full max-w-md mx-auto z-10 text-center">
        <header className="flex flex-col items-center gap-4 mb-8">
          <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl animate-float-steve">
              {/* Mascot - Scuba Steve (Forced via Component) */}
              <ScubaSteveLogo className="w-32 h-32 rounded-xl" />
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-light-text dark:text-dark-text">
            Scuba Steve AI™
          </h1>
          <p className="text-xl text-light-text/80 dark:text-dark-text/80">
            Your AI Dive Buddy
          </p>
        </header>

        <main className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 flex flex-col gap-4 transition-all">
          <h2 className="font-semibold text-2xl font-heading text-light-text dark:text-dark-text mb-2">Welcome Aboard</h2>
          
          {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm mb-2 animate-fade-in">
                  {error}
              </div>
          )}
          
          {statusMessage && (
              <div className="bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent p-3 rounded-lg text-sm mb-2 animate-pulse font-semibold">
                  {statusMessage}
              </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 shadow-sm group"
          >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            )}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{isLoading ? 'Processing...' : 'Sign in with Google'}</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50 hover:scale-[1.02]"
          >
            Continue as Guest
          </button>
          
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-2">
            Guest mode enables all features. Data is stored locally on this device.
          </p>

          {/* OSEA Brand Footer inside Card */}
          <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-center gap-2 opacity-80">
              <span className="text-xs font-semibold uppercase tracking-wider text-light-text/60 dark:text-dark-text/60">Powered by</span>
              {brandLogo ? (
                  <img src={brandLogo} alt="OSEA Diver" className="h-6 object-contain" />
              ) : (
                  <span className="font-bold text-sm">OSEA Diver™</span>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};