import { DemoVideo } from "./components/DemoVideo";
import React, { useState, useEffect, createContext } from 'react';
import StartupSection from './components/StartupSection';
import { User, Briefing, AppConfig } from './types';
import { listenForSubscription } from './services/stripeService';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { GlobalStyles } from './components/GlobalStyles';
import { GlobalLoader } from './components/GlobalLoader';
import { ProfileModal } from './components/ProfileModal';
import { ShopModal } from './components/ShopModal';
import { ConfirmationToast } from './components/ConfirmationToast';
import { CreditDetailsModal } from './components/CreditDetailsModal';
import { LimitReachedModal } from './components/LimitReachedModal';
import { ChatLimitReachedModal } from './components/ChatLimitReachedModal';
import { PreDiveCheckModal } from './components/PreDiveCheckModal';
import { SimulationInfoModal } from './components/SimulationInfoModal';
import { ProjectExportModal } from './components/ProjectExportModal';
import { LegalModal } from './components/LegalModal';
import { LegalAcceptanceModal } from './components/LegalAcceptanceModal';
import { TermsOfUseContent, PrivacyPolicyContent } from './components/legal/Content';
import { FloatingChatButton } from './components/FloatingChatButton';
import { FunFactBubbles } from './components/FunFactBubbles';
import { Footer } from './components/Footer';
import { OnboardingGuide } from './components/OnboardingGuide';
import { Hero } from './components/Hero';

// Views
import HomeView from './components/views/HomeView';
import IdentifyView from './components/views/IdentifyView';
import ChatView from './components/views/ChatView';
import LogbookView from './components/ContributionsLog'; 
import SightingMapView from './components/SightingMapView';
import PartnerPortalView from './components/PartnerPortalView';
import ToolsHubView from './components/ToolsHubView';
import { DiveTrainingGameView } from './components/DiveTrainingGameView';
import BlogView from './components/BlogView';
import ScubaNewsView from './components/ScubaNewsView';
import DiveTripPlannerView from './components/DiveTripPlannerView';
import TopicsView from './components/TopicsView';
import DiveSiteLookup from './components/DiveSiteLookup';
import SurfaceIntervalView from './components/SurfaceIntervalView';
import { VoiceChatView } from './components/VoiceChatView';

// Services
import { getUserBriefings, saveBriefing, updateBriefing, saveBriefings } from './services/jobService';
import { processMarineIdBriefing } from './services/backendService';
import { getDiveSiteBriefing, getDiveTripPlan, getSurfaceIntervalRecipe, getScubaNews, searchSpecies, CorrectionStyle, correctColor } from './services/geminiService';
import { fetchAppConfig } from './services/configService';
import { 
    updateUser, 
    canUserPerformBriefing, 
    incrementUserBriefingCount, 
    registerUser,
    canUserContributeToMap,
    incrementContributionCount
} from './services/userService';
import { saveMarineSighting } from './services/marineSightings';
import { signOut } from './services/firebase/auth';

export type IdentifyViewTab = 'upload' | 'search' | 'gallery' | 'color';
export type ChatViewTab = 'ask' | 'voice' | 'local_conditions' | 'dive_diet' | 'calculators' | 'scuba_news' | 'blog' | 'plan';
// Updated Logbook Tabs: Dives (Real logs), Activity (AI Usage), Import (Tools)
export type LogbookTab = 'dives' | 'activity' | 'import';
type View = 'home' | 'identify' | 'chat' | 'logbook' | 'map' | 'partner_portal' | 'tools' | 'trip_planner' | 'dive_site_lookup' | 'surface_interval' | 'voice_chat' | 'blog' | 'scuba_news' | 'topics' | 'game';

export const BACKGROUNDS = [
    { id: 'default', name: 'Sunlight Zone', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop' },
    { id: 'coral', name: 'Coral Garden', url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?q=80&w=2070&auto=format&fit=crop' },
    { id: 'deep', name: 'The Abyss', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop' },
    { id: 'wreck', name: 'Shipwreck', url: 'https://images.unsplash.com/photo-1599009569720-3363372ae077?q=80&w=2070&auto=format&fit=crop' },
    { id: 'jelly', name: 'Moon Jellies', url: 'https://images.unsplash.com/photo-1495571673623-26c79db223e7?q=80&w=2000&auto=format&fit=crop' },
];

export interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  backgroundId: string;
  setBackgroundId: (id: string) => void;
  briefings: Briefing[];
  setBriefings: React.Dispatch<React.SetStateAction<Briefing[]>>;
  config: AppConfig | null;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [backgroundId, setBackgroundId] = useState<string>('default');
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  
  const [activeView, setActiveView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Tab states for views
  const [identifyTab, setIdentifyTab] = useState<IdentifyViewTab>('upload');
  const [chatTab, setChatTab] = useState<ChatViewTab>('ask');
  const [logbookTab, setLogbookTab] = useState<LogbookTab>('dives'); // Default to Dives

  // Input states reused across views
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [prompt, setPrompt] = useState('');
  
  // Results
  const [currentBriefingResult, setCurrentBriefingResult] = useState<Briefing | null>(null);
  
  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showChatLimitModal, setShowChatLimitModal] = useState(false);
  const [showPreDiveCheck, setShowPreDiveCheck] = useState(false);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);
  const [showLegalAcceptance, setShowLegalAcceptance] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Scuba News
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  
  // Chat Context
  const [chatContext, setChatContext] = useState<Briefing | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);

  // Dive Site Lookup
  const [hasSearchedDiveSite, setHasSearchedDiveSite] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadUser = async () => {
        const storedUser = localStorage.getItem('scubaSteveCurrentUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                registerUser(parsedUser); // Ensure they are in list
                const userBriefings = await getUserBriefings(parsedUser.uid);
                setBriefings(userBriefings);
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        
        const storedTheme = localStorage.getItem('scubaSteveTheme');
        if (storedTheme) setTheme(storedTheme as any);

        const storedBg = localStorage.getItem('scubaSteveBg');
        if (storedBg && BACKGROUNDS.find(b => b.id === storedBg)) {
            setBackgroundId(storedBg);
        }

        const acceptedLegal = localStorage.getItem('scubaSteveLegalAccepted');
        if (!acceptedLegal) setShowLegalAcceptance(true);

        const appConfig = await fetchAppConfig();
        setConfig(appConfig);
    };
    loadUser();
  }, []);

  // Theme effect
  useEffect(() => {
      const root = window.document.documentElement;
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      localStorage.setItem('scubaSteveTheme', theme);
  }, [theme]);

  // Background Persistence
  useEffect(() => {
      localStorage.setItem('scubaSteveBg', backgroundId);
  }, [backgroundId]);

  // Subscription listener
  useEffect(() => {
      if (user && user.uid !== 'mock-demo-user' && !user.uid.startsWith('guest-')) {
          const unsubscribe = listenForSubscription(user.uid, (isPro) => {
              if (user.isPro !== isPro) {
                  const updatedUser = { ...user, isPro };
                  setUser(updatedUser);
                  localStorage.setItem('scubaSteveCurrentUser', JSON.stringify(updatedUser));
                  updateUser(updatedUser); // Update in service storage too
                  if (isPro) setToastMessage("Pro Membership Active! Thank you for your support. 👑");
              }
          });
          return () => unsubscribe();
      }
  }, [user?.uid]);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      localStorage.setItem('scubaSteveCurrentUser', JSON.stringify(loggedInUser));
      registerUser(loggedInUser);
      getUserBriefings(loggedInUser.uid).then(setBriefings);
      if (!localStorage.getItem('scubaStevePreDiveChecked')) {
          setShowPreDiveCheck(true);
          localStorage.setItem('scubaStevePreDiveChecked', 'true');
      }
  };

  const handleLogout = async () => {
      await signOut();
      setUser(null);
      localStorage.removeItem('scubaSteveCurrentUser');
      setBriefings([]);
      setActiveView('home');
  };

  const handleMarineId = async (files: File[] | null, promptVal: string, location: string, region: string) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'marine_id')) {
          setShowLimitModal(true);
          return;
      }
      
      setIsLoading(true);
      setError(null);
      
      const newBriefing: Briefing = {
          id: Date.now(),
          userId: user.uid,
          type: 'marine_id',
          status: 'pending',
          createdAt: Date.now(),
          input: {
              prompt: promptVal,
              originalFileNames: files?.map(f => f.name),
              imageUrls: [] 
          },
          location,
          region,
          contributionLogged: false
      };

      try {
          incrementUserBriefingCount(user.uid, 'marine_id');
          setUser(prev => prev ? ({...prev, dailyUsage: { ...prev.dailyUsage, briefingCount: (prev.dailyUsage.briefingCount || 0) + 1 }}) : null);

          if (files && files.length > 0) {
              const reader = new FileReader();
              reader.readAsDataURL(files[0]);
              reader.onload = async () => {
                  newBriefing.input.imageUrls = [reader.result as string];
                  const processed = await processMarineIdBriefing(user, newBriefing, files, promptVal);
                  saveBriefing(processed);
                  setBriefings(prev => [processed, ...prev]);
                  setCurrentBriefingResult(processed);
                  setIsLoading(false);
              }
          } else {
               const processed = await processMarineIdBriefing(user, newBriefing, null, promptVal);
               saveBriefing(processed);
               setBriefings(prev => [processed, ...prev]);
               setCurrentBriefingResult(processed);
               setIsLoading(false);
          }
      } catch (err: any) {
          console.error(err);
          setError("Identification failed. Please try again.");
          setIsLoading(false);
      }
  };

  const handleColorCorrect = async (files: File[], style: CorrectionStyle) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'color_correct')) {
          setShowLimitModal(true);
          return;
      }
      setIsLoading(true);
      try {
          const file = files[0];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
              const base64 = reader.result as string;
              // Call Gemni service
              // Assuming correctColor requires a Part, we need to create it
              const part = { inlineData: { mimeType: file.type, data: base64.split(',')[1] } };
              const result = await correctColor(part, style);
              
              const briefing: Briefing = {
                  id: Date.now(),
                  userId: user.uid,
                  type: 'color_correct',
                  status: 'completed',
                  createdAt: Date.now(),
                  input: { imageUrls: [base64], originalFileNames: [file.name] },
                  output: { correctedImageUrl: `data:${result.mimeType};base64,${result.data}` }
              };
              saveBriefing(briefing);
              setBriefings(prev => [briefing, ...prev]);
              setCurrentBriefingResult(briefing);
              incrementUserBriefingCount(user.uid, 'color_correct');
              setIsLoading(false);
          };
      } catch(e) { 
          setError("Color correction failed.");
          setIsLoading(false); 
      }
  };

  const handleSpeciesSearch = async (query: string) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'species_search')) {
          setShowLimitModal(true);
          return;
      }
      setIsLoading(true);
      try {
          const result = await searchSpecies(query);
          const briefing: Briefing = {
              id: Date.now(),
              userId: user.uid,
              type: 'species_search',
              status: 'completed',
              createdAt: Date.now(),
              input: { prompt: query },
              output: { suggestion: { ...result, greeting: "Here is what I found:", confidence: 100, footer: "Search Result" } as any }
          };
          saveBriefing(briefing);
          setBriefings(prev => [briefing, ...prev]);
          setCurrentBriefingResult(briefing);
          incrementUserBriefingCount(user.uid, 'species_search');
      } catch (e) { setError("Search failed"); }
      setIsLoading(false);
  };

  const handleDiveSiteLookup = async (siteName: string) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'dive_site')) {
          setShowLimitModal(true);
          return;
      }
      setIsLoading(true);
      setHasSearchedDiveSite(true);
      try {
          const result = await getDiveSiteBriefing(siteName);
          const briefing: Briefing = {
              id: Date.now(),
              userId: user.uid,
              type: 'dive_site',
              status: 'completed',
              createdAt: Date.now(),
              input: { prompt: siteName },
              output: { briefing: result }
          };
          saveBriefing(briefing);
          setBriefings(prev => [briefing, ...prev]);
          setCurrentBriefingResult(briefing);
          incrementUserBriefingCount(user.uid, 'dive_site');
      } catch (e) { setError("Failed to get briefing."); }
      setIsLoading(false);
  };

  const handleSurfaceIntervalRecipe = async (ingredients: string, file: File | null) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'surface_interval')) {
          setShowLimitModal(true);
          return;
      }
      setIsLoading(true);
      try {
          let part = null;
          if (file) {
              const reader = new FileReader();
              await new Promise(resolve => {
                  reader.onload = resolve;
                  reader.readAsDataURL(file);
              });
              part = { inlineData: { mimeType: file.type, data: (reader.result as string).split(',')[1] } };
          }
          const recipe = await getSurfaceIntervalRecipe(ingredients, part);
          const briefing: Briefing = {
              id: Date.now(),
              userId: user.uid,
              type: 'surface_interval',
              status: 'completed',
              createdAt: Date.now(),
              input: { prompt: ingredients },
              output: { recipe }
          };
          saveBriefing(briefing);
          setBriefings(prev => [briefing, ...prev]);
          setCurrentBriefingResult(briefing);
          incrementUserBriefingCount(user.uid, 'surface_interval');
      } catch (e) { setError("Failed to generate recipe."); }
      setIsLoading(false);
  };

  const handleTripPlan = async (destination: string, duration: number, certification: string, interests: string) => {
      if (!user) return;
      if (!canUserPerformBriefing(user.uid, 'trip_planner')) {
          setShowLimitModal(true);
          return;
      }
      setIsLoading(true);
      try {
          const plan = await getDiveTripPlan(destination, duration, certification, interests);
          const briefing: Briefing = {
              id: Date.now(),
              userId: user.uid,
              type: 'trip_planner',
              status: 'completed',
              createdAt: Date.now(),
              input: { prompt: destination },
              output: { tripPlan: plan }
          };
          saveBriefing(briefing);
          setBriefings(prev => [briefing, ...prev]);
          setCurrentBriefingResult(briefing);
          incrementUserBriefingCount(user.uid, 'trip_planner');
      } catch (e) { setError("Failed to plan trip."); }
      setIsLoading(false);
  };

  const handleLogActivity = (type: Briefing['type'], outputData: any, prompt: string) => {
      if (!user) return;
      const briefing: Briefing = {
          id: Date.now(),
          userId: user.uid,
          type,
          status: 'completed',
          createdAt: Date.now(),
          input: { prompt },
          output: outputData
      };
      saveBriefing(briefing);
      setBriefings(prev => [briefing, ...prev]);
  };

  const handleOpenChat = (context?: Briefing | null, message?: string | null) => {
      setChatContext(context || null);
      setChatInitialMessage(message || null);
      setActiveView('chat');
      setChatTab('ask');
  };

  const handleUpdateBriefingDetails = (briefingId: number, details: Partial<Briefing>) => {
      const updated = { id: briefingId, ...details } as Briefing;
      updateBriefing(updated);
      setBriefings(prev => prev.map(b => b.id === briefingId ? { ...b, ...details } : b));
      if (currentBriefingResult?.id === briefingId) {
          setCurrentBriefingResult(prev => prev ? { ...prev, ...details } : null);
      }
  };

  const handleCorrection = (briefingId: number, correctedName: string) => {
      const details = { correction: { final_species: correctedName }, contributionLogged: true };
      handleUpdateBriefingDetails(briefingId, details);
  };

  const handleConfirmIdentification = async (briefingId: number) => {
      // Find briefing
      const briefing = briefings.find(b => b.id === briefingId);
      if (!briefing || !user) return;

      // 1. Check Limits (Cost Control)
      if (!canUserContributeToMap(user.uid)) {
          setToastMessage("Weekly Map Upload Limit Reached. Saved to Logbook only. 🔒");
          // Mark as logged locally so prompt goes away
          handleUpdateBriefingDetails(briefingId, { contributionLogged: true });
          return;
      }

      // 2. Prepare Data
      const species = briefing.correction?.final_species || briefing.output?.suggestion?.species_name || "Unknown Species";
      const confidence = briefing.output?.suggestion?.confidence || 100;
      // Use the greeting as the description - typically "G'day, I found a [Species]!"
      const description = briefing.output?.suggestion?.greeting || `A ${species} spotted by ${user.displayName}.`;
      const region = briefing.region || "Global";
      const location = briefing.location || "Unknown Location";
      const image = briefing.input?.imageUrls?.[0];

      // 3. Save to Cloud
      // Show loading state via Toast
      setToastMessage("Pinning to Global Map... 🌍");

      const result = await saveMarineSighting({
          userId: user.uid,
          dataUrl: image,
          commonName: species,
          species: species,
          confidence: confidence,
          locationName: location,
          region: region,
          description: description
      });

      // 4. Handle Result
      if (result.success) {
          incrementContributionCount(user.uid);
          setToastMessage("Success! Sighting pinned to the World Map. 📍");
      } else if (result.mode === 'local') {
          setToastMessage("Guest Mode: Saved to personal Logbook only.");
      } else {
          setToastMessage("Upload failed. Saved to local Logbook.");
      }

      // 5. Update Local State
      handleUpdateBriefingDetails(briefingId, { contributionLogged: true });
  };

  // Get current background URL
  const currentBgUrl = BACKGROUNDS.find(b => b.id === backgroundId)?.url || BACKGROUNDS[0].url;

  if (!user) {
  return (
    <>
      <GlobalStyles />
      <GlobalLoader isLoading={isLoading} config={config || undefined} />

      <div className="min-h-screen text-light-text dark:text-dark-text font-sans transition-colors duration-300 flex flex-col relative overflow-x-hidden">
        <Hero />

        {/* Login block (keeps app usable) */}
        <div className="w-full max-w-md mx-auto px-4 py-8">
          <LoginPage onLoginSuccess={handleLogin} config={config || undefined} />
        </div>

        {/* Google eligibility content */}
        <StartupSection />

        <Footer
          onOpenTerms={() => setShowLegal('terms')}
          onOpenPrivacy={() => setShowLegal('privacy')}
        />
      </div>

      {showLegalAcceptance && (
        <LegalAcceptanceModal
          onAccept={() => {
            setShowLegalAcceptance(false);
            localStorage.setItem('scubaSteveLegalAccepted', 'true');
          }}
          onOpenTerms={() => setShowLegal('terms')}
          onOpenPrivacy={() => setShowLegal('privacy')}
        />
      )}

      {showLegal === 'terms' && (
        <LegalModal title="Terms of Use" onClose={() => setShowLegal(null)}>
          <TermsOfUseContent />
        </LegalModal>
      )}

      {showLegal === 'privacy' && (
        <LegalModal title="Privacy Policy" onClose={() => setShowLegal(null)}>
          <PrivacyPolicyContent />
        </LegalModal>
      )}
    </>
  );
}

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme, backgroundId, setBackgroundId, briefings, setBriefings, config }}>
      <GlobalStyles />
      <div className="min-h-screen text-light-text dark:text-dark-text font-sans transition-colors duration-300 flex flex-col relative overflow-x-hidden">
        {/* Dynamic Background Image */}
        <div 
            className="living-ocean-bg fixed inset-0 z-0" 
            style={{ backgroundImage: `url('${currentBgUrl}')` }}
        />
        
        <FunFactBubbles />
        <GlobalLoader isLoading={isLoading} config={config || undefined} />
        
        <Header 
            onLogout={handleLogout} 
            onOpenProfile={() => setShowProfile(true)}
            onGoHome={() => setActiveView('home')}
            remainingBriefings={10} // Placeholder or calculate
            onOpenGameInfo={() => setShowGameInfo(true)}
            onOpenCredits={() => setShowCreditDetails(true)}
        />

        {activeView === 'home' && <Hero />}

        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 mb-20">
            {activeView === 'home' && (
                <HomeView 
                    setActiveView={setActiveView} 
                    setInitialIdentifyTab={setIdentifyTab}
                    onOpenChat={handleOpenChat}
                    onOpenShop={() => setShowShop(true)}
                />
            )}
            {activeView === 'identify' && (
                <IdentifyView 
                    initialTab={identifyTab}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleMarineId={handleMarineId}
                    handleColorCorrect={handleColorCorrect}
                    handleSpeciesSearch={handleSpeciesSearch}
                    handleStartNewIdentification={() => {
                        setCurrentBriefingResult(null);
                        setSelectedFiles(null);
                        setPrompt('');
                    }}
                    isLoading={isLoading}
                    error={error}
                    isCorrecting={false}
                    currentBriefingResult={currentBriefingResult}
                    setCurrentBriefingResult={setCurrentBriefingResult}
                    handleCorrection={handleCorrection}
                    handleConfirmIdentification={handleConfirmIdentification}
                    handleUpdateBriefingDetails={handleUpdateBriefingDetails}
                    handleOpenChat={handleOpenChat}
                    onOpenLimitModal={() => setShowLimitModal(true)}
                    isBriefingLimitReached={!canUserPerformBriefing(user.uid, 'marine_id')}
                    handleSelectBriefingFromHistory={(b) => setCurrentBriefingResult(b)}
                    onCancel={() => setIsLoading(false)}
                    onShowMap={() => setActiveView('map')}
                />
            )}
            {activeView === 'chat' && (
                <ChatView 
                    initialTab={chatTab}
                    onTabChange={setChatTab}
                    initialContext={chatContext}
                    initialMessage={chatInitialMessage}
                    onOpenLimitModal={() => setShowChatLimitModal(true)}
                    isLoading={isLoading}
                    error={error}
                    isBriefingLimitReached={false}
                    isVoiceLimitReached={!canUserPerformBriefing(user.uid, 'voice')}
                    handleDiveSiteLookup={handleDiveSiteLookup}
                    handleSurfaceIntervalRecipe={handleSurfaceIntervalRecipe}
                    currentBriefingResult={currentBriefingResult}
                    hasSearchedDiveSite={hasSearchedDiveSite}
                    onOpenChat={handleOpenChat}
                    onCancel={() => setIsLoading(false)}
                />
            )}
            {activeView === 'logbook' && (
                <LogbookView 
                    onSelectBriefing={(b) => { setCurrentBriefingResult(b); setActiveView('identify'); }}
                    onImportBriefings={(bs) => { saveBriefings(bs); setBriefings(prev => [...bs, ...prev]); }}
                    initialTab={logbookTab}
                />
            )}
            {activeView === 'map' && <SightingMapView />}
            {activeView === 'tools' && (
                <ToolsHubView 
                    setActiveView={setActiveView} 
                    setInitialChatTab={setChatTab} 
                    setInitialLogbookTab={setLogbookTab}
                    onViewPost={(slug) => {
                        // Assuming blog view can handle slug or just navigate
                        setActiveView('blog');
                    }}
                    onLogActivity={handleLogActivity}
                />
            )}
            {activeView === 'partner_portal' && <PartnerPortalView />}
            {activeView === 'game' && <DiveTrainingGameView onBack={() => setActiveView('home')} onLogActivity={handleLogActivity} />}
            {activeView === 'blog' && <BlogView />}
            {activeView === 'scuba_news' && <ScubaNewsView articles={newsArticles} isLoading={isLoading} error={error} />}
            {activeView === 'topics' && <TopicsView onStartTopicChat={handleOpenChat} />}
            {activeView === 'trip_planner' && (
                <DiveTripPlannerView 
                    startBriefing={handleTripPlan}
                    currentBriefingResult={currentBriefingResult}
                    isLoading={isLoading}
                    error={error}
                    isBriefingLimitReached={!canUserPerformBriefing(user.uid, 'trip_planner')}
                    onCancel={() => setIsLoading(false)}
                />
            )}
        </main>

        <NavigationBar activeView={activeView === 'map' || activeView === 'partner_portal' || activeView === 'game' || activeView === 'trip_planner' ? 'tools' : (activeView as any)} setActiveView={setActiveView as any} onOpenChat={handleOpenChat} isNavVisible={true} />
        <FloatingChatButton onOpenChat={() => handleOpenChat()} isNavVisible={true} />
        <Footer onOpenTerms={() => setShowLegal('terms')} onOpenPrivacy={() => setShowLegal('privacy')} />

        {/* Modals */}
        {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onSave={(name, photo, contrib) => {
            const updated = { ...user, displayName: name, photoURL: photo, contributesData: contrib };
            setUser(updated);
            updateUser(updated);
            setShowProfile(false);
        }} onShowTour={() => { setShowProfile(false); setShowTour(true); }} />}
        {showShop && <ShopModal onClose={() => setShowShop(false)} />}
        {showCreditDetails && <CreditDetailsModal user={user} onClose={() => setShowCreditDetails(false)} />}
        {showLimitModal && <LimitReachedModal onClose={() => setShowLimitModal(false)} />}
        {showChatLimitModal && <ChatLimitReachedModal onClose={() => setShowChatLimitModal(false)} />}
        {showPreDiveCheck && <PreDiveCheckModal onComplete={() => setShowPreDiveCheck(false)} />}
        {showGameInfo && <SimulationInfoModal onClose={() => setShowGameInfo(false)} />}
        {showExport && <ProjectExportModal onClose={() => setShowExport(false)} />}
        {toastMessage && <ConfirmationToast message={toastMessage} onClose={() => setToastMessage(null)} />}
        {showTour && <OnboardingGuide onComplete={() => setShowTour(false)} />}
        
        {showLegal === 'terms' && <LegalModal title="Terms of Use" onClose={() => setShowLegal(null)}><TermsOfUseContent /></LegalModal>}
        {showLegal === 'privacy' && <LegalModal title="Privacy Policy" onClose={() => setShowLegal(null)}><PrivacyPolicyContent /></LegalModal>}
      </div>
    </AppContext.Provider>
  );
};

export default App;
