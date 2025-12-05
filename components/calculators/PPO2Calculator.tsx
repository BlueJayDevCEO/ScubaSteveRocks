
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculatePPO2, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const ppo2Info = (
    <>
        <InfoSection title="What is PPO₂?">
            <p>The Partial Pressure of Oxygen (PPO₂) is the pressure exerted by just the oxygen component of your breathing gas at a specific depth. Monitoring PPO₂ is one of the most critical safety aspects of diving with Nitrox.</p>
        </InfoSection>
        <InfoSection title="Why is it Important?">
            <p>Breathing oxygen at high partial pressures can lead to Central Nervous System (CNS) Oxygen Toxicity, a serious condition that can cause convulsions and drowning. Divers must keep their PPO₂ within safe limits: typically no more than <strong>1.4 ATA</strong> during the main part of the dive, and an absolute maximum of <strong>1.6 ATA</strong> during decompression stops.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>PPO₂ = O₂ Fraction × Pressure in ATA</Formula>
            <ul className="list-disc list-inside text-sm">
                 <li><strong>O₂ Fraction:</strong> The percentage of oxygen in your tank, as a decimal (e.g., 32% is 0.32).</li>
                <li><strong>Pressure in ATA:</strong> (Depth in meters / 10) + 1.</li>
            </ul>
        </InfoSection>
    </>
);


export const PPO2Calculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [depth, setDepth] = useState('');
    const [o2Percent, setO2Percent] = useState('32');
    const [result, setResult] = useState<number | null>(null);

    const depthUnit = units === 'metric' ? 'meters' : 'feet';

    const handleCalculate = () => {
        const d = parseFloat(depth);
        const o2 = parseFloat(o2Percent);

        if (isNaN(d) || isNaN(o2)) {
            setResult(null);
            return;
        }

        const depthM = units === 'metric' ? d : feetToMeters(d);
        const ppo2Result = calculatePPO2(depthM, o2);
        setResult(ppo2Result);
    };

    const getResultColor = () => {
        if (result === null) return '';
        if (result > 1.6) return 'text-red-500';
        if (result > 1.4) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-green-500 dark:text-green-400';
    };

    return (
        <CalculatorShell title="Partial Pressure of Oxygen (PPO₂)" onBack={onBack} infoContent={ppo2Info}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Depth (${depthUnit})`} value={depth} onChange={setDepth} />
                <InputField label="Oxygen Percentage (%)" value={o2Percent} onChange={setO2Percent} />
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Partial Pressure of Oxygen</h4>
                    <p className={`text-3xl font-bold ${getResultColor()}`}>
                        {result.toFixed(2)}
                        <span className="text-xl"> ATA</span>
                    </p>
                    <p className={`text-sm mt-2 font-semibold ${getResultColor()}`}>
                        {result > 1.6 ? "DANGER: Exceeds maximum limit." : result > 1.4 ? "CAUTION: Exceeds recreational limit." : "Within safe recreational limits."}
                    </p>
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
