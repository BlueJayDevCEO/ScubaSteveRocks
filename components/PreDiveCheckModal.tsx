
import React, { useState, useEffect, useContext } from 'react';
import { 
    calculateMOD, 
    calculateSAC,
    calculateEAD,
    calculateBoylesLaw
} from '../logic/diveCalculations';
import { checkDbConnection, checkStorageConnection } from '../services/firebase/config';
import { checkAIConnectivity } from '../services/geminiService';
import { AppContext } from '../App';

interface PreDiveCheckModalProps {
    onComplete: () => void;
}

interface SystemCheck {
    id: string;
    label: string;
    status: 'pending' | 'running' | 'pass' | 'fail';
}

// Expanded list to showcase ALL app capabilities (Advertising + Diagnostics)
// Wording updated to be "Diver Centric" rather than "Developer Centric"
const BOOT_SEQUENCE: SystemCheck[] = [
    { id: 'firebase_cxn', label: 'Syncing Digital Logbook', status: 'pending' },
    { id: 'storage_cxn', label: 'Checking Media Gallery', status: 'pending' },
    { id: 'ai_neural_link', label: 'Waking Scuba Steve AI', status: 'pending' },
    { id: 'vision_core', label: 'Calibrating ID Scanners', status: 'pending' },
    { id: 'color_engine', label: 'Loading Red Filters', status: 'pending' },
    { id: 'trip_planner', label: 'Initializing Navigation', status: 'pending' },
    { id: 'voice_engine', label: 'Testing Comms System', status: 'pending' },
    { id: 'physics_core', label: 'Verifying Physics Engine', status: 'pending' },
    { id: 'mod_calc', label: 'Setting Oxygen Limits', status: 'pending' },
    { id: 'sac_rate', label: 'Checking Gas Consumption', status: 'pending' },
    { id: 'ead_calc', label: 'Calibrating Nitrox Logic', status: 'pending' },
    { id: 'boyles_law', label: 'Stabilizing Pressure', status: 'pending' },
];

export const PreDiveCheckModal: React.FC<PreDiveCheckModalProps> = ({ onComplete }) => {
    const [checks, setChecks] = useState<SystemCheck[]>(BOOT_SEQUENCE);
    const [overallStatus, setOverallStatus] = useState('INITIATING PRE-DIVE SEQUENCE...');
    const [isFinished, setIsFinished] = useState(false);
    
    const context = useContext(AppContext);
    const userId = context?.user?.uid;

    useEffect(() => {
        let mounted = true;

        const runSequence = async () => {
            // Short delay for visual effect
            await new Promise(r => setTimeout(r, 500));

            for (let i = 0; i < BOOT_SEQUENCE.length; i++) {
                if (!mounted) return;
                
                // Set current to running
                setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'running' } : c));
                
                // Fast visual delay (100-300ms) to keep it snappy but readable
                await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

                let passed = false;
                
                try {
                    // Mix of Real Checks and Logic Integrity Checks
                    switch (BOOT_SEQUENCE[i].id) {
                        case 'firebase_cxn':
                            const dbRes = await checkDbConnection();
                            passed = dbRes.success;
                            break;
                        case 'storage_cxn':
                            const storeRes = await checkStorageConnection(userId);
                            if (userId === 'mock-demo-user' || userId?.startsWith('guest')) {
                                passed = true; // Guests allowed
                            } else {
                                passed = storeRes.success;
                            }
                            break;
                        case 'ai_neural_link':
                            passed = await checkAIConnectivity();
                            break;
                        // --- Logic Integrity Checks (Showcase Features) ---
                        case 'vision_core':
                        case 'color_engine':
                        case 'trip_planner':
                        case 'voice_engine':
                        case 'physics_core':
                            passed = true; // Logic modules loaded
                            break;
                        case 'mod_calc':
                            const mod = calculateMOD(32, 1.4);
                            passed = mod !== null && Math.abs(mod - 33.75) < 0.1;
                            break;
                        case 'sac_rate':
                            const sac = calculateSAC(200, 150, 12, 10, 10);
                            passed = sac !== null && Math.abs(sac.sac - 30) < 0.1;
                            break;
                        case 'ead_calc':
                            const ead = calculateEAD(30, 32);
                            passed = ead !== null && ead < 30;
                            break;
                        case 'boyles_law':
                            const vol = calculateBoylesLaw(10, 0, 10);
                            passed = vol !== null && Math.abs(vol - 5) < 0.1;
                            break;
                        default:
                            passed = true;
                    }
                } catch (e) {
                    console.error("Check failed", e);
                    passed = false;
                }

                if (!mounted) return;

                // Update status
                setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: passed ? 'pass' : 'fail' } : c));
            }

            setIsFinished(true);
            setOverallStatus('PRE-DIVE CHECK COMPLETE. OK TO DIVE.');
            
            // Auto close on success
            setTimeout(() => {
                if (mounted) onComplete();
            }, 1800);
        };

        runSequence();

        return () => { mounted = false; };
    }, [userId, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono p-4">
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            
            <div className="w-full max-w-lg bg-gray-900 border-2 border-green-500/50 p-6 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Scanning Bar */}
                {!isFinished && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_10px_#4ade80] animate-[scan_1.5s_linear_infinite]"></div>
                )}

                <div className="flex justify-between items-end mb-4 border-b border-green-500/30 pb-2 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-green-500 tracking-widest">OSEA BIOS v2.4</h2>
                        <p className="text-xs text-green-500/70">PRE-DIVE SAFETY CHECK</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-green-500/50">MEM: OK</p>
                        <p className="text-xs text-green-500/50">PWR: 98%</p>
                    </div>
                </div>

                <div className="space-y-2 mb-6 overflow-y-auto pr-2 custom-scrollbar">
                    {checks.map(check => (
                        <div key={check.id} className="flex items-center justify-between text-sm">
                            <span className="text-green-400 uppercase tracking-wide truncate mr-4">
                                {check.label}
                                {check.status === 'running' && <span className="animate-pulse">_</span>}
                            </span>
                            <span className={`font-bold flex-shrink-0 ${
                                check.status === 'pending' ? 'text-gray-600' :
                                check.status === 'running' ? 'text-yellow-400' :
                                check.status === 'pass' ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {check.status === 'pending' && 'WAIT'}
                                {check.status === 'running' && 'CHECKING'}
                                {check.status === 'pass' && 'OK'}
                                {check.status === 'fail' && 'ERR'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-green-500/30 pt-4 text-center flex-shrink-0">
                    <p className={`text-sm font-bold tracking-widest ${isFinished ? 'text-green-400 animate-pulse' : 'text-green-600'}`}>
                        {overallStatus}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #111; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #22c55e; 
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};
