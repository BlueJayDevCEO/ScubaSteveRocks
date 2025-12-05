
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateGasConsumption, barToPsi, psiToBar, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';
import { Briefing } from '../../types';

type UnitSystem = 'metric' | 'imperial';

const gasConsumptionInfo = (
    <>
        <InfoSection title="What is this?">
            <p>The Gas Consumption Calculator helps you plan a dive by predicting how much breathing gas you will need and what your tank pressure will be at the end of the dive. This is essential for ensuring you have enough gas to complete your dive safely, including a reserve.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>Using your known Surface Air Consumption (SAC) rate, this calculator determines how much gas you'll consume per minute at your planned depth (where the ambient pressure is higher). It then multiplies this by your planned dive time to find the total gas required.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Gas Needed = SAC Rate × Dive Time × Pressure in ATA</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>SAC Rate:</strong> Your personal gas consumption rate at the surface.</li>
                <li><strong>Dive Time:</strong> The planned duration of the dive in minutes.</li>
                <li><strong>Pressure in ATA:</strong> (Depth in meters / 10) + 1.</li>
                <li>The calculator then converts the "Gas Needed" from liters into bar/psi based on your tank size to find the final pressure.</li>
            </ul>
        </InfoSection>
    </>
);

export const GasConsumptionCalculator: React.FC<{ onBack: () => void, onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void }> = ({ onBack, onLogActivity }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [sac, setSac] = useState('');
    const [tankSize, setTankSize] = useState('11.1');
    const [depth, setDepth] = useState('');
    const [time, setTime] = useState('');
    const [startPressure, setStartPressure] = useState('');

    const [result, setResult] = useState<{ gasNeeded: number; endPressure: number } | null>(null);

    const pressureUnit = units === 'metric' ? 'bar' : 'psi';
    const volumeUnit = units === 'metric' ? 'Liters' : 'cu ft';
    const depthUnit = units === 'metric' ? 'meters' : 'feet';
    const sacUnit = units === 'metric' ? 'L/min' : 'cu ft/min';

    const handleCalculate = () => {
        const sacRate = units === 'metric' ? parseFloat(sac) : parseFloat(sac) * 28.3168; // ft³/min to L/min
        const tankL = parseFloat(tankSize); // Always in Liters
        const depthM = units === 'metric' ? parseFloat(depth) : feetToMeters(parseFloat(depth));
        const duration = parseFloat(time);
        const startP = units === 'metric' ? parseFloat(startPressure) : psiToBar(parseFloat(startPressure));

        if ([sacRate, tankL, depthM, duration, startP].some(isNaN)) {
            setResult(null);
            return;
        }

        const consumptionResult = calculateGasConsumption(sacRate, tankL, duration, depthM, startP);

        if (consumptionResult) {
             const finalGasNeeded = units === 'metric' ? consumptionResult.gasNeededLiters : consumptionResult.gasNeededLiters / 28.3168;
             const finalEndPressure = units === 'metric' ? consumptionResult.endPressureBar : barToPsi(consumptionResult.endPressureBar);
             
             setResult({
                gasNeeded: finalGasNeeded,
                endPressure: finalEndPressure,
            });

            if (onLogActivity) {
                onLogActivity('calculator', {
                    calculatorData: {
                        title: 'Gas Plan',
                        result: `End Pressure: ${finalEndPressure.toFixed(0)} ${pressureUnit}`
                    }
                }, `Planned dive to ${depthM.toFixed(1)}m for ${duration}min using SAC ${sacRate.toFixed(1)}. Needed: ${finalGasNeeded.toFixed(1)} ${volumeUnit}`);
            }
        } else {
            setResult(null);
        }
    };
    
    return (
        <CalculatorShell title="Gas Consumption Calculator" onBack={onBack} infoContent={gasConsumptionInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                    label={`SAC Rate (${sacUnit})`} 
                    value={sac} 
                    onChange={setSac} 
                    tooltip="Your Surface Air Consumption rate. You can calculate this using the SAC Rate calculator."
                />
                <InputField 
                    label="Tank Water Capacity (Liters)"
                    value={tankSize} 
                    onChange={setTankSize} 
                    tooltip="Enter the internal volume (water capacity) of your tank. Common sizes: Aluminum 80 (AL80) ≈ 11.1 L, Steel 100 ≈ 12.2 L."
                />
                <InputField label={`Planned Depth (${depthUnit})`} value={depth} onChange={setDepth} />
                <InputField label="Planned Time (min)" value={time} onChange={setTime} />
                <InputField label={`Start Pressure (${pressureUnit})`} value={startPressure} onChange={setStartPressure} className="md:col-span-2" />
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result && (
                <div className={`mt-6 p-4 rounded-lg animate-fade-in ${result.endPressure < (units === 'metric' ? 50 : 750) ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <h4 className="font-semibold text-lg mb-2">Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-light-text/70 dark:text-dark-text/70">Gas Needed</p>
                            <p className="text-3xl font-bold">{result.gasNeeded.toFixed(1)} <span className="text-xl">{volumeUnit}</span></p>
                        </div>
                        <div>
                            <p className="text-sm text-light-text/70 dark:text-dark-text/70">Est. End Pressure</p>
                            <p className="text-3xl font-bold">{result.endPressure.toFixed(0)} <span className="text-xl">{pressureUnit}</span></p>
                        </div>
                    </div>
                     <p className={`text-center font-bold text-lg mt-2 ${result.endPressure < (units === 'metric' ? 50 : 750) ? 'text-red-500' : 'text-green-600'}`}>
                        {result.endPressure < (units === 'metric' ? 50 : 750) ? 'Not Enough Gas for Reserve' : 'Gas Plan is OK'}
                    </p>
                    <p className="text-center text-xs text-green-600 dark:text-green-400 mt-2">✅ Saved to Logbook</p>
                </div>
            )}
        </CalculatorShell>
    );
};

// Reusable InputField with Tooltip
const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, className?: string, tooltip?: string}> = ({label, value, onChange, className, tooltip}) => (
    <div className={className}>
        <div className="flex items-center gap-1 mb-1">
            <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80">{label}</label>
            {tooltip && (
                <Tooltip text={tooltip}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.166.362-2.221.954-3.076" /></svg>
                </Tooltip>
            )}
        </div>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
    </div>
);
