import React, { useState, useCallback, useEffect, useRef, createContext, lazy, Suspense } from 'react';
import { correctColor, getDiveSiteBriefing, getLiveDiveReport, fileToGenerativePart, getSpeciesInfo, getDiveTripPlan, getSurfaceIntervalRecipe, CorrectionStyle, getScubaNews, searchSpecies } from './services/geminiService';
import { Briefing, User, ScubaNewsArticle, IdentificationResult, AppConfig } from './types';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { signOut, checkRedirectResult } from './services/firebase/auth';
import { FunFactBubbles } from './components/FunFactBubbles';
import { ProfileModal } from './components/ProfileModal';
import { NavigationBar } from './components/NavigationBar';
import { registerUser, updateUser, getUser, canUserPerformBriefing, incrementUserBriefingCount, DAILY_STANDARD_LIMIT, DAILY_PREMIUM_LIMIT, GUEST_DAILY_LIMIT } from './services/userService';
import { processMarineIdBriefing } from './services/backendService';
import { saveBriefing, updateBriefing, getUserBriefings, getSharedBriefing, logSightingContribution, saveBriefings } from './services/jobService';
import { Footer } from './components/Footer';
import { incrementAndGetVisitorCount } from './services/visitorService';
import { LimitReachedModal } from './components/LimitReachedModal';
import { SharedBriefingView } from './components/SharedJobView';
import { LegalModal } from './components/LegalModal';
import { LegalAcceptanceModal } from './components/LegalAcceptanceModal';
import { TermsOfUseContent, PrivacyPolicyContent } from './components/legal/Content';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ScubaSteveLogo } from './components/ScubaSteveLogo';
import { ShopModal } from './components/ShopModal';
import { ConfirmationToast } from './components/ConfirmationToast';
import { GlobalLoader } from './components/GlobalLoader';
import { ImportedDiveDetailView } from './components/ImportedDiveDetailView';
import { VoiceChatView } from './components/VoiceChatView';
import { OnboardingGuide } from './components/OnboardingGuide';
import { Hero } from './components/Hero';
import { ViewShell } from './components/views/ViewShell';
import { blogPosts, BlogPost } from './data/blogData';
import { GlobalStyles } from './components/GlobalStyles';
import { SimulationInfoModal } from './components/SimulationInfoModal';
import { saveMarineSighting } from './services/marineSightings';
import { fetchAppConfig } from './services/configService';

type View = 'home' | 'identify' | 'chat' | 'logbook' | 'map' | 'partner_portal' | 'tools' | 'trip_planner' | 'dive_site_lookup' | 'surface_interval' | 'voice_chat' | 'blog' | 'scuba_news' | 'topics' | 'game';
export type IdentifyViewTab = 'upload' | 'gallery' | 'color' | 'search';
export type ChatViewTab = 'ask' | 'topics' | 'plan' | 'local_conditions' | 'dive_diet' | 'voice' | 'blog' | 'scuba_news';
export type LogbookTab = 'log' | 'import';
type Theme = 'light' | 'dark' | 'system';

// --- APP CONTEXT ---
interface AppContextType {
    user: User;
    briefings: Briefing[];
    theme: Theme;
    config: AppConfig;
    setTheme: (theme: Theme) => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setBriefings: React.Dispatch<React.SetStateAction<Briefing[]>>;
}
export const AppContext = createContext<AppContextType | null>(null);

// --- LAZY LOADED VIEWS ---
const HomeView = lazy(() => import('./components/views/HomeView'));
const IdentifyView = lazy(() => import('./components/views/IdentifyView'));
const ChatView = lazy(() => import('./components/views/ChatView'));
const LogbookView = lazy(() => import('./components/ContributionsLog'));
const SightingMapView = lazy(() => import('./components/SightingMapView'));
const PartnerPortalView = lazy(() => import('./components/PartnerPortalView'));
const ToolsHubView = lazy(() => import('./components/ToolsHubView'));
const DiveTripPlannerView = lazy(() => import('./components/DiveTripPlannerView'));
const DiveSiteLookup = lazy(() => import('./components/DiveSiteLookup'));
const SurfaceIntervalView = lazy(() => import('./components/SurfaceIntervalView'));
const TopicsView = lazy(() => import('./components/TopicsView'));
const BlogView = lazy(() => import('./components/BlogView'));
const ScubaNewsView = lazy(() => import('./components/ScubaNewsView'));
const DiveTrainingGameView = lazy(() => import('./components/DiveTrainingGameView').then(module => ({ default: module.DiveTrainingGameView })));

// Increment this version to force all users to re-accept terms
const LEGAL_VERSION = '5.0'; 

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCorrecting, setIsCorrecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>({});
  
  // Initialize view to 'home' by default to ensure the app always starts there on load/refresh.
  const [activeView, setActiveView] = useState<View>('home');

  const [initialIdentifyTab, setInitialIdentifyTab] = useState<IdentifyViewTab>('upload');
  const [initialChatTab, setInitialChatTab] = useState<ChatViewTab>('ask');
  const [initialLogbookTab, setInitialLogbookTab] = useState<LogbookTab>('log');
  
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [currentBriefingResult, setCurrentBriefingResult] = useState<Briefing | null>(null);
  
  const [chatContext, setChatContext] = useState<Briefing | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isGameInfoModalOpen, setIsGameInfoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: React.ReactNode; } | null>(null);
  
  // New state for Mandatory Acceptance
  const [showLegalAcceptance, setShowLegalAcceptance] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);

  const [visitorCount, setVisitorCount] = useState<number>(0);
  
  // DEFAULT TO DARK MODE (Night View) instead of System
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark'
  );

  const [sharedBriefing, setSharedBriefing] = useState<Briefing | null>(null);
  const [isCheckingShare, setIsCheckingShare] = useState<boolean>(true);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const [hasSearchedDiveSite, setHasSearchedDiveSite] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // State for cached data
  const [scubaNews, setScubaNews] = useState<ScubaNewsArticle[]>([]);
  const [isScubaNewsLoading, setIsScubaNewsLoading] = useState(false);
  const [scubaNewsError, setScubaNewsError] = useState<string | null>(null);
  const [initialBlogPost, setInitialBlogPost] = useState<BlogPost | null>(null);
  
  // Nav bar visibility on scroll
  useEffect(() => {
    const controlNavbar = () => {
        if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
            setIsNavVisible(false);
        } else {
            setIsNavVisible(true);
        }
        lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
        window.removeEventListener('scroll', controlNavbar);
    };
  }, []);

  // Theme management effect
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: Theme) => {
      if (currentTheme === 'system') {
        localStorage.removeItem('theme');
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        localStorage.setItem('theme', currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) { 
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Initialization Ref to prevent double-execution in Strict Mode
  const didInit = useRef(false);

  // Initial Data Load
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Force Home view on fresh load to ensure Hero is visible
    setActiveView('home');

    const initApp = async () => {
        // 1. Check for share link
        const urlParams = new URLSearchParams(window.location.search);
        const shareBriefingId = urlParams.get('shareBriefingId');

        if (shareBriefingId) {
            const briefing = getSharedBriefing(parseInt(shareBriefingId, 10));
            if (briefing) {
                setSharedBriefing(briefing);
            }
            setIsCheckingShare(false);
            return;
        }

        setIsCheckingShare(false);

        // 2. Visitor Count
        const count = incrementAndGetVisitorCount();
        setVisitorCount(count);

        // 3. Timeout Race: Ensure app doesn't hang if Firebase or Config is slow on mobile
        const loadDataPromise = async () => {
            // Check for Redirect Login Result (Priority over localStorage)
            const redirectUser = await checkRedirectResult();
            if (redirectUser) {
                await handleLoginSuccess(redirectUser);
                return;
            }

            // Check Local Storage
            try {
                const storedUser = localStorage.getItem('scubaSteveCurrentUser');
                if (storedUser) {
                    const loggedInUser: User = JSON.parse(storedUser);
                    const fullUser = getUser(loggedInUser.uid);
                    setUser(fullUser || loggedInUser);
                    if (fullUser) {
                        const userBriefings = await getUserBriefings(fullUser.uid);
                        setBriefings(userBriefings);
                    }
                    
                    const acceptedVersion = localStorage.getItem('scubaSteveLegalAcceptedVersion');
                    if (acceptedVersion !== LEGAL_VERSION) {
                        setShowLegalAcceptance(true);
                    } else {
                        const onboardingComplete = localStorage.getItem('scubaSteveOnboardingComplete');
                        if (onboardingComplete !== 'true') {
                            setShowOnboarding(true);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('scubaSteveCurrentUser');
            }
            
            // Attempt to load config
            const config = await fetchAppConfig();
            if (config) setAppConfig(config);
        };

        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

        // Wait for data OR timeout
        await Promise.race([loadDataPromise(), timeoutPromise]);
    };

    initApp();
  }, []);
  
  // Effect to re-fetch config when user logs in
  useEffect(() => {
      if (user) {
          fetchAppConfig().then(config => {
              if (config && Object.keys(config).length > 0) {
                  setAppConfig(config);
              }
          });
      }
  }, [user]);
  
  // Data fetching effect for cached views
  useEffect(() => {
    const fetchScubaNews = async () => {
        if (scubaNews.length > 0) return; // Already loaded
        setIsScubaNewsLoading(true);
        setScubaNewsError(null);
        try {
            const newsArticles = await getScubaNews();
            setScubaNews(newsArticles);
        } catch (err) {
            console.error("Failed to fetch scuba news:", err);
            setScubaNewsError("Could not fetch the latest scuba news. The signal might be weak out here. Please try again later.");
        } finally {
            setIsScubaNewsLoading(false);
        }
    };

    if (activeView === 'scuba_news') {
        fetchScubaNews();
    }
  }, [activeView, scubaNews.length]);

  // Save current user to localStorage and DB when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('scubaSteveCurrentUser', JSON.stringify(user));
      updateUser(user);
    } else {
      localStorage.removeItem('scubaSteveCurrentUser');
    }
  }, [user]);

  const handleLoginSuccess = async (loggedInUser: User) => {
    registerUser(loggedInUser); 
    const fullUser = getUser(loggedInUser.uid); 
    setUser(fullUser);
    const userBriefings = await getUserBriefings(loggedInUser.uid);
    setBriefings(userBriefings);
    
    // Check legal acceptance immediately after login
    const acceptedVersion = localStorage.getItem('scubaSteveLegalAcceptedVersion');
    if (acceptedVersion !== LEGAL_VERSION) {
        setShowLegalAcceptance(true);
    } else {
        const onboardingComplete = localStorage.getItem('scubaSteveOnboardingComplete');
        if (onboardingComplete !== 'true') {
            setShowOnboarding(true);
        }
    }
  };

  const handleLegalAccept = () => {
      localStorage.setItem('scubaSteveLegalAcceptedVersion', LEGAL_VERSION);
      setShowLegalAcceptance(false);
      
      const onboardingComplete = localStorage.getItem('scubaSteveOnboardingComplete');
      if (onboardingComplete !== 'true') {
          setShowOnboarding(true);
      }
  };

  const handleCancelRequest = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleLogActivity = useCallback((type: Briefing['type'], outputData: any, promptStr: string) => {
      if (!user) return;
      
      const newBriefing: Briefing = {
          id: Date.now(),
          userId: user.uid,
          type: type,
          status: 'completed',
          createdAt: Date.now(),
          input: { prompt: promptStr },
          output: outputData
      };

      saveBriefing(newBriefing);
      setBriefings(prev => [newBriefing, ...prev]);
  }, [user]);

  const startBriefing = useCallback(async (
    type: Briefing['type'], 
    mediaFilesOrPrompt: File[] | null | string,
    ...args: any[]
  ) => {
    if (!user) return;

    const canProceed = canUserPerformBriefing(user.uid, type);
    
    if (!canProceed) {
        // Check for mock ID OR anonymous user email flag
        const isGuest = user.uid === 'mock-demo-user' || user.email === 'guest@scubasteve.rocks';
        
        if (isGuest) {
            // Guest limits (hard block on tools, soft limit on ID)
            if (type === 'marine_id' || type === 'color_correct') {
                 setToastMessage("Guest ID Limit Reached. Please sign in.");
                 return;
            }
            setToastMessage("Please sign in to use Chat & Tools.");
            return;
        }
        
        const premiumActions = ['dive_site', 'live_report', 'trip_planner', 'voice', 'scuba_news'];
        if (premiumActions.includes(type)) {
             setError("Daily Premium Limit Reached. You can still use Chat & Marine ID!");
        } else if (type === 'voice') {
             setError("Weekly Voice Limit Reached. This will reset in 7 days.");
        } else {
             setError("You have reached your daily limit for this feature.");
        }
        setIsLimitModalOpen(true);
        return;
    }

    let prompt: string | undefined;
    let mediaFiles: File[] | null = null;
    
    if (type === 'marine_id' || type === 'color_correct' || type === 'surface_interval') {
      mediaFiles = mediaFilesOrPrompt as File[] | null;
      prompt = args[0] as string;
    } else {
      prompt = mediaFilesOrPrompt as string;
    }

    const hasMedia = mediaFiles && mediaFiles.length > 0;
    
    if (!hasMedia && !prompt && type !== 'live_report') {
      setError('Please provide some input (media or text).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentBriefingResult(null);

    incrementUserBriefingCount(user.uid, type);
    setUser(getUser(user.uid));

    const newBriefing: Briefing = {
      id: Date.now(),
      userId: user.uid,
      type,
      status: 'pending',
      createdAt: Date.now(),
      input: {
        prompt,
        originalFileNames: mediaFiles?.map(f => f.name),
      }
    };
    
    if (hasMedia) {
      newBriefing.input.imageUrls = await Promise.all(
        mediaFiles.map(file => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }))
      );
    }
    
    saveBriefing(newBriefing);
    setBriefings(prev => [newBriefing, ...prev]);

    try {
      let updatedBriefing: Briefing;

      switch (type) {
        case 'marine_id':
          updatedBriefing = await processMarineIdBriefing(user, newBriefing, mediaFiles, prompt!);
          setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, identificationCount: (prevUser.identificationCount || 0) + 1 };
          });
          break;
        case 'species_search':
            const speciesInfo = await searchSpecies(prompt!);
            const searchResult: IdentificationResult = {
                greeting: `Here is what I found for "${prompt!}" 🐠`,
                main_text: speciesInfo.main_text,
                footer: "Information provided by Scuba Steve – Your AI Dive Buddy 🐢",
                species_name: speciesInfo.species_name,
                scientific_name: speciesInfo.scientific_name,
                confidence: 100,
                similar_species: speciesInfo.similar_species,
                references: speciesInfo.references
            };
            updatedBriefing = { ...newBriefing, status: 'completed', output: { suggestion: searchResult } };
            break;
        case 'color_correct':
          if (!hasMedia) throw new Error("Image file is missing for color correction");
          const correctionStyle = args[0] as CorrectionStyle || 'natural';
          const imagePartForCorrection = await fileToGenerativePart(mediaFiles![0]);
          const { data: correctedImageBase64, mimeType: correctedImageMimeType } = await correctColor(imagePartForCorrection, correctionStyle);
          updatedBriefing = { ...newBriefing, status: 'completed', output: { correctedImageUrl: `data:${correctedImageMimeType};base64,${correctedImageBase64}` } };
          break;
        case 'dive_site':
          const briefingResult = await getDiveSiteBriefing(prompt!);
          updatedBriefing = { ...newBriefing, status: 'completed', output: { briefing: briefingResult }};
          break;
        case 'surface_interval':
          const imagePartForRecipe = hasMedia ? await fileToGenerativePart(mediaFiles![0]) : null;
          const recipeResult = await getSurfaceIntervalRecipe(prompt!, imagePartForRecipe);
          updatedBriefing = { ...newBriefing, status: 'completed', output: { recipe: recipeResult } };
          break;
        case 'live_report':
            const [lat, lon] = prompt!.replace('latlon:', '').split(',').map(Number);
            const liveReportResult = await getLiveDiveReport(lat, lon);
            updatedBriefing = { ...newBriefing, status: 'completed', output: { liveReport: liveReportResult }};
            break;
        case 'trip_planner':
            const [destination, duration, certification, interests] = args;
            const tripPlanResult = await getDiveTripPlan(prompt!, duration, certification, interests);
            updatedBriefing = { ...newBriefing, status: 'completed', output: { tripPlan: tripPlanResult } };
            break;
        default:
          throw new Error("Unknown briefing type");
      }
      
      const finalBriefing = { ...newBriefing, ...updatedBriefing };
      updateBriefing(finalBriefing);
      setBriefings(prev => prev.map(j => j.id === newBriefing.id ? finalBriefing : j));
      setCurrentBriefingResult(finalBriefing);

    } catch (err) {
      console.error(err);
      setError("Steve's radio is on the fritz! A swell might be blocking the signal. Please try again in a moment.");
      const failedBriefing: Briefing = { ...newBriefing, status: 'failed' };
      updateBriefing(failedBriefing);
      setBriefings(prev => prev.map(j => j.id === newBriefing.id ? failedBriefing : j));
    } finally {
      setIsLoading(false);
      setPrompt('');
      setSelectedFiles(null);
    }
  }, [user]);
  
  const handleCorrection = useCallback(async (briefingId: number, correctedName: string) => {
    if (!user) return;
    setIsCorrecting(true);
    setError(null);

    try {
        const { main_text, species_name, scientific_name, similar_species, references } = await getSpeciesInfo(correctedName);
        
        let briefingToUpdate: Briefing | undefined;
        const updatedBriefings = briefings.map(briefing => {
            if (briefing.id === briefingId) {
                const originalGreeting = briefing.output?.suggestion?.greeting || "Ahoy there, diver! 🌊";
                const originalFooter = briefing.output?.suggestion?.footer || "Identified by Scuba Steve – Your AI Dive Buddy from OSEA Diver 🐢";

                briefingToUpdate = { 
                    ...briefing, 
                    output: {
                        ...briefing.output,
                        suggestion: {
                            greeting: originalGreeting,
                            main_text: main_text,
                            footer: originalFooter,
                            species_name: species_name,
                            scientific_name: scientific_name,
                            confidence: 100,
                            similar_species: similar_species || [],
                            references: references || []
                        }
                    },
                    correction: { final_species: correctedName },
                    contributionLogged: true,
                };
                return briefingToUpdate;
            }
            return briefing;
        });

        if(briefingToUpdate && user.contributesData) {
            logSightingContribution(briefingToUpdate, species_name);
            
            const doSave = (lat: number, lng: number) => {
                saveMarineSighting({
                    userId: user.uid,
                    dataUrl: briefingToUpdate?.input?.imageUrls?.[0],
                    commonName: species_name,
                    species: species_name,
                    confidence: 100,
                    lat,
                    lng,
                    locationName: briefingToUpdate?.location || briefingToUpdate?.input?.prompt
                })
                .then(() => console.log("Correction saved to Firestore!"))
                .catch(e => console.error("Correction save failed", e));
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => doSave(pos.coords.latitude, pos.coords.longitude),
                    (err) => {
                        console.warn("Geolocation failed for correction:", err);
                        doSave(0, 0);
                    },
                    { timeout: 5000, enableHighAccuracy: false }
                );
            } else {
                 doSave(0, 0);
            }
        }

        if(briefingToUpdate) {
            updateBriefing(briefingToUpdate);
            setBriefings(updatedBriefings);
            if (currentBriefingResult && currentBriefingResult.id === briefingId) {
                setCurrentBriefingResult(briefingToUpdate);
            }
        }

        setToastMessage("Correction saved to community database!");
    
    } catch (err) {
        console.error("Failed to get updated species info:", err);
        setError("Sorry, I couldn't find information on that species. Please check the name and try again.");
    } finally {
        setIsCorrecting(false);
    }
  }, [briefings, currentBriefingResult, user]);

  const handleConfirmIdentification = useCallback((briefingId: number) => {
    if (!user) return;

    let briefingToUpdate: Briefing | undefined;
    const updatedBriefings = briefings.map(briefing => {
        if (briefing.id === briefingId) {
            briefingToUpdate = { ...briefing, contributionLogged: true };
            return briefingToUpdate;
        }
        return briefing;
    });

    if (briefingToUpdate && user.contributesData && briefingToUpdate.output?.suggestion) {
        const species = briefingToUpdate.output.suggestion.species_name;
        const confidence = briefingToUpdate.output.suggestion.confidence || 0;
        
        try {
            logSightingContribution(briefingToUpdate, species);
        } catch (e) {
            console.error("Local log error:", e);
        }
        
        const imgToSave = briefingToUpdate?.input?.imageUrls?.[0];

        const doSave = (lat: number, lng: number) => {
             setToastMessage("Saving sighting to global map...");
             
             saveMarineSighting({
                userId: user.uid,
                dataUrl: imgToSave,
                commonName: species,
                species: species,
                confidence: confidence,
                lat, 
                lng,
                locationName: briefingToUpdate?.location || briefingToUpdate?.input?.prompt
            })
            .then(() => setToastMessage("Sighting confirmed & saved to community map!"))
            .catch(err => {
                console.error("Error saving sighting:", err);
                setToastMessage("Saved to local log only (offline).");
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => doSave(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    console.warn("Geolocation unavailable or timed out:", err);
                    doSave(0, 0);
                },
                { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false } 
            );
        } else {
             doSave(0, 0);
        }
    } else {
        setToastMessage("Sighting confirmed!");
    }
    
    if (briefingToUpdate) {
        updateBriefing(briefingToUpdate);
        setBriefings(updatedBriefings);
        if (currentBriefingResult && currentBriefingResult.id === briefingId) {
            setCurrentBriefingResult(briefingToUpdate);
        }
    }
}, [user, briefings, currentBriefingResult]);

  // ... (rest of the component methods remain unchanged) ...
  const handleUpdateBriefingDetails = useCallback((briefingId: number, details: Partial<Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>>) => {
      let briefingToUpdate: Briefing | undefined;
      const updatedBriefings = briefings.map(briefing => {
          if (briefing.id === briefingId) {
              briefingToUpdate = { ...briefing, ...details };
              return briefingToUpdate;
          }
          return briefing;
      });
      setBriefings(updatedBriefings);
      if(briefingToUpdate) {
          updateBriefing(briefingToUpdate);
          setToastMessage("Dive Log details saved!");
      }
      if (currentBriefingResult && currentBriefingResult.id === briefingId) {
          setCurrentBriefingResult(prev => prev ? { ...prev, ...details } : null);
      }
  }, [briefings, currentBriefingResult]);

  const handleUpdateBriefingImage = useCallback((briefingId: number, imageUrl: string) => {
      let briefingToUpdate: Briefing | undefined;
      const updatedBriefings = briefings.map(briefing => {
          if (briefing.id === briefingId) {
              briefingToUpdate = { 
                  ...briefing,
                  input: {
                      ...briefing.input,
                      imageUrls: [imageUrl]
                  }
              };
              return briefingToUpdate;
          }
          return briefing;
      });
      setBriefings(updatedBriefings);
      if (briefingToUpdate) {
          updateBriefing(briefingToUpdate);
          setToastMessage("Dive photo added!");
      }
      if (currentBriefingResult && currentBriefingResult.id === briefingId) {
          setCurrentBriefingResult(prev => prev ? { 
              ...prev, 
              input: { 
                  ...prev.input, 
                  imageUrls: [imageUrl] 
              } 
          } : null);
      }
  }, [briefings, currentBriefingResult]);

  const handleOpenChat = (contextBriefing: Briefing | null = null, initialMessage: string | null = null) => {
    setChatContext(contextBriefing);
    setChatInitialMessage(initialMessage);
    setInitialChatTab('ask');
    setActiveView('chat');
  };
  
  const handleLogout = () => {
    signOut();
    setUser(null);
    setBriefings([]);
    localStorage.removeItem('scubaSteveCurrentUser');
  };

  const handleProfileUpdate = (newName: string, newPhotoUrl: string | null, contributesData: boolean) => {
    if (!user) return;
    setUser(prevUser => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            displayName: newName,
            photoURL: newPhotoUrl !== null ? newPhotoUrl : prevUser.photoURL,
            contributesData: contributesData,
        };
    });
    setToastMessage("Profile saved successfully!");
    setIsProfileModalOpen(false);
  };

  const handleImportBriefings = (briefingsToImport: Briefing[]) => {
    saveBriefings(briefingsToImport);
    setBriefings(prev => [...briefingsToImport, ...prev]);
    setToastMessage(`${briefingsToImport.length} dives imported successfully!`);
  };

  const handleSelectBriefingFromHistory = (briefing: Briefing) => {
      setCurrentBriefingResult(briefing);
      switch(briefing.type) {
        case 'marine_id':
            setInitialIdentifyTab('upload');
            setActiveView('identify');
            break;
        case 'species_search':
            setInitialIdentifyTab('search');
            setActiveView('identify');
            break;
        case 'color_correct':
            setInitialIdentifyTab('color');
            setActiveView('identify');
            break;
        case 'imported_dive':
        case 'voice':
        case 'surface_interval':
            setActiveView('logbook'); 
            break;
        default:
            setActiveView('logbook');
      }
  };

  const handleGoHome = () => {
    setActiveView('home');
    setCurrentBriefingResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleMarineId = useCallback((files: File[] | null, prompt: string) => {
      startBriefing('marine_id', files, prompt);
  }, [startBriefing]);
  
  const handleSpeciesSearch = useCallback((query: string) => {
      startBriefing('species_search', query);
  }, [startBriefing]);

  const handleColorCorrect = useCallback((mediaFiles: File[], style: CorrectionStyle) => {
      startBriefing('color_correct', mediaFiles, style);
  }, [startBriefing]);

  const handleTripPlan = useCallback((destination: string, duration: number, certification: string, interests: string) => {
      startBriefing('trip_planner', destination, duration, certification, interests);
  }, [startBriefing]);
  
  const handleDiveSiteLookup = useCallback((siteName: string) => {
      startBriefing('dive_site', siteName);
      setHasSearchedDiveSite(true);
  }, [startBriefing]);
  
  const handleSurfaceIntervalRecipe = useCallback((prompt: string, file: File | null) => {
      startBriefing('surface_interval', file ? [file] : null, prompt);
  }, [startBriefing]);

  const handleStartNewIdentification = useCallback(() => {
    setCurrentBriefingResult(null);
    setSelectedFiles(null);
    setPrompt('');
  }, []);

  const handleOnboardingComplete = () => {
    try {
        localStorage.setItem('scubaSteveOnboardingComplete', 'true');
    } catch (e) {
        console.error("Failed to save onboarding status to localStorage", e);
    }
    setShowOnboarding(false);
  };

  const handleShowTour = () => {
    setIsProfileModalOpen(false);
    setTimeout(() => {
      setShowOnboarding(true);
    }, 300);
  };
  
  const handleViewPost = useCallback((slug: string) => {
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      setInitialBlogPost(post);
      setActiveView('blog');
    }
  }, []);

  if (isCheckingShare) {
    return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg"><ScubaSteveLogo className="w-24 h-24 rounded-full animate-pulse" /></div>;
  }

  if (sharedBriefing) {
      return <SharedBriefingView briefing={sharedBriefing} />;
  }

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <div className="living-ocean-bg fixed inset-0 -z-10" />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }
  
  const remainingBriefings = user.uid === 'mock-demo-user' || user.email === 'guest@scubasteve.rocks' 
    ? 0
    : (DAILY_PREMIUM_LIMIT - (user.dailyUsage.premiumCount || 0));
    
  const onOpenLimitModal = () => setIsLimitModalOpen(true);

  const renderActiveView = () => {
    const isHeavyLimitReached = !canUserPerformBriefing(user.uid, 'marine_id');
    const isVoiceLimitReached = !canUserPerformBriefing(user.uid, 'voice');

    switch (activeView) {
        case 'home':
            return <HomeView setActiveView={setActiveView} setInitialIdentifyTab={setInitialIdentifyTab} onOpenChat={handleOpenChat} onOpenShop={() => setIsShopModalOpen(true)} />;
        case 'identify':
            return <IdentifyView initialTab={initialIdentifyTab} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} prompt={prompt} setPrompt={setPrompt} handleMarineId={handleMarineId} handleSpeciesSearch={handleSpeciesSearch} handleColorCorrect={handleColorCorrect} handleStartNewIdentification={handleStartNewIdentification} isLoading={isLoading} error={error} isCorrecting={isCorrecting} currentBriefingResult={currentBriefingResult} setCurrentBriefingResult={setCurrentBriefingResult} handleCorrection={handleCorrection} handleConfirmIdentification={handleConfirmIdentification} handleUpdateBriefingDetails={handleUpdateBriefingDetails} handleOpenChat={handleOpenChat} onOpenLimitModal={onOpenLimitModal} isBriefingLimitReached={isHeavyLimitReached} handleSelectBriefingFromHistory={handleSelectBriefingFromHistory} onCancel={handleCancelRequest} />;
        case 'chat':
            return (
                <ChatView 
                    initialTab={initialChatTab}
                    onTabChange={setInitialChatTab}
                    initialContext={chatContext}
                    initialMessage={chatInitialMessage}
                    onOpenLimitModal={onOpenLimitModal}
                    isLoading={isLoading}
                    error={error}
                    isBriefingLimitReached={isHeavyLimitReached}
                    isVoiceLimitReached={isVoiceLimitReached}
                    handleDiveSiteLookup={handleDiveSiteLookup}
                    handleSurfaceIntervalRecipe={handleSurfaceIntervalRecipe}
                    currentBriefingResult={currentBriefingResult}
                    hasSearchedDiveSite={hasSearchedDiveSite}
                    onCancel={handleCancelRequest}
                    onOpenChat={handleOpenChat}
                />
            );
        case 'logbook':
            if (currentBriefingResult) {
                if (currentBriefingResult.type === 'imported_dive') {
                    return (
                        <ViewShell title="Imported Dive Details" onBack={() => setCurrentBriefingResult(null)}>
                            <ImportedDiveDetailView briefing={currentBriefingResult} onUpdateBriefingDetails={handleUpdateBriefingDetails} onUpdateBriefingImage={handleUpdateBriefingImage} onOpenChat={() => handleOpenChat(currentBriefingResult)} />
                        </ViewShell>
                    );
                }
                if (currentBriefingResult.type === 'voice') {
                    return (
                        <ViewShell title="Voice Chat Transcript" onBack={() => setCurrentBriefingResult(null)}>
                            <VoiceChatView isBriefingLimitReached={isVoiceLimitReached} onOpenLimitModal={onOpenLimitModal} currentBriefingResult={currentBriefingResult} />
                        </ViewShell>
                    );
                }
            }
            return <LogbookView initialTab={initialLogbookTab} onImportBriefings={handleImportBriefings} onSelectBriefing={handleSelectBriefingFromHistory} />;
        case 'tools':
            return <ToolsHubView setActiveView={setActiveView} setInitialChatTab={setInitialChatTab} setInitialLogbookTab={setInitialLogbookTab} onViewPost={handleViewPost} onLogActivity={handleLogActivity} onCancel={handleCancelRequest} />;
        case 'partner_portal':
            return <PartnerPortalView />;
        case 'map':
            return <SightingMapView />;
        case 'trip_planner':
            return <ViewShell title="AI Dive Trip Planner" onBack={() => setActiveView('tools')}><DiveTripPlannerView startBriefing={handleTripPlan} currentBriefingResult={currentBriefingResult} isLoading={isLoading} error={error} isBriefingLimitReached={isHeavyLimitReached} onCancel={handleCancelRequest} /></ViewShell>
        case 'dive_site_lookup':
            return <ViewShell title="Dive Site & Conditions Lookup" onBack={() => setActiveView('tools')}><DiveSiteLookup startBriefing={handleDiveSiteLookup} currentBriefingResult={currentBriefingResult} isLoading={isLoading} error={error} isBriefingLimitReached={isHeavyLimitReached} hasSearched={hasSearchedDiveSite} onCancel={handleCancelRequest} /></ViewShell>
        case 'surface_interval':
            return <ViewShell title="Steve's Dive Diet" onBack={() => setActiveView('tools')}><SurfaceIntervalView startBriefing={handleSurfaceIntervalRecipe} currentBriefingResult={currentBriefingResult} isLoading={isLoading} error={error} isBriefingLimitReached={isHeavyLimitReached} onOpenChat={() => handleOpenChat(null)} onCancel={handleCancelRequest} /></ViewShell>
        case 'voice_chat':
             return <ViewShell title="Voice Chat" onBack={() => setActiveView('tools')}><VoiceChatView isBriefingLimitReached={isVoiceLimitReached} onOpenLimitModal={onOpenLimitModal} currentBriefingResult={null} /></ViewShell>
        case 'blog':
            return <ViewShell title="Steve's Dive Log Blog" onBack={() => { setActiveView('tools'); setInitialBlogPost(null); }}><BlogView initialPost={initialBlogPost} /></ViewShell>
        case 'scuba_news':
            return <ViewShell title="Latest Scuba News" onBack={() => setActiveView('tools')}><ScubaNewsView articles={scubaNews} isLoading={isScubaNewsLoading} error={scubaNewsError} /></ViewShell>
        case 'topics':
            return <ViewShell title="Explore Diving Topics" onBack={() => setActiveView('tools')}><TopicsView onStartTopicChat={handleOpenChat} /></ViewShell>
        case 'game':
            return (
                <ViewShell title="Dive Training Game" onBack={() => setActiveView('home')}>
                    <DiveTrainingGameView onBack={() => setActiveView('home')} onLogActivity={handleLogActivity} />
                </ViewShell>
            );
        default:
            return <HomeView setActiveView={setActiveView} setInitialIdentifyTab={setInitialIdentifyTab} onOpenChat={handleOpenChat} onOpenShop={() => setIsShopModalOpen(true)} />;
    }
  };
  
  const appContextValue: AppContextType = {
      user,
      briefings,
      theme,
      config: appConfig,
      setTheme,
      setUser,
      setBriefings
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <GlobalStyles />
      <div className="living-ocean-bg fixed inset-0 -z-10" />
      <GlobalLoader isLoading={isLoading && activeView !== 'chat'} onCancel={handleCancelRequest} />
      <Header onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} onGoHome={handleGoHome} remainingBriefings={remainingBriefings} onOpenGameInfo={() => setIsGameInfoModalOpen(true)} />
      {activeView === 'home' && <Hero />}
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative`}>
        <main id="main-content" className={activeView === 'home' ? 'mt-8' : ''}>
            <Suspense fallback={<GlobalLoader isLoading={true} />}>
              {renderActiveView()}
            </Suspense>
        </main>
        <Footer onOpenTerms={() => setLegalModalContent({ title: 'Terms of Use', content: <TermsOfUseContent /> })} onOpenPrivacy={() => setLegalModalContent({ title: 'Privacy Policy', content: <PrivacyPolicyContent /> })} />
      </div>
      
      <FunFactBubbles />
      <NavigationBar activeView={activeView as any} setActiveView={setActiveView} onOpenChat={handleOpenChat} isNavVisible={isNavVisible} />
      <FloatingChatButton onOpenChat={() => handleOpenChat(null, null)} isNavVisible={isNavVisible} />
      {isProfileModalOpen && user && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onSave={handleProfileUpdate} onShowTour={handleShowTour} />}
      {isShopModalOpen && <ShopModal onClose={() => setIsShopModalOpen(false)} />}
      {isLimitModalOpen && <LimitReachedModal onClose={() => setIsLimitModalOpen(false)} />}
      {isGameInfoModalOpen && <SimulationInfoModal onClose={() => setIsGameInfoModalOpen(false)} />}
      {legalModalContent && <LegalModal title={legalModalContent.title} onClose={() => setLegalModalContent(null)}>{legalModalContent.content}</LegalModal>}
      {toastMessage && <ConfirmationToast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
      
      {/* Mandatory Legal Acceptance Modal */}
      {showLegalAcceptance && user && (
          <LegalAcceptanceModal 
            onAccept={handleLegalAccept}
            onOpenTerms={() => setLegalModalContent({ title: 'Terms of Use', content: <TermsOfUseContent /> })}
            onOpenPrivacy={() => setLegalModalContent({ title: 'Privacy Policy', content: <PrivacyPolicyContent /> })}
          />
      )}
    </AppContext.Provider>
  );
};

export default App;