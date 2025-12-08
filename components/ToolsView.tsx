
import React from 'react';

type View = 'home' | 'identify' | 'chat' | 'logbook' | 'map' | 'partner_portal' | 'tools';
type ChatViewTab = 'ask' | 'plan' | 'local_conditions' | 'dive_diet' | 'calculators' | 'voice' | 'blog' | 'scuba_news';
type LogbookTab = 'dives' | 'activity' | 'import';

interface ToolsViewProps {
    setActiveView: (view: View) => void;
    setInitialChatTab: (tab: ChatViewTab) => void;
    setInitialLogbookTab: (tab: LogbookTab) => void;
}

const tools = [
  {
    title: 'Dive Computers',
    description: 'A full suite of professional dive calculators.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0v6m0-6L9 13" /></svg>,
    action: (props: ToolsViewProps) => {
      props.setInitialChatTab('calculators');
      props.setActiveView('chat');
    }
  },
  {
    title: 'Sighting Map',
    description: 'Explore a global map of recent marine life sightings.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>,
    action: (props: ToolsViewProps) => {
      props.setActiveView('map');
    }
  },
  {
    title: 'Dive Diet',
    description: 'Get boat-friendly recipes for your surface intervals.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM15 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM1.088 6.088a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L1.088 7.502a1 1 0 010-1.414zM15.5 6.088a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 10a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>,
    action: (props: ToolsViewProps) => {
      props.setInitialChatTab('dive_diet');
      props.setActiveView('chat');
    }
  },
  {
    title: 'Import Dives',
    description: 'Upload CSV files from your dive computer to sync your log.',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    action: (props: ToolsViewProps) => {
      props.setInitialLogbookTab('import');
      props.setActiveView('logbook');
    }
  },
];

const ToolCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-soft dark:shadow-soft-dark border border-black/5 dark:border-white/5 cursor-pointer hover:-translate-y-1 transition-transform"
    >
        <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-light-bg dark:bg-dark-bg rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent">
                {icon}
            </div>
            <div>
                <h3 className="font-heading font-bold text-2xl">{title}</h3>
                <p className="text-light-text/70 dark:text-dark-text/70">{description}</p>
            </div>
        </div>
    </div>
);


export const ToolsView: React.FC<ToolsViewProps> = (props) => {
    return (
        <section className="w-full animate-fade-in">
             <h2 className="font-heading font-bold text-3xl text-center mb-6">
                Tools & Utilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map(tool => (
                    <ToolCard 
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        onClick={() => tool.action(props)}
                    />
                ))}
            </div>
        </section>
    );
};
