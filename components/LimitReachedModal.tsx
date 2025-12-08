
import React, { useState, useContext } from 'react';
import { CountdownTimer } from './CountdownTimer';
import { AppContext } from '../App';
import { createCheckoutSession } from '../services/stripeService';

interface LimitReachedModalProps {
  onClose: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose }) => {
  const [showCrypto, setShowCrypto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(AppContext);
  const user = context?.user;
  
  const getExpiryTimestamp = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  const handleSupport = async () => {
      if (!user || user.uid === 'mock-demo-user' || user.email === 'scubasteve@scubasteve.rocks') {
          alert("Please sign in to subscribe.");
          return;
      }
      setIsLoading(true);
      try {
          await createCheckoutSession(user.uid, 'subscription');
      } catch (e) {
          console.error(e);
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in border border-light-accent/20 dark:border-dark-accent/20">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">Daily Limit Reached</h2>
        <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-2">
            You've used your free daily actions (IDs, chats, etc.). Your limits will reset at midnight.
        </p>

        <p className="font-semibold text-light-text dark:text-dark-text mb-2">Time until reset:</p>
        <CountdownTimer expiryTimestamp={getExpiryTimestamp()} onComplete={onClose} />
        
        <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
            Upgrade to Pro for unlimited access and help us fund marine conservation.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSupport}
            disabled={isLoading}
            className="w-full block text-center bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-bold text-xl py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20 disabled:opacity-50"
          >
            {isLoading ? 'Connecting to Stripe...' : 'Upgrade to Pro ($9.99/mo) 👑'}
          </button>
          <button 
            onClick={() => {
                setShowCrypto(!showCrypto);
            }}
            className="w-full bg-light-primary-end/20 dark:bg-dark-primary-end/20 text-light-primary-end dark:text-dark-primary-end font-bold text-lg py-2 rounded-lg hover:bg-light-primary-end/30 dark:hover:bg-dark-primary-end/30 transition-colors"
          >
            {showCrypto ? 'Hide Crypto Info' : 'Support with Crypto 💎'}
          </button>
        </div>

        {showCrypto && (
          <div className="mt-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-left text-sm animate-fade-in text-light-text/80 dark:text-dark-text/80 max-w-full overflow-x-auto">
              <p className="font-bold text-light-text dark:text-dark-text">Bitcoin (BTC):</p>
              <code className="block bg-light-bg/50 dark:bg-dark-bg/50 text-light-accent dark:text-dark-accent px-2 py-1 rounded break-all text-xs">1ET6vBxCqy1uWS6FVSuamFueER6xDBnzr</code>
              <p className="mt-2 font-bold text-light-text dark:text-dark-text">Ripple (XRP):</p>
              <p>Address: <code className="block bg-light-bg/50 dark:bg-dark-bg/50 text-light-accent dark:text-dark-accent px-2 py-1 rounded break-all text-xs">r34mWrX3cZCZpJEsqe1F6PNotREXwj1f3r</code></p>
              <p>Tag: <code className="bg-light-bg/50 dark:bg-dark-bg/50 text-light-accent dark:text-dark-accent px-2 py-1 rounded">214572013</code></p>
          </div>
        )}

        <button onClick={onClose} className="text-light-text/70 dark:text-dark-text/70 hover:underline mt-6">
          Close
        </button>
      </div>
    </div>
  );
};
