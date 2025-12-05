
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateSAC, barToPsi, psiToBar, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';
import { Briefing } from '../../types';

type UnitSystem = 'metric' | 'imperial';

const sacInfo = (
    <>
        <InfoSection title="What is SAC Rate?">
            <p>Your Surface Air Consumption (SAC) rate, also known as Respiratory Minute Volume (RMV), is a measure of how much gas you breathe in one minute at the surface (1 ATA). Knowing this value is crucial for accurate dive planning, as it allows you to predict how long your gas supply will last at different depths.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>This calculator determines your SAC rate based on a previous dive. By providing the gas used, duration, and average depth, it calculates how much gas you would have consumed if you had been at the surface for that same amount of time.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>SAC = (Pressure Used × Tank Liters) / (Time × Avg. Pressure in ATA)</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>Pressure Used:</strong> Start Pressure - End Pressure.</li>
                <li><strong>Tank Liters:</strong> The water capacity of your cylinder.</li>
                <li><strong>Time:</strong> The duration of the dive in minutes.</li>
                <li><strong>Avg. Pressure in ATA:</strong> (Average Depth / 10) + 1 for metric, or (Average Depth / 33) + 1 for imperial.</li>
            </ul>
        </InfoSection>
    </>
);


export const SACCalculator: React.FC<{ onBack: () => void, onLogActivity?: (type: Briefing['type'], outputData: any, prompt: string) => void }> = ({ onBack, onLogActivity }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [startPressure, setStartPressure] = useState('');
    const [endPressure, setEndPressure] = useState('');
    const [tankSize, setTankSize] = useState('11.1'); // Default to AL80
    const [duration, setDuration] = useState('');
    const [avgDepth, setAvgDepth] = useState('');

    const [result, setResult] = useState<{ sac: number, rmv: number } | null>(null);

    const pressureUnit = units === 'metric' ? 'bar' : 'psi';
    const depthUnit = units === 'metric' ? 'meters' : 'feet';
    const sacUnit = units === 'metric' ? 'L/min' : 'cu ft/min';

    const handleCalculate = () => {
        const startP = units === 'metric' ? parseFloat(startPressure) : psiToBar(parseFloat(startPressure));
        const endP = units === 'metric' ? parseFloat(endPressure) : psiToBar(parseFloat(endPressure));
        const tankL = parseFloat(tankSize); // Always in Liters now
        const dur = parseFloat(duration);
        const depthM = units === 'metric' ? parseFloat(avgDepth) : feetToMeters(parseFloat(avgDepth));

        if ([startP, endP, tankL, dur, depthM].some(isNaN)) {
            setResult(null);
            return;
        }

        const sacResult = calculateSAC(startP, endP, tankL, dur, depthM);
        setResult(sacResult);

        if (sacResult && onLogActivity) {
             const formattedResult = units === 'metric' 
                ? `${sacResult.sac.toFixed(2)} L/min`
                : `${(sacResult.sac * 0.0353147).toFixed(2)} cu ft/min`;
                
            onLogActivity('calculator', {
                calculatorData: {
                    title: 'SAC Rate',
                    result: formattedResult
                }
            }, `Calculated SAC Rate: ${formattedResult} based on ${dur}min dive at ${depthM.toFixed(1)}m avg depth.`);
        }
    };
    
    return (
        <CalculatorShell title="SAC Rate Calculator" onBack={onBack} infoContent={sacInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Start Pressure (${pressureUnit})`} value={startPressure} onChange={setStartPressure} />
                <InputField label={`End Pressure (${pressureUnit})`} value={endPressure} onChange={setEndPressure} />
                <InputField 
                    label="Tank Water Capacity (Liters)" 
                    value={tankSize} 
                    onChange={setTankSize} 
                    tooltip="Enter the internal volume (water capacity) of your tank. Common sizes: Aluminum 80 (AL80) ≈ 11.1 L, Steel 100 ≈ 12.2 L, Steel 133 ≈ 15.3 L."
                />
                <InputField label="Dive Duration (min)" value={duration} onChange={setDuration} />
                <InputField label={`Average Depth (${depthUnit})`} value={avgDepth} onChange={setAvgDepth} className="md:col-span-2"/>
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in">
                    <h4 className="font-semibold text-lg mb-2">Results</h4>
                    <div className="flex justify-around text-center">
                         <div>
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-sm text-light-text/70 dark:text-dark-text/70">SAC/RMV Rate</p>
                                <Tooltip text="Surface Air Consumption (SAC) or Respiratory Minute Volume (RMV) is the volume of gas a diver breathes in one minute at the surface. They represent the same value.">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.166.362-2.221.954-3.076" /></svg>
                                </Tooltip>
                            </div>
                            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                                {units === 'metric' ? result.sac.toFixed(2) : (result.sac * 0.0353147).toFixed(2)}
                            </p>
                            <p className="text-sm font-mono">{sacUnit}</p>
                        </div>
                    </div>
                    <p className="text-center text-xs text-green-600 dark:text-green-400 mt-2">✅ Saved to Logbook</p>
                </div>
            )}
        </CalculatorShell>
    );
};

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
