
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { calculateWeighting, kgToLbs, lbsToKg } from '../../logic/diveCalculations';
import { InfoSection } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';
type SuitType = 'none' | '3mm' | '5mm' | '7mm' | 'drysuit';
type WaterType = 'salt' | 'fresh';

const weightingInfo = (
    <>
        <InfoSection title="What is this?">
            <p>This calculator provides an <strong>starting estimate</strong> for the amount of weight you need to be neutrally buoyant. Proper weighting is crucial for safety, comfort, and protecting the marine environment.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>It uses a common rule-of-thumb formula based on a percentage of your body weight, adjusted for the type of exposure suit you're wearing and the type of water (salt or fresh). Saltwater is denser, so you need more weight to sink compared to freshwater.</p>
        </InfoSection>
        <InfoSection title="Important Disclaimer">
            <p>This is only an estimate. Many factors affect your buoyancy, including your personal body composition, the specific type of suit, your tank material (steel vs. aluminum), and other gear. <strong>Always perform a proper buoyancy check at the surface with an empty tank (50 bar / 500 psi) before your dive to fine-tune your weighting.</strong></p>
        </InfoSection>
    </>
);

const SUIT_OPTIONS: { id: SuitType, label: string }[] = [
    { id: 'none', label: 'Rashguard / Swimsuit' },
    { id: '3mm', label: '3mm Wetsuit' },
    { id: '5mm', label: '5mm Wetsuit' },
    { id: '7mm', label: '7mm Wetsuit' },
    { id: 'drysuit', label: 'Drysuit' },
];

export const WeightingCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [bodyWeight, setBodyWeight] = useState('');
    const [suitType, setSuitType] = useState<SuitType>('5mm');
    const [waterType, setWaterType] = useState<WaterType>('salt');
    
    const [result, setResult] = useState<{ minKg: number; maxKg: number } | null>(null);

    const handleCalculate = () => {
        const weight = parseFloat(bodyWeight);
        if (isNaN(weight) || weight <= 0) {
            setResult(null);
            return;
        }

        const bodyWeightKg = units === 'metric' ? weight : lbsToKg(weight);
        const weightingResult = calculateWeighting(bodyWeightKg, suitType, waterType);
        setResult(weightingResult);
    };

    const weightUnit = units === 'metric' ? 'kg' : 'lbs';

    return (
        <CalculatorShell title="Weighting Calculator" onBack={onBack} infoContent={weightingInfo}>
             <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Your Body Weight (${weightUnit})`} value={bodyWeight} onChange={setBodyWeight} />
                
                <div>
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">Exposure Suit</label>
                    <select value={suitType} onChange={e => setSuitType(e.target.value as SuitType)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md">
                        {SUIT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-2">Water Type</label>
                    <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                        <button onClick={() => setWaterType('salt')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-full ${waterType === 'salt' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Saltwater</button>
                        <button onClick={() => setWaterType('fresh')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-full ${waterType === 'fresh' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Freshwater</button>
                    </div>
                </div>
            </div>

            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>
            
            {result && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Estimated Starting Weight</h4>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                        {result.minKg.toFixed(1)} - {result.maxKg.toFixed(1)} kg
                    </p>
                    <p className="text-xl font-semibold text-light-text/80 dark:text-dark-text/80">
                        {kgToLbs(result.minKg).toFixed(1)} - {kgToLbs(result.maxKg).toFixed(1)} lbs
                    </p>
                    <p className="mt-4 text-sm text-light-text/70 dark:text-dark-text/70 italic">
                        <strong>Disclaimer:</strong> This is an estimate and a starting point only. Always perform a proper buoyancy check at the surface with an empty tank before your dive.
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
