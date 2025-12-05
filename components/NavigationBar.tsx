
import React from 'react';
import { Briefing } from '../types';
import { useTranslation } from 'react-i18next';

type View = 'home' | 'identify' | 'tools' | 'logbook' | 'chat';

interface NavigationBarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onOpenChat: (context: Briefing | null, message: string | null) => void;
  isNavVisible: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeView, setActiveView, onOpenChat, isNavVisible }) => {
  const { t } = useTranslation();

  const navItems = {
    home: { label: t('nav.home', 'Home'), view: "home" as View, icon: "🏠" },
    identify: { label: t('nav.identify', 'Identify'), view: "identify" as View, icon: "🐠" },
    chat: { label: t('nav.chat', 'Chat'), view: "chat" as View, icon: "💬" },
    logbook: { label: t('nav.logbook', 'Logbook'), view: "logbook" as View, icon: "📒" },
    tools: { label: t('nav.tools', 'Tools'), view: "tools" as View, icon: "🧰" },
  };
  
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border-t border-black/10 dark:border-white/10 h-20 transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="max-w-md mx-auto h-full flex items-stretch justify-around gap-2 px-2">
        {Object.values(navItems).map((item) => (
          <button
            key={item.view}
            onClick={() => item.view === 'chat' ? onOpenChat(null, null) : setActiveView(item.view)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${activeView === item.view ? 'text-light-accent dark:text-dark-accent' : 'text-gray-500'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
