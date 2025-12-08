
import React, { useState } from 'react';
import { SACCalculator } from './calculators/SACCalculator';
import { MODCalculator } from './calculators/MODCalculator';
import { EADCalculator } from './calculators/EADCalculator';
import { DiveTablesCalculator } from './calculators/DiveTablesCalculator';
import { BestMixCalculator } from './calculators/BestMixCalculator';
import { GasConsumptionCalculator } from './calculators/GasConsumptionCalculator';
import { PPO2Calculator } from './calculators/PPO2Calculator';
import { UnitConverter } from './calculators/UnitConverter';
import { WeightingCalculator } from './calculators/WeightingCalculator';
import { PressureGroupCalculator } from './calculators/PressureGroupCalculator';
import { SurfaceIntervalCalculator } from './calculators/SurfaceIntervalCalculator';
import { RepetitiveDiveCalculator } from './calculators/RepetitiveDiveCalculator';
import { DepthCorrectionCalculator } from './calculators/DepthCorrectionCalculator';
import { BoylesLawCalculator } from './calculators/BoylesLawCalculator';
import { TimeRemainingCalculator } from './calculators/TimeRemainingCalculator';
import { GasBlenderCalculator } from './calculators/GasBlenderCalculator';
import { Briefing } from '../types';

type View = 'home' | 'identify' | 'chat' | 'logbook' | 'map' | 'partner_portal' | 'tools' | 'trip_planner' | 'dive_site_lookup' | 'surface_interval' | 'voice_chat' | 'blog' | 'scuba_news' | 'topics' | 'game';
type ChatViewTab = any;
type LogbookTab = 'log' | 'import';

interface ToolsHubViewProps {
    setActiveView: (view: View) => void;
    setInitialChatTab: (tab: ChatViewTab) => void;
    setInitialLogbookTab: (tab: LogbookTab) => void;
    onViewPost: (slug: string) => void;
    onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void;
    onCancel?: () => void;
}

interface ToolInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Planners & Info' | 'Gas Management' | 'Dive Planning' | 'Dive Tables' | 'Utilities' | 'Community' | 'Training';
  action: 'component' | 'navigate' | 'function' | 'external_link';
  component?: React.FC<{ onBack: () => void, onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void }>;
  navTarget?: { view: View; initialTab?: any };
  functionSlug?: string;
  externalUrl?: string;
  colorClass?: string;
  onClick?: () => void; // Added for direct function calls like seeding
}

const ALL_TOOLS: ToolInfo[] = [
  // Training
  { id: 'training_game', title: 'Knowledge Quiz', description: 'Level up your scuba knowledge', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, action: 'navigate', navTarget: { view: 'game' }, category: 'Training', colorClass: "from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400" },
  { id: 'sim_game', title: 'Scuba Steve Sim', description: 'Play the Simulation Game', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>, action: 'external_link', externalUrl: 'https://scuba-steve-ai-game-483432894986.us-west1.run.app', category: 'Training', colorClass: "from-purple-400/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400" },

  // Planners & Info
  { id: 'trip_planner', title: 'Trip Planner', description: 'Generate a custom dive itinerary', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>, category: 'Planners & Info', action: 'navigate', navTarget: { view: 'trip_planner' }, colorClass: "from-emerald-400/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400" },
  { id: 'dive_site', title: 'Site Lookup', description: 'Get live dive site conditions', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, category: 'Planners & Info', action: 'navigate', navTarget: { view: 'chat', initialTab: 'local_conditions' }, colorClass: "from-sky-400/20 to-blue-500/20 text-sky-600 dark:text-sky-400" },
  { id: 'scuba_news', title: 'Scuba News', description: 'Latest news from the dive world', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h9M7 16h6M7 8h6v4H7V8z" /></svg>, category: 'Planners & Info', action: 'navigate', navTarget: { view: 'scuba_news' }, colorClass: "from-indigo-400/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400" },
  { id: 'blog', title: 'Dive Blog', description: "Steve's articles and tips", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494M12 6.253A3.75 3.75 0 1115.75 10H12v2.507A3.75 3.75 0 1112 6.253z" /></svg>, category: 'Planners & Info', action: 'navigate', navTarget: { view: 'blog' }, colorClass: "from-violet-400/20 to-fuchsia-500/20 text-violet-600 dark:text-violet-400" },
  { id: 'about_steve', title: 'About Steve', description: "Learn his story", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, category: 'Planners & Info', action: 'function', functionSlug: 'about-scuba-steve-ai', colorClass: "from-cyan-400/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400" },

  // Gas Management
  { id: 'sac', title: 'SAC Rate', description: 'Surface Air Consumption', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, component: SACCalculator, action: 'component', category: 'Gas Management', colorClass: "from-red-400/20 to-orange-500/20 text-red-600 dark:text-red-400" },
  { id: 'gas_consumption', title: 'Gas Consumption', description: 'Plan your gas needs', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12.25 18.003h-2.5a2.5 2.5 0 01-2.5-2.5v-1.128c0-.986.636-1.853 1.556-2.23l4.318-1.799.03-.013c.2-.083.328-.29.328-.53v-2.3a.5.5 0 00-.5-.5h-2.5a.5.5 0 00-.5.5v1.5a.5.5 0 01-1 0v-1.5a1.5 1.5 0 011.5-1.5h2.5a1.5 1.5 0 011.5 1.5v2.3c0 .986-.636-1.853-1.556 2.23l-4.318 1.799-.03.013c-.2.083-.328-.29-.328-.53v1.128a1.5 1.5 0 001.5 1.5h2.5a.75.75 0 010 1.5z" /></svg>, component: GasConsumptionCalculator, action: 'component', category: 'Gas Management', colorClass: "from-red-400/20 to-orange-500/20 text-red-600 dark:text-red-400" },
  { id: 'time_remaining', title: 'Time Remaining', description: 'Estimate dive time', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.5 12a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z" /></svg>, component: TimeRemainingCalculator, action: 'component', category: 'Gas Management', colorClass: "from-red-400/20 to-orange-500/20 text-red-600 dark:text-red-400" },
  { id: 'gas_blender', title: 'Gas Blender', description: 'Nitrox fill calculator', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, component: GasBlenderCalculator, action: 'component', category: 'Gas Management', colorClass: "from-green-400/20 to-emerald-500/20 text-green-600 dark:text-green-400" },
  
  // Dive Planning
  { id: 'mod', title: 'MOD Calculator', description: 'Max Operating Depth', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, component: MODCalculator, action: 'component', category: 'Dive Planning', colorClass: "from-blue-400/20 to-cyan-500/20 text-blue-600 dark:text-blue-400" },
  { id: 'best_mix', title: 'Best Nitrox Mix', description: 'Recommended EANx', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, component: BestMixCalculator, action: 'component', category: 'Dive Planning', colorClass: "from-green-400/20 to-teal-500/20 text-green-600 dark:text-green-400" },
  { id: 'ead', title: 'EAD Calculator', description: 'Equivalent Air Depth', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, component: EADCalculator, action: 'component', category: 'Dive Planning', colorClass: "from-blue-400/20 to-indigo-500/20 text-blue-600 dark:text-blue-400" },
  { id: 'ppo2', title: 'PPO₂ Calculator', description: 'Partial Pressure O₂', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11" /></svg>, component: PPO2Calculator, action: 'component', category: 'Dive Planning', colorClass: "from-yellow-400/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400" },
  { id: 'weighting', title: 'Weighting', description: 'Buoyancy estimate', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M6 13H4M12 13v-2" /></svg>, component: WeightingCalculator, action: 'component', category: 'Dive Planning', colorClass: "from-gray-400/20 to-slate-500/20 text-gray-600 dark:text-gray-400" },
  
  // Dive Tables
  { id: 'dive_tables', title: 'Dive Tables', description: 'Multi-step RDP Planner', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, component: DiveTablesCalculator, action: 'component', category: 'Dive Tables', colorClass: "from-slate-400/20 to-blue-500/20 text-slate-600 dark:text-slate-400" },
  { id: 'pressure_group', title: 'Pressure Group', description: 'Find PG after a dive', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, component: PressureGroupCalculator, action: 'component', category: 'Dive Tables', colorClass: "from-slate-400/20 to-blue-500/20 text-slate-600 dark:text-slate-400" },
  { id: 'surface_interval', title: 'Surface Interval', description: 'Calculate new PG', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 11l-.26-1.447A2 2 0 019.225 7H14.77a2 2 0 011.752 2.553l-.26 1.447m0 0l-2.235 2.236A2 2 0 0112 14v3m-2.263-3.001l-2.235-2.236A2 2 0 016 11.93V9" /></svg>, component: SurfaceIntervalCalculator, action: 'component', category: 'Dive Tables', colorClass: "from-slate-400/20 to-blue-500/20 text-slate-600 dark:text-slate-400" },
  { id: 'repetitive_dive', title: 'Repetitive Planner', description: 'Plan next dive NDL', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>, component: RepetitiveDiveCalculator, action: 'component', category: 'Dive Tables', colorClass: "from-slate-400/20 to-blue-500/20 text-slate-600 dark:text-slate-400" },
  
  // Utilities
  { id: 'depth_correction', title: 'Depth Correction', description: 'Freshwater vs Salt', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>, component: DepthCorrectionCalculator, action: 'component', category: 'Utilities', colorClass: "from-cyan-400/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400" },
  { id: 'boyles_law', title: "Boyle's Law", description: 'Air volume changes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>, component: BoylesLawCalculator, action: 'component', category: 'Utilities', colorClass: "from-indigo-400/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400" },
  { id: 'units', title: 'Unit Conversion', description: 'Metric & Imperial', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16M10 3v18M14 3v18" /></svg>, component: UnitConverter, action: 'component', category: 'Utilities', colorClass: "from-slate-400/20 to-gray-500/20 text-slate-600 dark:text-slate-400" },
  
  // Community
  { id: 'sighting_map', title: 'Sighting Map', description: 'View community sightings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0l-6-4m6 4v10" /></svg>, action: 'navigate', navTarget: { view: 'map' }, category: 'Community', colorClass: "from-indigo-400/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400"},
  { id: 'dive_diet', title: 'Dive Diet', description: 'Surface interval recipes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM15 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM8 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM1.088 6.088a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L1.088 7.502a1 1 0 010-1.414zM15.5 6.088a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 10a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>, action: 'navigate', navTarget: { view: 'chat', initialTab: 'dive_diet' }, category: 'Community', colorClass: "from-lime-400/20 to-green-500/20 text-lime-600 dark:text-lime-400" },
  { id: 'import_dives', title: 'Import Dives', description: 'Sync log from CSV', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>, action: 'navigate', navTarget: { view: 'logbook', initialTab: 'import' }, category: 'Community', colorClass: "from-slate-400/20 to-gray-500/20 text-slate-600 dark:text-slate-400" },
  { id: 'voice_chat', title: 'Voice Chat', description: 'Talk with Scuba Steve', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>, action: 'navigate', navTarget: { view: 'chat', initialTab: 'voice' }, category: 'Community', colorClass: "from-fuchsia-400/20 to-purple-500/20 text-fuchsia-600 dark:text-fuchsia-400" },
  { id: 'topics', title: 'Dive Topics', description: 'Explore specialized subjects', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, action: 'navigate', navTarget: { view: 'topics' }, category: 'Community', colorClass: "from-violet-400/20 to-indigo-500/20 text-violet-600 dark:text-violet-400" },
];

const ToolCard: React.FC<{ tool: ToolInfo; onSelect: () => void }> = ({ tool, onSelect }) => (
    <div 
        onClick={onSelect}
        className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-soft dark:shadow-soft-dark border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm group-hover:scale-110 transition-transform duration-300 ${tool.colorClass || "from-light-primary-start/20 to-light-secondary/20 text-light-accent dark:text-dark-accent"}`}>
            {tool.icon}
        </div>
        <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{tool.title}</h3>
        <p className="text-xs text-light-text/60 dark:text-dark-text/60">{tool.description}</p>
    </div>
);


const ToolsHubView: React.FC<ToolsHubViewProps> = ({ setActiveView, setInitialChatTab, setInitialLogbookTab, onViewPost, onLogActivity, onCancel }) => {
    const [activeTool, setActiveTool] = useState<ToolInfo | null>(null);

    const handleSelect = (tool: ToolInfo) => {
        if (tool.action === 'component') {
            setActiveTool(tool);
        } else if (tool.action === 'navigate' && tool.navTarget) {
            if (tool.navTarget.initialTab) {
                if (tool.navTarget.view === 'chat') setInitialChatTab(tool.navTarget.initialTab);
                if (tool.navTarget.view === 'logbook') setInitialLogbookTab(tool.navTarget.initialTab);
            }
            setActiveView(tool.navTarget.view);
        } else if (tool.action === 'function' && tool.functionSlug) {
            onViewPost(tool.functionSlug);
        } else if (tool.action === 'external_link' && tool.externalUrl) {
            window.open(tool.externalUrl, '_blank');
        } else if (tool.action === 'function' && tool.onClick) {
            tool.onClick();
        }
    };
    
    if (activeTool && activeTool.component) {
        const ActiveComponent = activeTool.component;
        return <ActiveComponent onBack={() => setActiveTool(null)} onLogActivity={onLogActivity} />;
    }

    const categories = ['Training', 'Planners & Info', 'Community', 'Gas Management', 'Dive Planning', 'Dive Tables', 'Utilities'] as const;

    return (
        <section className="w-full animate-fade-in space-y-8">
            <h2 className="font-heading font-bold text-3xl text-center">Tools Hub</h2>
            
            {categories.map(category => (
                <div key={category}>
                    <h3 className="font-heading font-semibold text-2xl mb-4">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ALL_TOOLS.filter(t => t.category === category).map(tool => (
                            <ToolCard key={tool.id} tool={tool} onSelect={() => handleSelect(tool)} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
};

export default ToolsHubView;
