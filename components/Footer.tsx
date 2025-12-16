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
        <footer className="w-full mt-16 pb-28 sm:pb-12">
            <div className="w-full max-w-5xl mx-auto border-t border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-light-text/70 dark:text-dark-text/70">
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center">
  <a
    href="#startup"
    className="font-bold underline text-black dark:text-white"
  >
    Startup / About
  </a>

  <button onClick={onOpenTerms} className="hover:underline">Terms of Use</button>
  <button onClick={onOpenPrivacy} className="hover:underline">Privacy Policy</button>
  <a href="mailto:steve@scubasteve.rocks" className="hover:underline">Contact</a>
</div>

            </div>
            <div className="mt-6 max-w-3xl mx-auto text-center space-y-2">
                <p className="text-xs italic text-light-text/60 dark:text-dark-text/60">
                    Disclaimer: Scuba Steve AI™ is an AI-based educational assistant for informational purposes. Identifications may not always be 100% accurate. Always verify with local marine-life experts and prioritize dive safety.
                </p>
            </div>
        </footer>
    );
};
