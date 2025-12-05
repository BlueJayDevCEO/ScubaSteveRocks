
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { calculateTimeRemaining, barToPsi, psiToBar, metersToFeet, feetToMeters } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const timeInfo = (
    <>
        <InfoSection title="What is this Calculator?">
            <p>This calculator provides an estimate of how many minutes of breathing gas you have left at your current depth, based on your consumption rate and remaining tank pressure.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>First, it determines your gas consumption rate at depth by multiplying your SAC rate by the ambient pressure (ATA). Then, it calculates the amount of usable gas in your tank (current pressure minus reserve pressure). Finally, it divides the usable gas by your consumption rate at depth to estimate the remaining time.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Time Remaining = Usable Gas / Consumption at Depth</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>Usable Gas (Liters):</strong> (Current Pressure - Reserve Pressure) × Tank Liters.</li>
                <li><strong>Consumption at Depth (L/min):</strong> SAC Rate × Pressure in ATA.</li>
            </ul>
        </InfoSection>
    </>
);


export const TimeRemainingCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [sac, setSac] = useState('');
    const [tankSize, setTankSize] = useState('11.1');
    const [currentPressure, setCurrentPressure] = useState('');
    const [reservePressure, setReservePressure] = useState(units === 'metric' ? '50' : '750');
    const [depth, setDepth] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const pressureUnit = units === 'metric' ? 'bar' : 'psi';
    const depthUnit = units === 'metric' ? 'm' : 'ft';
    const sacUnit = units === 'metric' ? 'L/min' : 'cu ft/min';

    const handleCalculate = () => {
        const sacRate = units === 'metric' ? parseFloat(sac) : parseFloat(sac) * 28.3168; // ft³/min to L/min
        const tankL = parseFloat(tankSize);
        const currentP = units === 'metric' ? parseFloat(currentPressure) : psiToBar(parseFloat(currentPressure));
        const reserveP = units === 'metric' ? parseFloat(reservePressure) : psiToBar(parseFloat(reservePressure));
        const depthM = units === 'metric' ? parseFloat(depth) : feetToMeters(parseFloat(depth));

        if ([sacRate, tankL, currentP, reserveP, depthM].some(isNaN)) {
            setResult(null);
            return;
        }

        const timeResult = calculateTimeRemaining(sacRate, tankL, currentP, reserveP, depthM);
        setResult(timeResult);
    };
    
    // Update reserve pressure placeholder when units change
    React.useEffect(() => {
        setReservePressure(units === 'metric' ? '50' : '750');
    }, [units]);

    return (
        <CalculatorShell title="Time Remaining Calculator" onBack={onBack} infoContent={timeInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Estimate how much dive time you have left at a given depth based on your gas consumption.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                    label={`Your SAC Rate (${sacUnit})`} 
                    value={sac} 
                    onChange={setSac} 
                    tooltip="Your Surface Air Consumption rate. Use the SAC calculator if you don't know it."
                />
                <InputField 
                    label="Tank Water Capacity (Liters)"
                    value={tankSize} 
                    onChange={setTankSize} 
                    tooltip="Enter the internal volume (water capacity) of your tank. Common sizes: Aluminum 80 (AL80) ≈ 11.1 L."
                />
                <InputField label={`Current Pressure (${pressureUnit})`} value={currentPressure} onChange={setCurrentPressure} />
                <InputField label={`Reserve Pressure (${pressureUnit})`} value={reservePressure} onChange={setReservePressure} />
                <InputField label={`Current Depth (${depthUnit})`} value={depth} onChange={setDepth} className="md:col-span-2" />
            </div>
            <button onClick={handleCalculate} className="w-full mt-6 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold text-lg py-3 rounded-lg">Calculate</button>

            {result !== null && (
                <div className="mt-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg animate-fade-in text-center">
                    <h4 className="font-semibold text-lg mb-2">Estimated Time Remaining</h4>
                    <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                        {isFinite(result) ? Math.floor(result) : '∞'}
                        <span className="text-xl"> min</span>
                    </p>
                    <p className="mt-2 text-sm text-light-text/70 dark:text-dark-text/70 italic">
                        This is an estimate. Always monitor your pressure gauge and end your dive with a safe reserve.
                    </p>
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
