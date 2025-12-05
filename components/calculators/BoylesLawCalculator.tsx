
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { calculateBoylesLaw, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const boylesInfo = (
    <>
        <InfoSection title="What is Boyle's Law?">
            <p>Boyle's Law is a fundamental principle in dive physics. It states that for a fixed amount of gas at a constant temperature, the volume of the gas is inversely proportional to the pressure. In simple terms: as pressure increases, volume decreases, and vice-versa.</p>
        </InfoSection>
        <InfoSection title="How it Works for Divers">
            <p>This law directly affects flexible air spaces like your lungs, BCD, drysuit, and lift bags. For example, if you take a balloon from the surface (1 ATA) down to 10 meters (2 ATA), its volume will be halved. This calculator demonstrates that relationship.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Final Volume = Initial Volume × (Initial Pressure / Final Pressure)</Formula>
            <p className="text-sm">Where pressure is measured in atmospheres absolute (ATA). This is often written as P₁V₁ = P₂V₂.</p>
        </InfoSection>
    </>
);


export const BoylesLawCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [initialVolume, setInitialVolume] = useState('10');
    const [initialDepth, setInitialDepth] = useState('0');
    const [finalDepth, setFinalDepth] = useState('10');
    const [result, setResult] = useState<number | null>(null);

    const depthUnit = units === 'metric' ? 'm' : 'ft';

    const handleCalculate = () => {
        const iVol = parseFloat(initialVolume);
        const iDepth = parseFloat(initialDepth);
        const fDepth = parseFloat(finalDepth);

        if ([iVol, iDepth, fDepth].some(isNaN)) {
            setResult(null);
            return;
        }

        const iDepthM = units === 'metric' ? iDepth : feetToMeters(iDepth);
        const fDepthM = units === 'metric' ? fDepth : feetToMeters(fDepth);

        const finalVolume = calculateBoylesLaw(iVol, iDepthM, fDepthM);
        setResult(finalVolume);
    };

    return (
        <CalculatorShell title="Boyle's Law Calculator" onBack={onBack} infoContent={boylesInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Calculates how the volume of a flexible air space (like in a lift bag or drysuit) changes with depth.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Initial Volume (any unit)" value={initialVolume} onChange={setInitialVolume} />
                <InputField label={`Initial Depth (${depthUnit})`} value={initialDepth} onChange={setInitialDepth} />
                <InputField label={`Final Depth (${depthUnit})`} value={finalDepth} onChange={setFinalDepth} />
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Resulting Volume</h4>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                        {result.toFixed(2)}
                        <span className="text-xl"> units</span>
                    </p>
                    <p className="text-sm mt-2 text-light-text/70 dark:text-dark-text/70 italic">
                        The final volume is in the same unit you used for the initial volume.
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
