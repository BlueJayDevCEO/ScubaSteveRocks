
import React, { useState } from 'react';
import { User } from '../types';
import { DAILY_STANDARD_LIMIT, DAILY_PREMIUM_LIMIT, WEEKLY_CONTRIBUTION_LIMIT, redeemPromoCode } from '../services/userService';
import { createCheckoutSession } from '../services/stripeService';

interface CreditDetailsModalProps {
  user: User;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const UsageBar: React.FC<{ label: string; current: number; max: number; colorClass: string }> = ({ label, current, max, colorClass }) => {
    const percentage = Math.min(100, (current / max) * 100);
    
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1 font-semibold text-light-text/80 dark:text-dark-text/80">
                <span>{label}</span>
                <span>{current} / {max}</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ user, onClose, onUserUpdate }) => {
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  
  const isGuest = user.uid === 'mock-demo-user' || user.email === 'scubasteve@scubasteve.rocks';

  const handleRedeem = () => {
      if (!promoCode.trim()) return;
      
      const success = redeemPromoCode(user.uid, promoCode);
      if (success) {
          setPromoMessage("Success! All functions unlocked. 🔓");
          if (onUserUpdate) onUserUpdate(); // Refresh app state
          setTimeout(() => {
              onClose();
          }, 1500);
      } else {
          setPromoMessage("Invalid code. Please try again.");
      }
  };

  const handleUpgrade = async () => {
      setIsLoadingPayment(true);
      try {
          await createCheckoutSession(user.uid, 'subscription');
      } catch (e) {
          console.error(e);
          alert("Could not start checkout. Please ensure you are logged in.");
          setIsLoadingPayment(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-bold text-2xl text-light-text dark:text-dark-text">Mission Status</h2>
            <button onClick={onClose} className="text-2xl text-light-text/50 hover:text-light-text dark:text-dark-text/50 dark:hover:text-dark-text transition-colors">&times;</button>
        </div>

        {isGuest ? (
            <div className="text-center py-4">
                <p className="text-lg mb-4">You are in <strong>Guest Mode</strong>.</p>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">Guest limits are very restrictive. Sign in with Google to unlock standard daily allowances.</p>
            </div>
        ) : (
            <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-light-text/50 dark:text-dark-text/50 mb-4">Daily Resources (Resets Midnight)</p>
                
                {user.isPro ? (
                    <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30 text-center mb-4">
                        <p className="font-bold text-yellow-600 dark:text-yellow-400">PRO MODE ACTIVE 👑</p>
                        <p className="text-xs opacity-80">Unlimited Access Unlocked</p>
                    </div>
                ) : (
                    <>
                        <UsageBar 
                            label="Premium Credits (Search/Plan)" 
                            current={user.dailyUsage.premiumCount || 0} 
                            max={DAILY_PREMIUM_LIMIT}
                            colorClass="bg-gradient-to-r from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent"
                        />
                        
                        <UsageBar 
                            label="Standard Actions (Chat/ID)" 
                            current={user.dailyUsage.briefingCount} 
                            max={DAILY_STANDARD_LIMIT}
                            colorClass="bg-blue-500"
                        />
                    </>
                )}

                <div className="h-px bg-black/10 dark:bg-white/10 my-4"></div>
                
                <p className="text-xs font-bold uppercase tracking-wider text-light-text/50 dark:text-dark-text/50 mb-4">Weekly Limits</p>
                
                <UsageBar 
                    label="Map Uploads" 
                    current={user.weeklyContributionCount || 0} 
                    max={user.isPro ? 999 : WEEKLY_CONTRIBUTION_LIMIT}
                    colorClass="bg-green-500"
                />
            </div>
        )}

        {!user.isPro && !isGuest && (
            <button 
                onClick={handleUpgrade}
                disabled={isLoadingPayment}
                className="block w-full bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-bold text-lg py-3 rounded-xl text-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
            >
                {isLoadingPayment ? 'Connecting...' : 'Upgrade to Pro ($4.99/mo) 👑'}
            </button>
        )}
        
        {/* Promo Code Section */}
        <div className="mt-4 text-center">
            {!showPromo ? (
                <button 
                    onClick={() => setShowPromo(true)}
                    className="text-xs font-bold text-light-accent dark:text-dark-accent hover:underline"
                >
                    Have a promo code?
                </button>
            ) : (
                <div className="mt-2 animate-fade-in">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter Code"
                            className="flex-1 p-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"
                        />
                        <button 
                            onClick={handleRedeem}
                            className="bg-light-accent dark:bg-dark-accent text-white px-3 py-2 rounded-lg text-sm font-bold hover:opacity-90"
                        >
                            Redeem
                        </button>
                    </div>
                    {promoMessage && (
                        <p className={`text-xs mt-2 font-bold ${promoMessage.includes('Success') ? 'text-green-500' : 'text-red-500'}`}>
                            {promoMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
        
        <p className="text-xs text-center mt-4 text-light-text/60 dark:text-dark-text/60">
            Support keeps Steve online. 25% goes to ocean conservation.
        </p>
      </div>
    </div>
  );
};
