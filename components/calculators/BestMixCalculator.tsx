
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateBestMix, calculateMOD, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const bestMixInfo = (
    <>
        <InfoSection title="What is the 'Best Mix'?">
            <p>The "Best Mix" is the Nitrox mix with the highest possible oxygen percentage for your planned depth, without exceeding your chosen Partial Pressure of Oxygen (PPO₂) safety limit. Using the highest safe O₂ level minimizes your nitrogen absorption, which can extend your no-decompression time and reduce narcosis.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>Based on your planned maximum depth and your personal PPO₂ limit (e.g., 1.4 ATA), this calculator determines the maximum fraction of oxygen your breathing gas can contain. It then provides the corresponding Nitrox percentage, rounded down to the nearest whole number, as dive shops typically blend to whole percentages.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Best O₂% = (PPO₂ Limit / Pressure at Depth in ATA) * 100</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>PPO₂ Limit:</strong> Your maximum acceptable partial pressure of oxygen.</li>
                <li><strong>Pressure at Depth:</strong> (Depth in meters / 10) + 1.</li>
            </ul>
        </InfoSection>
    </>
);


export const BestMixCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [depth, setDepth] = useState('');
    const [po2, setPo2] = useState('1.4');
    const [result, setResult] = useState<{ o2: number, mod: number } | null>(null);

    const depthUnit = units === 'metric' ? 'meters' : 'feet';

    const handleCalculate = () => {
        const d = parseFloat(depth);
        const p = parseFloat(po2);

        if (isNaN(d) || isNaN(p) || d <= 0) {
            setResult(null);
            return;
        }

        const depthM = units === 'metric' ? d : feetToMeters(d);
        const bestMixO2 = calculateBestMix(depthM, p);

        if (bestMixO2 !== null) {
            const modForMix = calculateMOD(bestMixO2, p);
            if (modForMix !== null) {
                setResult({ o2: bestMixO2, mod: modForMix });
            } else {
                setResult(null);
            }
        } else {
            setResult(null);
        }
    };
    
    return (
        <CalculatorShell title="Best Nitrox Mix" onBack={onBack} infoContent={bestMixInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Planned Depth (${depthUnit})`} value={depth} onChange={setDepth} />
                 <div className="flex flex-col">
                     <div className="flex items-center gap-1 mb-1">
                        <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80">PPO₂ Limit</label>
                        <Tooltip text="Partial Pressure of Oxygen. 1.4 ATA is the standard limit for recreational diving, while 1.6 ATA is the maximum for decompression stops.">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.166.362-2.221.954-3.076" /></svg>
                        </Tooltip>
                    </div>
                    <input type="number" step="0.1" value={po2} onChange={e => setPo2(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
                </div>
            </div>
             <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Recommended Mix</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <p className="text-sm text-light-text/70 dark:text-dark-text/70">Best Nitrox Mix</p>
                            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">{result.o2}<span className="text-2xl">% O₂</span></p>
                        </div>
                         <div>
                            <p className="text-sm text-light-text/70 dark:text-dark-text/70">MOD for this Mix</p>
                            <p className="text-lg font-bold">
                                {result.mod.toFixed(1)} m / {metersToFeet(result.mod).toFixed(0)} ft
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </CalculatorShell>
    );
};

const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void}> = ({label, value, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
    </div>
);
