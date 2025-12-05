
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateEAD, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const eadInfo = (
    <>
        <InfoSection title="What is EAD?">
            <p>The Equivalent Air Depth (EAD) tells you the depth you would need to be at while breathing air (21% O₂) to experience the same level of nitrogen narcosis as you are experiencing at your current depth on a given Nitrox mix.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>Since Nitrox has less nitrogen than air, the narcotic effect is reduced. The EAD helps divers use standard air dive tables for planning Nitrox dives by providing an "equivalent" depth that accounts for the lower nitrogen partial pressure. A shallower EAD means less narcosis.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>EAD (meters) = [((1 - O₂ Fraction) / 0.79) * (Depth + 10)] - 10</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>O₂ Fraction:</strong> The percentage of oxygen in your tank, as a decimal (e.g., 32% is 0.32).</li>
                <li><strong>0.79:</strong> The fraction of nitrogen in standard air.</li>
                <li><strong>Depth:</strong> Your actual planned depth in meters.</li>
            </ul>
        </InfoSection>
    </>
);

export const EADCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
        const eadResult = calculateEAD(depthM, o2);
        setResult(eadResult);
    };
    
    return (
        <CalculatorShell title="Equivalent Air Depth (EAD)" onBack={onBack} infoContent={eadInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Planned Depth (${depthUnit})`} value={depth} onChange={setDepth} />
                <InputField label="Oxygen Percentage (%)" value={o2Percent} onChange={setO2Percent} />
            </div>
             <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                        <h4 className="font-semibold text-lg">Equivalent Air Depth</h4>
                        <Tooltip text="EAD calculates the depth you would have to be at on air (21% O2) to experience the same nitrogen narcosis as your current depth on Nitrox.">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.166.362-2.221.954-3.076" /></svg>
                        </Tooltip>
                    </div>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                        {units === 'metric' ? result.toFixed(1) : metersToFeet(result).toFixed(0)}
                        <span className="text-xl"> {depthUnit}</span>
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
