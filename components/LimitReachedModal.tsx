
import React, { useState } from 'react';
import { CountdownTimer } from './CountdownTimer';

interface LimitReachedModalProps {
  onClose: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose }) => {
  const [showCrypto, setShowCrypto] = useState(false);
  const [donationStatus, setDonationStatus] = useState<'idle' | 'thank_you'>('idle');
  
  const getExpiryTimestamp = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  const handleDonation = () => {
    setDonationStatus('thank_you');
    setTimeout(() => {
        setDonationStatus('idle');
    }, 5000); // Reset after 5 seconds
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in border border-light-accent/20 dark:border-dark-accent/20">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">Daily Limit Reached</h2>
        <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-2">
            You've used your free daily actions (IDs, chats, etc.). Your limits will reset at midnight.
        </p>

        <p className="font-semibold text-light-text dark:text-dark-text mb-2">Time until reset:</p>
        <CountdownTimer expiryTimestamp={getExpiryTimestamp()} onComplete={onClose} />
        
        {donationStatus === 'thank_you' ? (
             <div className="text-center p-3 my-4 bg-light-primary-end/10 text-light-primary-end dark:bg-dark-primary-end/10 dark:text-dark-primary-end rounded-lg font-semibold animate-fade-in">
                Thank you for your support! 🌊
            </div>
        ) : (
             <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
                OSEA Diver™ donates up to 25% of all proceeds to verified marine-conservation partners. Your support helps us cover server costs and fund this mission.
            </p>
        )}
        
        <div className="flex flex-col gap-3">
          <a 
            href="https://buy.stripe.com/eVq4gy8wj090bjZgGA1ZS0e"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDonation}
            className="w-full block text-center bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-bold text-xl py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20"
          >
            Support with Stripe 💳
          </a>
          <button 
            onClick={() => {
                setShowCrypto(!showCrypto);
                if (!showCrypto) handleDonation(); // Show thank you on reveal
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
