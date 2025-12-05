
import React from 'react';

interface ViewShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ViewShell: React.FC<ViewShellProps> = ({ title, onBack, children }) => {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-6 sm:p-8 w-full animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={onBack} 
                className="p-2 rounded-full bg-light-bg dark:bg-dark-bg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Back to tools"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl">{title}</h2>
        </div>
        <div>
            {children}
        </div>
    </div>
  );
};
