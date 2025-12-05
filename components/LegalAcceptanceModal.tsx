
import React, { useState } from 'react';
import { TermsOfUseContent, PrivacyPolicyContent } from './legal/Content';

interface LegalAcceptanceModalProps {
  onAccept: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const LegalAcceptanceModal: React.FC<LegalAcceptanceModalProps> = ({ onAccept, onOpenTerms, onOpenPrivacy }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if scrolled to bottom (with small buffer)
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full border border-light-accent/20 dark:border-dark-accent/20 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-center text-light-text dark:text-dark-text">
            SCUBA STEVE AI™ USER AGREEMENT
          </h2>
          <p className="text-center text-sm text-red-500 font-bold mt-2 uppercase">
            Must be accepted before entering
          </p>
        </div>

        {/* Scrollable Content Summary */}
        <div 
            className="flex-grow overflow-y-auto p-6 space-y-6 bg-light-bg/50 dark:bg-dark-bg/50"
            onScroll={handleScroll}
        >
            <div className="space-y-4 text-base text-light-text/90 dark:text-dark-text/90">
                <ul className="list-disc list-outside ml-5 space-y-2">
                    <li><strong>Scuba Steve AI™ is an AI assistant</strong> for educational and entertainment purposes only.</li>
                    <li>It is <strong>not a dive computer</strong>, not a safety device, and not an emergency tool.</li>
                    <li>It <strong>must not be used</strong> to plan decompression dives, emergency responses, or medical decisions.</li>
                    <li><strong>Marine IDs are AI-generated</strong> and may not be accurate. Always verify with a professional.</li>
                    <li>By continuing, you confirm you are <strong>solely responsible</strong> for your dive decisions, safety, and equipment.</li>
                    <li>You agree to the privacy policy and understand your data will never be shared.</li>
                    <li>You acknowledge this app is <strong>independent</strong> and not affiliated with any certification agency (e.g., PADI, SSI, NAUI).</li>
                </ul>
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <div className="flex flex-col gap-2 text-sm">
                    <button onClick={onOpenTerms} className="text-left font-semibold text-light-accent dark:text-dark-accent hover:underline">
                        Read Full Terms of Service &rarr;
                    </button>
                    <button onClick={onOpenPrivacy} className="text-left font-semibold text-light-accent dark:text-dark-accent hover:underline">
                        Read Privacy Policy &rarr;
                    </button>
                </div>
            </div>
        </div>

        {/* Footer / Action */}
        <div className="p-6 border-t border-black/10 dark:border-white/10 flex-shrink-0 bg-light-card dark:bg-dark-card rounded-b-2xl">
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                    <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <div className="w-6 h-6 bg-light-bg dark:bg-dark-bg border-2 border-light-text/30 dark:border-dark-text/30 rounded peer-checked:bg-green-500 peer-checked:border-green-500 transition-all"></div>
                    <svg className="absolute w-4 h-4 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-sm font-semibold text-light-text dark:text-dark-text select-none group-hover:text-light-text/80 dark:group-hover:text-dark-text/80">
                    I Agree and Accept the risks and terms above.
                </span>
            </label>

            <button 
                onClick={onAccept}
                disabled={!isChecked}
                className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent text-white font-bold text-lg py-3 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
            >
                Enter Scuba Steve AI™
            </button>
        </div>
      </div>
    </div>
  );
};
