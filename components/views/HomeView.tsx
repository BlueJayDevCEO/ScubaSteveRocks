import React, { useContext, useState, useEffect } from 'react';
import { AppContext, IdentifyViewTab } from '../../App';
import { BriefingCard } from '../ContributionsLog';
import { AffiliateSection } from '../AffiliateSection';

interface HomeViewProps {
  setActiveView: (view: any) => void;
  setInitialIdentifyTab: (tab: IdentifyViewTab) => void;
  onOpenChat: (context?: any, message?: string) => void;
  onOpenShop: () => void;
}

/**
 * ✅ IMPORTANT:
 * These are the view keys HomeView will navigate to.
 * If ANY button "does nothing", it means the string here doesn't match your App.tsx view router keys.
 * Update ONLY these values (one place) and every button will work.
 */
const VIEW_KEYS = {
  home: 'home',
  chat: 'chat',
  identify: 'identify',
  logbook: 'logbook',
  game: 'game',

  tools: 'tools',
  tripPlanner: 'trip_planner',
  diveSiteLookup: 'dive_site_lookup',
  surfaceInterval: 'surface_interval',
  voiceChat: 'voice_chat',
  sightings: 'map',
  blog: 'blog',
  scubaNews: 'scuba_news',
  topics: 'topics',
  partnerPortal: 'partner_portal',
} as const;

const HomeView: React.FC<HomeViewProps> = ({
  setActiveView,
  setInitialIdentifyTab,
  onOpenChat,
  onOpenShop,
}) => {
  const context = useContext(AppContext);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('scubaSteveHasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('scubaSteveHasSeenWelcome', 'true');
    }
  }, []);

  if (!context) return null;
  const { briefings } = context;

  const stats = {
    species: briefings.filter((b: any) => b.type === 'marine_id' && (b.output?.suggestion || b.correction)).length,
    dives: briefings.filter((b: any) => b.type === 'imported_dive' || b.location).length,
    contributions: briefings.filter((b: any) => b.contributionLogged).length,
  };

  const recentBriefings = briefings.slice(0, 5);

  // --- Navigation helpers (keeps every CTA consistent) ---
  const go = (viewKey: string) => setActiveView(viewKey);

  const goChat = (message?: string) => {
    setActiveView(VIEW_KEYS.chat);
    onOpenChat(null, message);
  };

  const goIdentify = (tab: IdentifyViewTab = 'upload') => {
    setInitialIdentifyTab(tab);
    setActiveView(VIEW_KEYS.identify);
  };

  const QuickActionChip: React.FC<{
    label: string;
    icon: string;
    onClick: () => void;
  }> = ({ label, icon, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 dark:border-white/10 hover:scale-105 hover:bg-white dark:hover:bg-white/20 transition-all duration-300 text-sm font-semibold text-light-text dark:text-dark-text whitespace-nowrap group"
    >
      <span className="text-lg group-hover:-rotate-12 transition-transform duration-300">{icon}</span>
      {label}
    </button>
  );

  const FeatureCard: React.FC<{
    title: string;
    desc: string;
    actionLabel: string;
    onAction: () => void;
    icon: string;
  }> = ({ title, desc, actionLabel, onAction, icon }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-lg text-light-text dark:text-dark-text">{title}</h3>
          <p className="mt-2 text-sm text-light-text/70 dark:text-dark-text/70">{desc}</p>
          <button
            onClick={onAction}
            className="mt-4 inline-flex items-center gap-2 font-bold text-sm text-light-accent dark:text-dark-accent hover:underline"
          >
            {actionLabel} <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8 animate-fade-in">
      {/* Welcome Banner for New Users */}
      {showWelcome && (
        <div className="relative -mt-16 mb-6 mx-2 z-30 bg-gradient-to-r from-light-accent to-light-primary-end dark:from-dark-accent dark:to-dark-primary-end text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-white/20">
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-bounce">👋</div>
            <div>
              <h3 className="font-heading font-bold text-xl">Welcome to Scuba Steve!</h3>
              <p className="text-sm opacity-90">
                I’m your AI dive buddy. I can identify marine life, help plan dives, and keep your progress tidy.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Actions Label */}
      <div className={`px-2 ${showWelcome ? '' : '-mt-12'}`}>
        <p className="text-xs font-bold tracking-wider uppercase text-light-text/50 dark:text-dark-text/50 px-1">
          Quick actions
        </p>
      </div>

      {/* Quick Action Chips - Horizontal Scroll on Mobile */}
      <div className="relative z-20 px-2">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start sm:justify-center mask-image-linear-gradient">
          <QuickActionChip icon="🐠" label="Identify a Fish" onClick={() => goIdentify('upload')} />
          <QuickActionChip
            icon="📍"
            label="Check Cozumel Conditions"
            onClick={() => goChat('What are the current diving conditions in Cozumel?')}
          />
          <QuickActionChip
            icon="🎮"
            label="Play Scuba Sim"
            onClick={() => window.open('https://scuba-steve-ai-game-483432894986.us-west1.run.app', '_blank')}
          />
          <QuickActionChip icon="🧠" label="Quiz My Knowledge" onClick={() => go(VIEW_KEYS.game)} />
        </div>
      </div>

      {/* Main Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2 relative z-10">
        <button
          onClick={() => goIdentify('upload')}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-gradient-to-br hover:from-cyan-50/50 hover:to-transparent dark:hover:from-cyan-900/20 transition-all duration-300 group border-l-4 border-l-cyan-400 relative overflow-hidden"
        >
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h3 className="font-heading font-bold text-2xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              Identify Marine Life
            </h3>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70 mt-1">
              Upload a photo to get species info instantly.
            </p>
          </div>
        </button>

        <button
          onClick={() => goChat()}
          className="glass-panel p-6 rounded-2xl flex items-center gap-5 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-gradient-to-br hover:from-violet-50/50 hover:to-transparent dark:hover:from-violet-900/20 transition-all duration-300 group border-l-4 border-l-violet-400 relative overflow-hidden"
        >
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h3 className="font-heading font-bold text-2xl group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Chat with Steve
            </h3>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70 mt-1">Ask about safety, gear, or dive sites.</p>
          </div>
        </button>
      </div>

      {/* Landing Page Feature Grid */}
      <div className="px-2">
        <div className="text-center mb-6">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-light-text dark:text-dark-text">
            Everything you need to dive smarter
          </h2>
          <p className="mt-2 text-light-text/70 dark:text-dark-text/70">
            Real diver tools + AI help — in one place.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🐠"
            title="Marine Life ID"
            desc="Upload a photo and get an instant ID + fun facts."
            actionLabel="Identify now"
            onAction={() => goIdentify('upload')}
          />
          <FeatureCard
            icon="📸"
            title="Underwater Color Fix"
            desc="Bring back the reds and contrast — make your shots pop."
            actionLabel="Fix a photo"
            onAction={() => go(VIEW_KEYS.colorCorrection)}
          />
          <FeatureCard
            icon="🧮"
            title="Dive Tools & Calculators"
            desc="MOD, PPO2, SAC, gas planning, surface interval, tables, and more."
            actionLabel="Open tools"
            onAction={() => go(VIEW_KEYS.tools)}
          />
          <FeatureCard
            icon="🗺️"
            title="Dive Site Lookup"
            desc="Ask Steve about sites, conditions, and local tips."
            actionLabel="Explore sites"
            onAction={() => go(VIEW_KEYS.diveSiteLookup)}
          />
          <FeatureCard
            icon="🎮"
            title="Training & Quizzes"
            desc="Bite-size learning that actually sticks."
            actionLabel="Start a quiz"
            onAction={() => go(VIEW_KEYS.game)}
          />
          <FeatureCard
            icon="💬"
            title="AI Dive Buddy"
            desc="Gear advice, safety reminders, trip planning — instantly."
            actionLabel="Ask Steve"
            onAction={() => goChat()}
          />
        </div>
      </div>

      {/* How it works */}
      <div className="px-2">
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h3 className="font-heading font-bold text-2xl text-light-text dark:text-dark-text">How it works</h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl">1️⃣</div>
              <div className="mt-2 font-bold text-light-text dark:text-dark-text">Upload or ask</div>
              <div className="text-sm text-light-text/70 dark:text-dark-text/70">Photo ID or chat with Steve.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl">2️⃣</div>
              <div className="mt-2 font-bold text-light-text dark:text-dark-text">Get instant answers</div>
              <div className="text-sm text-light-text/70 dark:text-dark-text/70">Species + tips + dive tools.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl">3️⃣</div>
              <div className="mt-2 font-bold text-light-text dark:text-dark-text">Track progress</div>
              <div className="text-sm text-light-text/70 dark:text-dark-text/70">Your discoveries and dives in one place.</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => goChat()}
              className="px-6 py-3 rounded-2xl font-bold bg-light-accent text-white dark:bg-dark-accent hover:opacity-95 transition-opacity"
            >
              Try Scuba Steve Free
            </button>
            <button
              onClick={() => goIdentify('upload')}
              className="px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-white/10 transition-colors"
            >
              Upload a Photo
            </button>
            <button
              onClick={onOpenShop}
              className="px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-white/10 transition-colors"
            >
              Open Shop
            </button>
          </div>

          <div className="mt-3 text-xs text-light-text/60 dark:text-dark-text/60">
            No credit card • Built by real divers
          </div>
        </div>
      </div>

      {/* Recent Activity / Logbook Teaser */}
      {briefings.length > 0 ? (
        <div className="px-2">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h3 className="font-heading font-bold text-2xl text-light-text dark:text-dark-text">Recent Activity</h3>
              <p className="text-xs text-light-text/60 dark:text-dark-text/60">Your latest discoveries and logs</p>
            </div>
            <button
              onClick={() => go(VIEW_KEYS.logbook)}
              className="font-bold text-sm text-light-accent dark:text-dark-accent hover:underline bg-light-accent/10 dark:bg-dark-accent/10 px-3 py-1 rounded-lg transition-colors"
            >
              View Logbook &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentBriefings.map((b: any) => (
              <BriefingCard key={b.id} briefing={b} onSelectBriefing={() => go(VIEW_KEYS.logbook)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/20 mx-2 flex flex-col items-center justify-center gap-4">
          <div className="text-4xl opacity-50">📝</div>
          <div>
            <p className="text-light-text/60 dark:text-dark-text/60 mb-2 font-medium">No dives logged yet.</p>
            <p className="font-bold text-light-accent dark:text-dark-accent">
              Start by identifying a fish or planning a trip!
            </p>

            <button
              onClick={() => goIdentify('upload')}
              className="mt-4 px-5 py-2.5 rounded-2xl font-bold bg-light-accent text-white dark:bg-dark-accent hover:opacity-95 transition-opacity"
            >
              Identify your first animal →
            </button>
          </div>
        </div>
      )}

      {/* Stats Section - Compact */}
      <div className="px-2">
        <h3 className="font-heading font-bold text-lg mb-3 text-light-text/80 dark:text-dark-text/80 px-1">
          Your Progress
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-1 border border-cyan-500/20">
            <span className="text-3xl font-bold text-light-text dark:text-dark-text">{stats.species}</span>
            <span className="text-[10px] uppercase font-bold text-light-text/60 dark:text-dark-text/60 tracking-wider">
              Species
            </span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-1 border border-blue-500/20">
            <span className="text-3xl font-bold text-light-text dark:text-dark-text">{stats.dives}</span>
            <span className="text-[10px] uppercase font-bold text-light-text/60 dark:text-dark-text/60 tracking-wider">
              Dives
            </span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-1 border border-violet-500/20">
            <span className="text-3xl font-bold text-light-text dark:text-dark-text">{stats.contributions}</span>
            <span className="text-[10px] uppercase font-bold text-light-text/60 dark:text-dark-text/60 tracking-wider">
              Contribs
            </span>
          </div>
        </div>
      </div>

      {/* Other Features (existing section) */}
      <AffiliateSection onOpenShop={onOpenShop} onOpenChat={onOpenChat} setActiveView={setActiveView} />
    </div>
  );
};

export default HomeView;
 
