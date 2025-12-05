
import React, { useState } from 'react';
import { InfoModal } from './InfoModal';

interface CalculatorShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  infoContent?: React.ReactNode;
}

export const CalculatorShell: React.FC<CalculatorShellProps> = ({ title, onBack, children, infoContent }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-6 sm:p-8 w-full animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack} 
                    className="p-2 rounded-full bg-light-bg dark:bg-dark-bg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Back to calculators"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="font-heading font-bold text-2xl">{title}</h3>
            </div>
             {infoContent && (
                 <button 
                    onClick={() => setIsInfoOpen(true)}
                    className="p-2 rounded-full text-light-text/60 dark:text-dark-text/60 hover:bg-light-bg dark:hover:bg-dark-bg"
                    aria-label="Show information"
                    title="How this calculator works"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
        <div>
            {children}
        </div>
        
        {/* Mandatory Safety Disclaimer for Calculators */}
        <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10">
            <p className="text-xs text-center text-red-500 dark:text-red-400 font-bold uppercase tracking-wide">
                This calculator is for general reference only and must NOT be used as an official dive computer or planning device.
            </p>
        </div>

         {isInfoOpen && infoContent && (
            <InfoModal title={`About the ${title}`} onClose={() => setIsInfoOpen(false)}>
                {infoContent}
            </InfoModal>
        )}
    </div>
  );
};
