
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { calculateNitroxBlend, barToPsi, psiToBar } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const blenderInfo = (
    <>
        <InfoSection title="What is this?">
            <p>This calculator is used for gas blending, specifically for determining the final oxygen percentage when you "top up" a partially filled tank with another gas (most commonly, topping up a Nitrox tank with air).</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>It uses the principle of partial pressures. The final oxygen percentage is a weighted average of the initial gas and the added gas, based on their respective pressures.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Final O₂% = [ (Initial P × Initial O₂%) + (Added P × Top-Up O₂%) ] / Final P</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>P:</strong> Pressure.</li>
                <li><strong>Added P:</strong> Final Pressure - Initial Pressure.</li>
            </ul>
            <p className="text-sm mt-2">This calculation is crucial for ensuring your final mix is what you expect it to be. Always analyze your gas before diving.</p>
        </InfoSection>
    </>
);


export const GasBlenderCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [initialPressure, setInitialPressure] = useState('');
    const [initialO2, setInitialO2] = useState('32');
    const [finalPressure, setFinalPressure] = useState(units === 'metric' ? '200' : '3000');
    const [topUpO2, setTopUpO2] = useState('21'); // Air is default
    const [result, setResult] = useState<number | null>(null);

    const pressureUnit = units === 'metric' ? 'bar' : 'psi';
    
    React.useEffect(() => {
        setFinalPressure(units === 'metric' ? '200' : '3000');
    }, [units]);

    const handleCalculate = () => {
        const iP = units === 'metric' ? parseFloat(initialPressure) : psiToBar(parseFloat(initialPressure));
        const iO2 = parseFloat(initialO2);
        const fP = units === 'metric' ? parseFloat(finalPressure) : psiToBar(parseFloat(finalPressure));
        const tO2 = parseFloat(topUpO2);

        if ([iP, iO2, fP, tO2].some(isNaN)) {
            setResult(null);
            return;
        }

        const blendResult = calculateNitroxBlend(iP, iO2, fP, tO2);
        setResult(blendResult);
    };

    return (
        <CalculatorShell title="Gas Blender / Tank Top-Up" onBack={onBack} infoContent={blenderInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Calculates the final oxygen percentage when topping up a partially filled tank with another gas (e.g., air).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Initial Pressure (${pressureUnit})`} value={initialPressure} onChange={setInitialPressure} />
                <InputField label="Initial O₂ (%)" value={initialO2} onChange={setInitialO2} />
                <InputField label={`Final Pressure (${pressureUnit})`} value={finalPressure} onChange={setFinalPressure} />
                <InputField label="Top-Up Gas O₂ (%)" value={topUpO2} onChange={setTopUpO2} />
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Final Oxygen Percentage</h4>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                        {result.toFixed(1)}%
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
