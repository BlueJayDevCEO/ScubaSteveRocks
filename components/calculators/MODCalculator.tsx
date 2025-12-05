
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateMOD, metersToFeet } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';
import { Briefing } from '../../types';

const modInfo = (
    <>
        <InfoSection title="What is MOD?">
            <p>The Maximum Operating Depth (MOD) is the deepest depth you can safely dive to with a specific Nitrox (or other gas) mix before the partial pressure of oxygen (PPO₂) in the mix becomes dangerously high, risking oxygen toxicity.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>This calculator determines the depth at which the PPO₂ of your breathing gas will reach your chosen safety limit (e.g., 1.4 ATA for a recreational dive). Diving deeper than the MOD is extremely dangerous.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>MOD (meters) = [(PPO₂ Limit / O₂ Fraction) - 1] * 10</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>PPO₂ Limit:</strong> Your maximum acceptable partial pressure of oxygen (e.g., 1.4).</li>
                <li><strong>O₂ Fraction:</strong> The percentage of oxygen in your tank, expressed as a decimal (e.g., 32% is 0.32).</li>
            </ul>
        </InfoSection>
    </>
);

export const MODCalculator: React.FC<{ onBack: () => void, onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void }> = ({ onBack, onLogActivity }) => {
    const [o2Percent, setO2Percent] = useState('32');
    const [po2, setPo2] = useState('1.4');
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const o2 = parseFloat(o2Percent);
        const p = parseFloat(po2);

        if (isNaN(o2) || isNaN(p)) {
            setResult(null);
            return;
        }

        const modResult = calculateMOD(o2, p);
        setResult(modResult);

        if (modResult !== null && onLogActivity) {
            const formattedResult = `${modResult.toFixed(1)} m / ${metersToFeet(modResult).toFixed(0)} ft`;
            onLogActivity('calculator', {
                 calculatorData: {
                    title: `MOD (${o2}% O₂)`,
                    result: formattedResult
                }
            }, `Calculated Max Operating Depth for ${o2}% Oxygen with PPO2 limit of ${p}.`);
        }
    };
    
    return (
        <CalculatorShell title="Maximum Operating Depth (MOD)" onBack={onBack} infoContent={modInfo}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Oxygen Percentage (%)" value={o2Percent} onChange={setO2Percent} />
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
                    <h4 className="font-semibold text-lg mb-2">Max Operating Depth</h4>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">{result.toFixed(1)} <span className="text-xl">meters</span></p>
                    <p className="text-xl font-bold text-light-text/80 dark:text-dark-text/80">{metersToFeet(result).toFixed(0)} <span className="text-base">feet</span></p>
                    <p className="text-center text-xs text-green-600 dark:text-green-400 mt-2">✅ Saved to Logbook</p>
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
)
