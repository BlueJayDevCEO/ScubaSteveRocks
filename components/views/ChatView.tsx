import React from 'react';
import { Briefing } from '../../types';
import { Chat } from '../Chat';
import { VoiceChatView } from '../VoiceChatView';
import DiveSiteLookup from '../DiveSiteLookup';
import { SurfaceIntervalView } from '../SurfaceIntervalView';
import { ChatViewTab } from '../../App';

interface ChatViewProps {
  initialTab: ChatViewTab;
  onTabChange: (tab: ChatViewTab) => void;

  // Chat Props
  initialContext: Briefing | null;
  initialMessage: string | null;
  onOpenLimitModal: () => void;

  // Shared State
  isLoading: boolean;
  error: string | null;
  isBriefingLimitReached: boolean;
  isVoiceLimitReached: boolean;

  // Feature Handlers
  handleDiveSiteLookup: (siteName: string) => void;
  handleSurfaceIntervalRecipe: (prompt: string, file: File | null) => void;

  // Feature Specific State
  currentBriefingResult: Briefing | null;
  hasSearchedDiveSite: boolean;

  // Nav
  onOpenChat: (context?: Briefing | null, message?: string | null) => void;
  onCancel?: () => void;
}

const IconChat = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const IconMic = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const IconPin = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconFood = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TabPill: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    type="button"
    className={[
      'px-4 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all',
      'border flex items-center gap-2',
      active
        ? 'bg-white/80 dark:bg-white/15 border-white/20 text-light-text dark:text-dark-text shadow-sm'
        : 'bg-transparent border-transparent text-light-text/70 dark:text-dark-text/70 hover:bg-white/10 hover:border-white/10',
    ].join(' ')}
    aria-current={active ? 'page' : undefined}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </button>
);

const ChatView: React.FC<ChatViewProps> = (props) => {
  const { initialTab, onTabChange } = props;

  // Map unknown tabs to 'ask'
  const activeTab: ChatViewTab =
    (['ask', 'voice', 'local_conditions', 'dive_diet'] as const).includes(initialTab as any)
      ? initialTab
      : 'ask';

  return (
    <div className="w-full animate-fade-in flex flex-col h-full">
      {/* Header + Tabs */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-light-text dark:text-dark-text tracking-tight">
              Chat with Scuba Steve
            </h1>
            <p className="mt-1 text-sm sm:text-base text-light-text/70 dark:text-dark-text/70">
              Ask questions, use voice mode, check local conditions, or get a surface interval meal plan.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <TabPill
              active={activeTab === 'ask'}
              onClick={() => onTabChange('ask')}
              icon={IconChat}
              label="Text Chat"
            />
            <TabPill
              active={activeTab === 'voice'}
              onClick={() => onTabChange('voice')}
              icon={IconMic}
              label="Voice Mode"
            />
            <TabPill
              active={activeTab === 'local_conditions'}
              onClick={() => onTabChange('local_conditions')}
              icon={IconPin}
              label="Local Conditions"
            />
            <TabPill
              active={activeTab === 'dive_diet'}
              onClick={() => onTabChange('dive_diet')}
              icon={IconFood}
              label="Dive Diet"
            />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-grow">
        {activeTab === 'ask' && (
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
            <Chat
              initialContext={props.initialContext}
              initialMessage={props.initialMessage}
              onOpenLimitModal={props.onOpenLimitModal}
            />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
            <VoiceChatView
              isBriefingLimitReached={props.isVoiceLimitReached}
              onOpenLimitModal={props.onOpenLimitModal}
              currentBriefingResult={null}
            />
          </div>
        )}

        {activeTab === 'local_conditions' && (
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
            <DiveSiteLookup
              startBriefing={props.handleDiveSiteLookup}
              currentBriefingResult={props.currentBriefingResult}
              isLoading={props.isLoading}
              error={props.error}
              isBriefingLimitReached={props.isBriefingLimitReached}
              hasSearched={props.hasSearchedDiveSite}
              onCancel={props.onCancel}
            />
          </div>
        )}

        {activeTab === 'dive_diet' && (
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
            <SurfaceIntervalView
              startBriefing={props.handleSurfaceIntervalRecipe}
              currentBriefingResult={props.currentBriefingResult}
              isLoading={props.isLoading}
              error={props.error}
              isBriefingLimitReached={props.isBriefingLimitReached}
              onOpenChat={() => props.onOpenChat(null, null)}
              onCancel={props.onCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
