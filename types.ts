
export interface Reference {
  title: string;
  url: string;
}

export interface IdentificationResult {
  greeting: string;
  // The main body of markdown text for the species description, starting with "Key Characteristics".
  main_text: string; 
  footer: string;

  // For programmatic use
  species_name: string; // Common Name
  scientific_name: string; // Scientific Name
  confidence: number;
  similar_species?: string[];
  references?: Reference[];
}

export interface LiveReportResult {
    report: string;
    sources: GroundingChunk[] | null;
}

export interface DiveTripPlanResult {
  plan: string;
  sources: GroundingChunk[] | null;
}

export interface Briefing {
  id: number;
  userId: string;
  type:
    | 'marine_id'
    | 'color_correct'
    | 'dive_site'
    | 'live_report'
    | 'trip_planner'
    | 'voice'
    | 'imported_dive'
    | 'surface_interval'
    | 'species_search'
    | 'game_round'
    | 'calculator';

  status: 'pending' | 'completed' | 'failed';

  input: {
    prompt?: string;
    imageUrls?: string[]; // base64
    originalFileNames?: string[];
  };

  output?: {
    suggestion?: IdentificationResult;
    correctedImageUrl?: string; // base64
    generatedImageUrl?: string; // base64 for AI visualisations
    briefing?: DiveSiteBriefingResult;
    liveReport?: LiveReportResult;
    tripPlan?: DiveTripPlanResult;
    transcript?: LiveChatMessage[];
    recipe?: string;
    gameRound?: GameRound;
    calculatorData?: {
      title: string;
      result: string;
    };
  };

  // Steve / model correction (internal)
  correction?: {
    final_species: string;
  };

  createdAt: number;

  // ❗ Only true once a Firestore write succeeded
  contributionLogged?: boolean;

  // ✅ Firestore document ID for World Map pin (NEVER removed)
  sightingId?: string;

  // ✅ Diver-friendly correction tracking (does not close workflow)
  diverCorrection?: {
    correctedSpecies: string;
    correctedCommonName: string;
    status: 'draft' | 'submitted' | 'failed';
    submittedAt?: number; // ms timestamp
  };

  // Dive Log fields
  location?: string;
  region?: string;
  dive_time?: number;
  max_depth?: number;
  dive_buddy?: string;
  notes?: string;
  species_sighted?: string;
}

export interface GameRound {
  title: string;
  scenario: string;
  options: string[];
  correct_answer: string; // Should match one of the options exactly or be the letter (A, B, C, D)
  explanation: string;
  xp_reward: number;
  achievement_unlock?: string;
  level_up?: boolean;
  user_answer?: string;
  is_correct?: boolean;
}

export interface GameProgress {
  totalXP: number;
  level: number;
  badges: string[];
}

export interface SavedSite {
  id: string;
  name: string;
  briefingContent: string;
  sources?: GroundingChunk[];
  timestamp: number;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;

  // CORE APP FLAGS
  identificationCount: number;
  dailyUsage: {
    date: string; // YYYY-MM-DD
    briefingCount: number; // Tracks Standard Actions
    premiumCount?: number; // Tracks Expensive Actions (Search, Voice, Plan)
  };
  
  // Weekly limits for Map Uploads (Cost Control)
  weeklyContributionCount?: number; 
  lastWeeklyReset?: number; // Timestamp

  lastVoiceUsage?: number; // Timestamp of last voice chat usage (weekly limit)
  contributesData: boolean;
  gameProgress?: GameProgress;
  isPro?: boolean;
  savedSites?: SavedSite[];

  // 🔥 NEW: PROFILE & DIVE INFO
  homeCountry?: string;        // e.g. "South Africa"
  homeCityOrRegion?: string;   // e.g. "Cape Town", "Red Sea"
  primaryDiveAgency?: string;  // "PADI", "SSI", "CMAS", etc.
  certificationLevel?: string; // "OW", "AOW", "Rescue", "DM", "Instructor"
  approxDivesLogged?: number;  // rough number

  // GEAR / INTERESTS
  cameraUser?: boolean;        // uses a camera / GoPro / Insta360
  lovesPhotography?: boolean;
  techCurious?: boolean;       // interested in tech/VR/AI

  // MARKETING / FUNNEL
  referralSource?: string;     // "Facebook", "Friend", "Dive shop", etc.
  marketingOptIn?: boolean;

  // SYSTEM METADATA
  createdAt?: number;          // timestamp (ms)
  lastActiveAt?: number;       // timestamp (ms)
  lastPlatform?: "web" | "pwa" | "mobile-web" | "other";
}

export interface LimitReachedPayload {
  type: "limit_reached",
  title: string,
  message: string,
  donation_button_text: string,
  donation_url: string,
  action: "end_session"
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingSource;
  maps?: GroundingSource;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  type?: 'limit_reached';
  payload?: LimitReachedPayload;
  sources?: GroundingChunk[];
}


export interface LiveChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Bubble {
  id: number;
  left: string;
  duration: string;
  size: string;
  wobble1: string;
  wobble2: string;
  wobble3: string;
  wobble4: string;
}

export interface DiveSiteBriefingResult {
  briefing: string; // The full markdown briefing
  sources: GroundingChunk[] | null;
}

export interface CommunitySighting {
  id: number | string; // Allow Firestore string IDs
  species: string;
  location: string;
  region?: string; // Added for map filtering
  imageUrl?: string; // Added for map display
  description?: string; // Added for map details
  createdAt: number;
}

export interface ScubaNewsArticle {
    title: string;
    summary: string;
    url?: string;
    sourceTitle?: string;
}

export interface AppConfig {
  logoUrl?: string;
  avatarUrl?: string;
}
