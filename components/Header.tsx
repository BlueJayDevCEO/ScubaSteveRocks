import React, { useContext } from 'react';
import { ScubaSteveLogo, SCUBA_STEVE_AVATAR } from './ScubaSteveLogo';
import { AppContext } from '../App';
import { useTranslation } from 'react-i18next';
import i18n from '../services/i18n';

interface HeaderProps {
  onLogout: () => void;
  onOpenProfile: () => void;
  onGoHome: () => void;
  remainingBriefings: number;
  onOpenGameInfo: () => void;
  onOpenCredits: () => void;
}

// Helper to safely validate image URLs
const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('data:');
};

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  onOpenProfile,
  onGoHome,
  remainingBriefings,
  onOpenGameInfo,
  onOpenCredits,
}) => {
  const context = useContext(AppContext);
  const { t } = useTranslation();

  if (!context) return null;
  const { user, theme, setTheme, config } = context;

  const handleThemeToggle = () => {
    const newTheme =
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(newTheme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const userAvatar =
    user?.photoURL && isValidUrl(user.photoURL)
      ? user.photoURL
      : config?.avatarUrl && isValidUrl(config.avatarUrl)
      ? config.avatarUrl
      : SCUBA_STEVE_AVATAR;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Outer spacing keeps header from crushing hero */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3">
        <div className="glass-panel rounded-2xl shadow-xl border border-white/15 w-full flex items-center justify-between py-3 px-4 backdrop-blur-xl bg-white/70 dark:bg-black/65 transition-all duration-300">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              title={t('header.home', 'Go to Home')}
              className="flex items-center gap-3 group"
            >
              <ScubaSteveLogo
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-md border border-white/20 bg-white/10 backdrop-blur-sm group-hover:scale-105 transition-transform"
                src={config?.avatarUrl}
              />

              <h1 className="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-gradient-primary hidden sm:block tracking-tight drop-shadow">
                Scuba Steve AI™
              </h1>
            </button>
          </div>

          {/* RIGHT */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credits */}
              <button
                onClick={onOpenCredits}
                className="relative bg-black/5 dark:bg-white/10 backdrop-blur-md text-xs sm:text-sm font-bold pl-6 pr-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 shadow-sm text-light-text dark:text-dark-text transition-all hover:bg-black/10 dark:hover:bg-white/20 hover:scale-105 cursor-pointer"
                title={t('header.credits', 'View Credit Details')}
              >
                <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="hidden sm:inline opacity-70 mr-1">
                  {t('header.creditsLabel', 'Credits')}:
                </span>
                {remainingBriefings}
              </button>

              <button
                onClick={onOpenGameInfo}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={t('header.help', 'Simulation Game Manual')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <div className="hidden sm:block h-6 w-px bg-black/10 dark:bg-white/10" />

              {/* Language */}
              <select
                onChange={handleLanguageChange}
                value={i18n.language?.split('-')[0] || 'en'}
                className="bg-transparent text-sm font-semibold text-light-text dark:text-dark-text border-none focus:ring-0 cursor-pointer hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                aria-label="Language selector"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
              </select>

              {/* Theme */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={t('header.theme', 'Toggle theme')}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <div className="hidden sm:block h-6 w-px bg-black/10 dark:bg-white/10" />

              {/* Logout */}
              <button
                onClick={onLogout}
                title={t('header.logout', 'Log Out')}
                className="flex items-center gap-2 text-light-text/70 dark:text-dark-text/70 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-500/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden lg:inline text-sm font-semibold">
                  {t('header.logoutLabel', 'Log Out')}
                </span>
              </button>

              {/* Avatar */}
              <button
                onClick={onOpenProfile}
                title={t('header.profile', 'Edit Profile')}
                className="ml-1"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-br from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent shadow-md hover:scale-105 transition-transform">
                  <img
                    src={userAvatar}
                    alt={user?.displayName || 'User'}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white dark:border-gray-800"
                  />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
