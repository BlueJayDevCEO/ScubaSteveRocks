
import React from 'react';
import { Briefing } from '../types';
import { SocialShareButtons } from './SocialShareButtons';
import { DonationBanner } from './DonationBanner';

interface BriefingResultContainerProps {
  briefing: Briefing;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footerText?: React.ReactNode;
}

export const BriefingResultContainer: React.FC<BriefingResultContainerProps> = ({ briefing, icon, title, children, actions, footerText }) => {
  return (
    <div className="w-full bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 flex flex-col gap-4 animate-fade-in self-start max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center text-light-accent dark:text-dark-accent">
            {icon}
          </div>
          <div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl">{title}</h3>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">
              Created on {new Date(briefing.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <SocialShareButtons briefing={briefing} />
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-4">
        {children}
      </main>
      
      {/* Actions & Footer */}
      <footer className="mt-auto pt-4 flex flex-col gap-4">
        {actions && (
          <div className="p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg flex flex-wrap gap-4 items-center">
            {actions}
          </div>
        )}
        <DonationBanner />
        {footerText && (
          <p className="text-sm text-center text-light-text/60 dark:text-dark-text/60 italic">{footerText}</p>
        )}
      </footer>
    </div>
  );
};
