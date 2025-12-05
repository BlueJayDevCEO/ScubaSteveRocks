
import React from 'react';

interface FloatingChatButtonProps {
  onOpenChat: () => void;
  isNavVisible: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onOpenChat, isNavVisible }) => {
  return (
    <button
      onClick={onOpenChat}
      className={`fixed ${isNavVisible ? 'bottom-24' : 'bottom-4'} right-4 sm:right-8 bg-gradient-to-br from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl z-30`}
    >
        <span className="text-3xl">💬</span>
    </button>
  );
};
