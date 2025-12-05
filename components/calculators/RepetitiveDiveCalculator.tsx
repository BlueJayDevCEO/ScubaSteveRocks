
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { feetToMeters } from '../../logic/diveCalculations';
import * as DiveTable from '../../logic/diveTables';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const repetitiveInfo = (
    <>
        <InfoSection title="What is this Calculator?">
            <p>This calculator helps you plan a safe repetitive dive (any dive made after a previous one). It determines your time limits for the next dive based on the residual nitrogen in your body.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>Using your current Pressure Group (after your surface interval) and the planned depth of your next dive, this calculator uses PADI's RDP Table 3 to find two crucial numbers: your Residual Nitrogen Time (RNT) and your Adjusted No-Decompression Limit (ANDL).</p>
        </InfoSection>
        <InfoSection title="Key Terms & Formula">
            <Formula>Actual Bottom Time (Max) = ANDL - RNT</Formula>
            <ul className="list-disc list-inside text-sm">
                <li><strong>RNT (Residual Nitrogen Time):</strong> A time penalty you must add to your next dive's bottom time to account for the nitrogen still in your system.</li>
                <li><strong>ANDL (Adjusted No-Decompression Limit):</strong> The original NDL for this depth, shortened to account for your residual nitrogen.</li>
                <li><strong>Actual Bottom Time (ABT):</strong> The maximum time you can actually spend at the bottom on this dive.</li>
            </ul>
        </InfoSection>
    </>
);


const pressureGroups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ResultBox: React.FC<{title: string, value: string | number, unit?: string, tooltip?: string}> = ({ title, value, unit, tooltip }) => (
    <div className="text-center">
        <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">{title}</p>
            {tooltip && (
                 <Tooltip text={tooltip}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.166.362-2.221.954-3.076" /></svg>
                </Tooltip>
            )}
        </div>
        <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">{value} <span className="text-xl">{unit}</span></p>
    </div>
);

export const RepetitiveDiveCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [currentPg, setCurrentPg] = useState('C');
    const [nextDepth, setNextDepth] = useState('');
    const [result, setResult] = useState<{ rnt: number; andl: number } | null>(null);

    const depthUnit = units === 'metric' ? 'm' : 'ft';

    const handleCalculate = () => {
        const depth = parseFloat(nextDepth);
        if (isNaN(depth)) {
            setResult(null);
            return;
        }

        const depthM = units === 'metric' ? depth : feetToMeters(depth);
        const repetitiveTimes = DiveTable.getRepetitiveDiveTimes(currentPg as any, depthM);
        setResult(repetitiveTimes);
    };

    return (
        <CalculatorShell title="Repetitive Dive Planner" onBack={onBack} infoContent={repetitiveInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Enter your current pressure group and planned depth to find your limits for your next dive.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">Current Pressure Group</label>
                    <select value={currentPg} onChange={e => setCurrentPg(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md">
                        {pressureGroups.map(pg => <option key={pg} value={pg}>{pg}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">{`Next Dive Depth (${depthUnit})`}</label>
                    <input type="number" value={nextDepth} onChange={e => setNextDepth(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
                </div>
            </div>
            <button onClick={handleCalculate} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate Limits</button>
            
            {result ? (
                <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <ResultBox title="Residual Nitrogen Time" value={result.rnt} unit="min" tooltip="An 'imaginary' time penalty you must add to your next dive's bottom time to account for nitrogen still in your system." />
                   <ResultBox title="Adjusted NDL" value={result.andl} unit="min" tooltip="The original No-Decompression Limit for this depth, adjusted for your residual nitrogen." />
                   <ResultBox title="Actual Bottom Time" value={result.andl - result.rnt < 0 ? 0 : result.andl - result.rnt} unit="min" tooltip="The maximum actual time you can spend at the bottom on your repetitive dive (ANDL - RNT)." />
                </div>
            ) : (result === null && nextDepth && currentPg) ? (
                 <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg text-center font-bold text-yellow-600 dark:text-yellow-400">
                    Repetitive dive not recommended for this pressure group and depth combination.
                </div>
            ) : null}
        </CalculatorShell>
    );
};
