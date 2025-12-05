
import React from 'react';

interface InfoModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, onClose, children }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl">{title}</h2>
            <button onClick={onClose} className="text-3xl text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors leading-none">&times;</button>
        </div>
        
        <div className="overflow-y-auto pr-4 text-light-text/90 dark:text-dark-text/90 prose dark:prose-invert max-w-none">
          {children}
        </div>

        <div className="mt-6 flex-shrink-0">
             <button 
                onClick={onClose} 
                className="w-full bg-light-text/10 dark:bg-dark-text/10 text-light-text dark:text-dark-text font-bold text-lg py-3 rounded-lg hover:bg-light-text/20 dark:hover:bg-dark-text/20 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};
