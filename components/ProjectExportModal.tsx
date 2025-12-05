import React, { useState } from 'react';
import { zip, strToU8 } from 'fflate';

interface ProjectExportModalProps {
  onClose: () => void;
}

// Comprehensive list of all files in the project to fetch
const FILE_LIST = [
    'index.html',
    'index.tsx',
    'metadata.json',
    'App.tsx',
    'types.ts',
    'firestore.rules',
    'storage.rules',
    'services/geminiService.ts',
    'services/i18n.ts',
    'services/userService.ts',
    'services/jobService.ts',
    'services/chatService.ts',
    'services/backendService.ts',
    'services/visitorService.ts',
    'services/firebase/auth.ts',
    'services/firebase/config.ts',
    'services/firebase/usageService.ts',
    'services/marineSightings.ts',
    'services/configService.ts',
    'data/blogData.ts',
    'logic/diveCalculations.ts',
    'logic/diveTables.ts',
    'components/Header.tsx',
    'components/Footer.tsx',
    'components/Hero.tsx',
    'components/NavigationBar.tsx',
    'components/FloatingChatButton.tsx',
    'components/ScubaSteveLogo.tsx',
    'components/LoginPage.tsx',
    'components/ProfileModal.tsx',
    'components/ShopModal.tsx',
    'components/LegalModal.tsx',
    'components/LegalAcceptanceModal.tsx',
    'components/LimitReachedModal.tsx',
    'components/ChatLimitReachedModal.tsx',
    'components/ConfirmationToast.tsx',
    'components/GlobalLoader.tsx',
    'components/GlobalStyles.tsx',
    'components/LoadingIndicator.tsx',
    'components/SkeletonLoader.tsx',
    'components/Tooltip.tsx',
    'components/ShareButton.tsx',
    'components/SocialShareButtons.tsx',
    'components/DonationBanner.tsx',
    'components/FeatureBlocks.tsx',
    'components/InputSection.tsx',
    'components/ResultDisplay.tsx',
    'components/ResultDisplaySkeleton.tsx',
    'components/Chat.tsx',
    'components/VoiceChatView.tsx',
    'components/ColorCorrectionView.tsx',
    'components/ImageComparator.tsx',
    'components/ImageComparatorSkeleton.tsx',
    'components/ContributionsLog.tsx',
    'components/DiveLogImporter.tsx',
    'components/ImportedDiveDetailView.tsx',
    'components/EditableDiveLogDetails.tsx',
    'components/SightingMapView.tsx',
    'components/SightingMapSkeleton.tsx',
    'components/PartnerPortalView.tsx',
    'components/InstantDemo.tsx',
    'components/PricingSection.tsx',
    'components/AffiliateSection.tsx',
    'components/PaymentGatewayModal.tsx',
    'components/PublishModal.tsx',
    'components/OnboardingGuide.tsx',
    'components/AdminDashboard.tsx',
    'components/AdminUserDetailView.tsx',
    'components/CountdownTimer.tsx',
    'components/JobResultContainer.tsx',
    'components/SimulationInfoModal.tsx',
    'components/legal/Content.tsx',
    'components/views/ViewShell.tsx',
    'components/views/HomeView.tsx',
    'components/views/IdentifyView.tsx',
    'components/views/ChatView.tsx',
    'components/ToolsHubView.tsx',
    'components/ToolsView.tsx',
    'components/TopicsView.tsx',
    'components/BlogView.tsx',
    'components/ScubaNewsView.tsx',
    'components/DiveTrainingGameView.tsx',
    'components/DiveSiteLookup.tsx',
    'components/DiveSiteBriefingSkeleton.tsx',
    'components/DiveTripPlannerView.tsx',
    'components/DiveTripPlanSkeleton.tsx',
    'components/SurfaceIntervalView.tsx',
    'components/LiveReportView.tsx',
    'components/calculators/CalculatorShell.tsx',
    'components/calculators/InfoContent.tsx',
    'components/calculators/InfoModal.tsx',
    'components/calculators/SACCalculator.tsx',
    'components/calculators/MODCalculator.tsx',
    'components/calculators/EADCalculator.tsx',
    'components/calculators/BestMixCalculator.tsx',
    'components/calculators/PPO2Calculator.tsx',
    'components/calculators/WeightingCalculator.tsx',
    'components/calculators/UnitConverter.tsx',
    'components/calculators/GasConsumptionCalculator.tsx',
    'components/calculators/DiveTablesCalculator.tsx',
    'components/calculators/DiveTablesImagesModal.tsx',
    'components/calculators/PressureGroupCalculator.tsx',
    'components/calculators/SurfaceIntervalCalculator.tsx',
    'components/calculators/RepetitiveDiveCalculator.tsx',
    'components/calculators/DepthCorrectionCalculator.tsx',
    'components/calculators/BoylesLawCalculator.tsx',
    'components/calculators/TimeRemainingCalculator.tsx',
    'components/calculators/GasBlenderCalculator.tsx',
    'components/calculators/SystemDiagnostics.tsx',
    'components/ProjectExportModal.tsx',
    'package.json',
    'vite.config.ts',
    'tsconfig.json'
];

const HULL_PROMPT_HEADER = `
**Role:** Senior Frontend Architect & UI/UX Expert.

**Project:** "Scuba Steve AI™ (OSEA Diver™)"

**Objective:** 
Rebuild an existing, fully functional Single Page Application (SPA) exactly as it is designed.

**Architecture Constraints (Vite + React):**
1.  **Build System:** This is a **Vite** project. Use \`package.json\` scripts (\`dev\`, \`build\`) and standard Node module resolution.
2.  **Module System:** Use **ES Modules (ESM)** with standard imports (e.g., \`import React from 'react'\`).
3.  **Styling:** Tailwind CSS is used via CDN (for simplicity) or PostCSS. Ensure \`index.html\` includes the Tailwind script or stylesheet.
4.  **Routing:** Use internal state-based routing (e.g., \`const [activeView, setActiveView] = useState('home')\`). Do not use React Router.
5.  **Data Persistence:** All personal data (User profile, Dive Logs) must persist in \`localStorage\`. Shared data uses Firestore.
6.  **AI Integration:** Use the Google GenAI SDK (\`@google/genai\`) initialized with \`process.env.API_KEY\` (defined in \`vite.config.ts\`).

**Core Features to Implement:**
1.  **Marine ID:** Drag-and-drop image analysis using Gemini Vision.
2.  **Color Correction:** Canvas/AI-based underwater photo restoration.
3.  **Dive Tools:** Functional calculators for SAC, MOD, EAD, and Nitrox blending.
4.  **Live Voice Chat:** Real-time audio interaction using Gemini Live API (WebSockets).
5.  **Logbook:** Local storage-based dive logging with CSV import.
6.  **Gamification:** "Dive Training Game" with XP and leveling system.

**Visual Style:**
*   **Theme:** Ocean-inspired (Deep blues, cyans, glassmorphism).
*   **Mode:** Light/Dark mode support via Tailwind \`dark:\` classes.
*   **Animations:** CSS keyframes for bubbles and sonar effects.

**Instruction:**
I will now provide the full source code for the application files. Please ingest these files and reconstruct the project structure exactly as shown.

--- FILE CONTENTS START ---
`;

export const ProjectExportModal: React.FC<ProjectExportModalProps> = ({ onClose }) => {
    const [status, setStatus] = useState('idle'); // idle, gathering, ready, error, manual
    const [progress, setProgress] = useState(0);
    const [fileData, setFileData] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    const gatherFiles = async () => {
        setStatus('gathering');
        setProgress(0);
        setError(null);
        const data: Record<string, string> = {};
        
        try {
            for (let i = 0; i < FILE_LIST.length; i++) {
                const path = FILE_LIST[i];
                // We assume the files are served at root relative paths
                const response = await fetch(path);
                if (!response.ok) {
                    console.warn(`Could not fetch ${path}: ${response.statusText}`);
                    // Add a placeholder comment so manual copy is easier to spot
                    data[path] = `// ERROR: Could not fetch file ${path} automatically. Please copy content manually.`;
                } else {
                    const text = await response.text();
                    data[path] = text;
                }
                setProgress(Math.round(((i + 1) / FILE_LIST.length) * 100));
            }
            setFileData(data);
            setStatus('ready');
        } catch (e) {
            console.error(e);
            setError("Auto-fetch failed (likely due to preview environment security). Switched to Manual Mode.");
            setStatus('manual');
        }
    };

    const handleDownloadZip = () => {
        if (Object.keys(fileData).length === 0) return;

        const zipData: Record<string, Uint8Array> = {};
        for (const [path, content] of Object.entries(fileData)) {
            const uint8 = strToU8(content);
            zipData[path] = uint8;
        }

        zip(zipData, (err, data) => {
            if (err) {
                setError("Failed to create ZIP file.");
                return;
            }
            const blob = new Blob([data], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scuba-steve-source.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    const handleCopyPrompt = () => {
        if (Object.keys(fileData).length === 0) return;

        let fullText = HULL_PROMPT_HEADER + '\n\n';
        
        for (const [path, content] of Object.entries(fileData)) {
            fullText += `--- START OF FILE ${path} ---\n\n${content}\n\n`;
        }

        navigator.clipboard.writeText(fullText).then(() => {
            alert("Copied to clipboard! Paste this entire block into your new AI Studio session.");
        }).catch(err => {
            console.error(err);
            setError("Failed to copy to clipboard. File might be too large.");
        });
    };
    
    const handleCopyHeaderOnly = () => {
        navigator.clipboard.writeText(HULL_PROMPT_HEADER);
        alert("Header Copied! Now paste it into the other AI, then copy-paste your files one by one below it.");
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-bold text-2xl text-light-text dark:text-dark-text">Export / Migrate App</h2>
                    <button onClick={onClose} className="text-2xl text-light-text/70 dark:text-dark-text/70 hover:text-light-accent">&times;</button>
                </div>

                <p className="mb-6 text-light-text/80 dark:text-dark-text/80">
                    Moving to another AI Studio? Use this tool to grab all the code at once.
                </p>

                {status === 'idle' && (
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={gatherFiles} 
                            className="w-full bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-xl py-4 rounded-lg hover:scale-105 transition-transform shadow-lg"
                        >
                            Start Auto-Migration
                        </button>
                        <button 
                            onClick={() => setStatus('manual')}
                            className="text-sm text-light-text/60 dark:text-dark-text/60 hover:underline"
                        >
                            Switch to Manual Mode (if auto fails)
                        </button>
                    </div>
                )}

                {status === 'gathering' && (
                    <div className="text-center py-8">
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-2 overflow-hidden">
                            <div className="bg-light-accent h-4 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="font-mono text-sm">Bundling files... {progress}%</p>
                    </div>
                )}

                {status === 'ready' && (
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleCopyPrompt}
                            className="w-full bg-green-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-green-500 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy Full AI Prompt
                        </button>
                        <p className="text-xs text-center opacity-70">
                            (Paste this directly into the new AI Studio chat)
                        </p>
                        
                        <div className="h-px bg-black/10 dark:bg-white/10 my-2"></div>

                        <button 
                            onClick={handleDownloadZip}
                            className="w-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-light-accent/50 font-bold text-lg py-3 rounded-lg hover:bg-light-accent/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Source Code (.zip)
                        </button>
                    </div>
                )}

                {status === 'manual' && (
                    <div className="flex flex-col gap-4">
                        <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm">
                            <strong>Auto-fetch blocked.</strong> Copy the header below, paste it into the new AI, then manually copy-paste your files one by one.
                        </div>
                        <textarea 
                            readOnly 
                            className="w-full h-48 p-2 text-xs font-mono bg-black/5 dark:bg-white/5 rounded border border-black/10 dark:border-white/10"
                            value={HULL_PROMPT_HEADER}
                        />
                        <button 
                            onClick={handleCopyHeaderOnly}
                            className="w-full bg-light-accent dark:bg-dark-accent text-white font-bold py-2 rounded-lg"
                        >
                            Copy Header Text
                        </button>
                        <div className="text-xs text-left mt-2">
                            <p className="font-bold">Critical Files to Copy:</p>
                            <ul className="list-disc list-inside grid grid-cols-2 gap-1 mt-1">
                                <li>index.html</li>
                                <li>index.tsx</li>
                                <li>App.tsx</li>
                                <li>components/GlobalStyles.tsx</li>
                                <li>services/geminiService.ts</li>
                            </ul>
                        </div>
                    </div>
                )}

                {error && status !== 'manual' && (
                    <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-center text-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};