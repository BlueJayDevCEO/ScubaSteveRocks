
import React from 'react';

interface FeatureBlocksProps {
    setActiveView: (view: any) => void;
    onOpenChat: () => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; isComingSoon?: boolean; colorClass?: string }> = ({ title, description, icon, onClick, isComingSoon, colorClass = "from-light-primary-start/20 to-light-secondary/20 text-light-accent dark:text-dark-accent" }) => (
    <div 
        onClick={onClick} 
        className={`relative glass-panel p-6 rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group ${isComingSoon ? 'opacity-60 hover:opacity-80' : ''}`}
    >
        {isComingSoon && (
            <div className="absolute top-2 right-2 bg-light-accent dark:bg-dark-accent text-white text-xs font-bold px-2 py-1 rounded-full uppercase z-10 shadow-md">Soon</div>
        )}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-inner group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
            {icon}
        </div>
        <h3 className="font-heading font-bold text-2xl mb-2 group-hover:text-gradient-primary transition-colors">{title}</h3>
        <p className="text-light-text/80 dark:text-dark-text/80 flex-grow text-sm font-medium">{description}</p>
    </div>
);


export const FeatureBlocks: React.FC<FeatureBlocksProps> = ({ setActiveView, onOpenChat }) => {
    
    const handleFeatureClick = (view: any) => {
        setActiveView(view);
        // Using a slight delay to ensure the view has started to render before scrolling
        setTimeout(() => {
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <FeatureCard 
                title="Instant Marine ID"
                description="Upload a photo or video to identify any marine species in seconds."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                onClick={() => handleFeatureClick('id')}
                colorClass="from-blue-400/30 to-cyan-400/30 text-blue-600 dark:text-blue-300"
            />
            <FeatureCard 
                title="Vivid Color Correction"
                description="Restore the true colors of your underwater photos with a single click."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5zM7 7l5 5 5-5M7 13l5 5 5-5" /></svg>}
                onClick={() => handleFeatureClick('color')}
                colorClass="from-pink-500/30 to-rose-500/30 text-pink-600 dark:text-pink-300"
            />
             <FeatureCard 
                title="Expert Dive Chat"
                description="Ask Scuba Steve anything, from gear advice to dive theory."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                onClick={onOpenChat}
                colorClass="from-violet-500/30 to-purple-500/30 text-violet-600 dark:text-violet-300"
            />
            <FeatureCard 
                title="AI Trip Planner"
                description="Generate a personalized, day-by-day dive trip itinerary for any destination."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>}
                onClick={() => handleFeatureClick('trip_planner')}
                colorClass="from-emerald-400/30 to-teal-500/30 text-emerald-600 dark:text-emerald-300"
            />
            <FeatureCard 
                title="Dive Site Briefings"
                description="Get live conditions, marine life reports, and safety tips for any dive site."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                onClick={() => handleFeatureClick('dive_site')}
                colorClass="from-sky-400/30 to-blue-500/30 text-sky-600 dark:text-sky-300"
            />
            <FeatureCard 
                title="Community Sighting Map"
                description="Explore a global map of recent marine life sightings logged by divers."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>}
                onClick={() => handleFeatureClick('sighting_map')}
                colorClass="from-indigo-400/30 to-blue-500/30 text-indigo-600 dark:text-indigo-300"
            />
             <FeatureCard 
                title="Import Dive Log"
                description="Upload log files from your dive computer (e.g., CSV) to sync your history."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                onClick={() => handleFeatureClick('dive_log_importer')}
                colorClass="from-slate-400/30 to-gray-500/30 text-slate-600 dark:text-slate-300"
            />
            <FeatureCard 
                title="Buddy Finder"
                description="Find and connect with divers in your area for your next adventure."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                onClick={() => alert("Coming soon!")}
                isComingSoon={true}
                colorClass="from-orange-400/30 to-red-500/30 text-orange-600 dark:text-orange-300"
            />
        </section>
    );
};
