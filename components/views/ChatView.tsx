
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

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap border-b-2 ${
            active 
            ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent bg-light-accent/5 dark:bg-dark-accent/5' 
            : 'border-transparent text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text hover:bg-black/5 dark:hover:bg-white/5'
        }`}
    >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
    </button>
);

const ChatView: React.FC<ChatViewProps> = (props) => {
    const { initialTab, onTabChange } = props;
    
    // Map unknown tabs to 'ask'
    const activeTab = ['ask', 'voice', 'local_conditions', 'dive_diet'].includes(initialTab) ? initialTab : 'ask';

    return (
        <div className="w-full animate-fade-in flex flex-col h-full">
             {/* Tab Navigation */}
             <div className="flex items-center justify-start sm:justify-center border-b border-black/10 dark:border-white/10 mb-6 overflow-x-auto scrollbar-hide">
                <TabButton 
                    active={activeTab === 'ask'} 
                    onClick={() => onTabChange('ask')} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} 
                    label="Text Chat" 
                />
                <TabButton 
                    active={activeTab === 'voice'} 
                    onClick={() => onTabChange('voice')} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>} 
                    label="Voice Mode" 
                />
                <TabButton 
                    active={activeTab === 'local_conditions'} 
                    onClick={() => onTabChange('local_conditions')} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
                    label="Local Conditions" 
                />
                <TabButton 
                    active={activeTab === 'dive_diet'} 
                    onClick={() => onTabChange('dive_diet')} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                    label="Dive Diet" 
                />
            </div>

            {/* Tab Content */}
            <div className="flex-grow">
                {activeTab === 'ask' && (
                    <Chat 
                        initialContext={props.initialContext}
                        initialMessage={props.initialMessage}
                        onOpenLimitModal={props.onOpenLimitModal}
                    />
                )}

                {activeTab === 'voice' && (
                    <VoiceChatView 
                        isBriefingLimitReached={props.isVoiceLimitReached} 
                        onOpenLimitModal={props.onOpenLimitModal} 
                        currentBriefingResult={null} // Voice view handles its own history if needed or starts fresh
                    />
                )}

                {activeTab === 'local_conditions' && (
                    <DiveSiteLookup 
                        startBriefing={props.handleDiveSiteLookup} 
                        currentBriefingResult={props.currentBriefingResult} 
                        isLoading={props.isLoading} 
                        error={props.error} 
                        isBriefingLimitReached={props.isBriefingLimitReached} 
                        hasSearched={props.hasSearchedDiveSite} 
                        onCancel={props.onCancel} 
                    />
                )}

                {activeTab === 'dive_diet' && (
                    <SurfaceIntervalView 
                        startBriefing={props.handleSurfaceIntervalRecipe} 
                        currentBriefingResult={props.currentBriefingResult} 
                        isLoading={props.isLoading} 
                        error={props.error} 
                        isBriefingLimitReached={props.isBriefingLimitReached} 
                        onOpenChat={() => props.onOpenChat(null, null)} 
                        onCancel={props.onCancel} 
                    />
                )}
            </div>
        </div>
    );
};

export default ChatView;
