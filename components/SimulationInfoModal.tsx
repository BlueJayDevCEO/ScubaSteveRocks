
import React from 'react';
import { ScubaSteveLogo } from './ScubaSteveLogo';

interface SimulationInfoModalProps {
  onClose: () => void;
}

export const SimulationInfoModal: React.FC<SimulationInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <ScubaSteveLogo className="w-12 h-12 rounded-lg" />
             <div>
                 <h2 className="font-heading font-bold text-2xl text-light-text dark:text-dark-text">Simulation Game Manual</h2>
                 <p className="text-sm text-light-text/70 dark:text-dark-text/70">Scuba Steve AI - High-Fidelity Simulation</p>
             </div>
          </div>
          <button onClick={onClose} className="text-2xl text-light-text/50 hover:text-light-text dark:text-dark-text/50 dark:hover:text-dark-text transition-colors">&times;</button>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm sm:text-base">
            <p className="lead">
                Scuba Steve AI is a high-fidelity simulation. Every choice involves real physics calculations for gas management, buoyancy, and decompression.
            </p>

            <h3 className="font-bold text-lg mt-4 mb-2 text-light-accent dark:text-dark-accent">1. Interface & Controls</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Planner:</strong> On mobile, toggle between MISSION and GEAR tabs. Confirm your weight configuration before diving.</li>
                <li><strong>Dive Log:</strong> The game now features a continuous scroll. Scroll up to review the entire mission history and Steve's previous advice.</li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2 text-light-accent dark:text-dark-accent">2. Progression System</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Ranking:</strong> You start as a "Novice". As you successfully complete dives, your "Dive Count" increases, unlocking ranks (Advanced, Divemaster, Legend).</li>
                <li><strong>Economy:</strong> Successful missions earn Credits. Use these in the Dive Shop to buy better tanks, regulators, and tech.</li>
                <li><strong>Unlocks:</strong> High-ranking divers gain access to lethal locations like Titan's Trench.</li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2 text-light-accent dark:text-dark-accent">3. Physics & Planning</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Weight & Buoyancy:</strong> You MUST configure your weight belt. Too light? You can't descend. Too heavy? You sink fast and burn 15% more air.</li>
                <li><strong>Gas Mixing (Nitrox):</strong> EAN 32/36 extends bottom time but lowers your Maximum Operating Depth (MOD). Exceeding MOD risks Oxygen Toxicity (Game Over).</li>
                <li><strong>Environment:</strong> "Stormy" weather reduces visibility. "Strong Current" increases exertion. Choose fins accordingly (e.g., Jet Fins for currents).</li>
            </ul>

            <h3 className="font-bold text-lg mt-4 mb-2 text-light-accent dark:text-dark-accent">4. Survival Mechanics</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>The Computer:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>Air Consumption:</strong> Calculated based on depth (ATA) and exertion (SAC rate). Panic or fast swimming burns air rapidly.</li>
                        <li><strong>Decompression:</strong> Ascending too fast reduces your Safety Score. If Safety hits 0, you suffer DCI (The Bends).</li>
                        <li><strong>Narrative AI:</strong> Scuba Steve adapts the story to your exact gear. If you wear a Shorty to 40m, he will narrate the freezing cold.</li>
                    </ul>
                </li>
                <li><strong>Rules of Engagement:</strong>
                     <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>Winning:</strong> Maintain Air > 0 and Safety > 0 for ~12 turns. Perform a safety stop when prompted.</li>
                        <li><strong>Losing:</strong> Running out of air or violating safety protocols results in a "Critical Failure".</li>
                        <li><strong>Aborting:</strong> It is always better to Abort (End Dive) than to die. You get a "Mission Incomplete" but keep your rank.</li>
                    </ul>
                </li>
            </ul>
            
            <div className="mt-6 p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-xs font-mono text-light-text/70 dark:text-dark-text/70 border border-black/5 dark:border-white/5">
                <strong>System Info:</strong> Powered by Google Gemini 2.5 Flash. Real-time JSON data streaming updates your game state (Air, Depth, Safety) based on narrative context.
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
            <a 
                href="https://scuba-steve-ai-game-483432894986.us-west1.run.app"
                target="_blank"
                rel="noopener noreferrer" 
                className="flex-1 sm:flex-none text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
                Launch Simulator 🎮
            </a>
            <button onClick={onClose} className="flex-1 sm:flex-none bg-light-accent dark:bg-dark-accent text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-colors">
                Got it
            </button>
        </div>
      </div>
    </div>
  );
};
