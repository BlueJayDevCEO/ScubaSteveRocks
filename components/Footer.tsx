import React, { useContext } from 'react';
import { AppContext } from '../App';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms, onOpenPrivacy }) => {
  const context = useContext(AppContext);
  const brandLogo = context?.config?.logoUrl;

  return (
    <footer className="w-full mt-20 pb-32 sm:pb-16">
      <div className="w-full max-w-5xl mx-auto border-t border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        
        {/* Brand */}
        <div className="flex items-center gap-3 text-light-text/80 dark:text-dark-text/80">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt="OSEA Diver"
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="text-2xl">🌊</span>
          )}
          <p className="font-semibold">
            OSEA Diver™ © {new Date().getFullYear()}
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center">
          <a
            href="#startup"
            className="
              font-semibold
              text-cyan-400
              hover:text-cyan-300
              transition-colors
              underline-offset-4
              hover:underline
            "
          >
            Startup / About
          </a>

          <button
            onClick={onOpenTerms}
            className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            Terms of Use
          </button>

          <button
            onClick={onOpenPrivacy}
            className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            Privacy Policy
          </button>

          <a
            href="mailto:steve@scubasteve.rocks"
            className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            Contact
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 max-w-3xl mx-auto text-center space-y-2 px-4">
        <p className="text-xs italic text-light-text/60 dark:text-dark-text/60">
          Disclaimer: Scuba Steve AI™ is an AI-based educational assistant for informational purposes.
          Identifications may not always be 100% accurate. Always verify with local marine-life experts
          and prioritize dive safety.
        </p>
      </div>
    </footer>
  );
};
