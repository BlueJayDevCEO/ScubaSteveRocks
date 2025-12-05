import React, { useEffect } from 'react';

interface ConfirmationToastProps {
  message: string;
  onClose: () => void;
}

export const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in w-max max-w-[90vw]">
      <div className="bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-md bg-opacity-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm sm:text-base">{message}</span>
      </div>
    </div>
  );
};