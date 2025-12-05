
import React, { useState, useEffect } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { feetToMeters, metersToFeet } from '../../logic/diveCalculations';
import * as DiveTable from '../../logic/diveTables';
import { DiveTablesImagesModal } from './DiveTablesImagesModal';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';
type Step = 1 | 2 | 3;

const tablesInfo = (
    <>
        <InfoSection title="What is this Calculator?">
            <p>This is a digital version of the PADI Recreational Dive Planner (RDP) tables. It allows you to plan a single dive and a subsequent repetitive dive by calculating your pressure groups, surface interval credits, and adjusted time limits.</p>
            <p>It's an essential tool for understanding the principles of dive planning, even if you primarily use a dive computer.</p>
        </InfoSection>
        <InfoSection title="How it Works (3 Steps)">
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Plan First Dive:</strong> Enter your planned depth and bottom time. The calculator uses Table 1 to find your No-Decompression Limit (NDL) and your end-of-dive Pressure Group (PG). You must stay within the NDL.</li>
                <li><strong>Plan Surface Interval:</strong> Enter the time you plan to spend at the surface. The calculator uses Table 2 to determine how much residual nitrogen your body off-gasses, giving you a new, lower PG.</li>
                <li><strong>Plan Repetitive Dive:</strong> Enter the depth for your next dive. The calculator uses Table 3 to find your Residual Nitrogen Time (RNT) and your Adjusted No-Decompression Limit (ANDL) based on your new PG. Your actual bottom time cannot exceed the ANDL minus the RNT.</li>
            </ol>
        </InfoSection>
         <InfoSection title="Key Terms">
            <ul className="list-disc list-inside space-y-2">
                <li><strong>NDL (No-Decompression Limit):</strong> The maximum time you can spend at a certain depth without needing a mandatory decompression stop.</li>
                <li><strong>PG (Pressure Group):</strong> A letter (A-Z) that represents the theoretical amount of nitrogen remaining in your body after a dive.</li>
                <li><strong>RNT (Residual Nitrogen Time):</strong> A time penalty, in minutes, that you must add to your next dive's actual bottom time. It accounts for the nitrogen still in your system.</li>
                <li><strong>ANDL (Adjusted No-Decompression Limit):</strong> The original NDL for your repetitive dive depth, shortened to account for your residual nitrogen.</li>
                 <li><strong>Actual Bottom Time (ABT):</strong> The time you can actually spend at the bottom on your repetitive dive. It's calculated as ANDL - RNT.</li>
            </ul>
        </InfoSection>
    </>
);

const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, className?: string, disabled?: boolean}> = ({label, value, onChange, className, disabled}) => (
    <div className={className}>
        <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md disabled:bg-black/10 dark:disabled:bg-white/10" />
    </div>
);

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

export const DiveTablesCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState<Step>(1);
    const [units, setUnits] = useState<UnitSystem>('metric');
    
    // Dive 1
    const [dive1Depth, setDive1Depth] = useState('');
    const [dive1Time, setDive1Time] = useState('');
    const [ndl1, setNdl1] = useState<number | null>(null);
    const [pg1, setPg1] = useState<string | null>(null);

    // Surface Interval
    const [surfaceInterval, setSurfaceInterval] = useState('60');
    const [pg2, setPg2] = useState<string | null>(null);

    // Dive 2
    const [dive2Depth, setDive2Depth] = useState('');
    const [rnt2, setRnt2] = useState<number | null>(null);
    const [andl2, setAndl2] = useState<number | null>(null);
    
    const [showTables, setShowTables] = useState(false);
    const [showTableImages, setShowTableImages] = useState(false);

    const depthUnit = units === 'metric' ? 'm' : 'ft';
    
    // Add useEffects to reset subsequent steps when inputs change
    useEffect(() => {
        setNdl1(null);
        setPg1(null);
        setPg2(null);
        setRnt2(null);
        setAndl2(null);
        if (step > 1) setStep(1);
    }, [dive1Depth, dive1Time, units]);

    useEffect(() => {
        setPg2(null);
        setRnt2(null);
        setAndl2(null);
        if (step > 2) setStep(2);
    }, [surfaceInterval, pg1]);

    useEffect(() => {
        setRnt2(null);
        setAndl2(null);
    }, [dive2Depth, pg2]);


    const handleReset = () => {
        setStep(1);
        setDive1Depth(''); setDive1Time(''); setNdl1(null); setPg1(null);
        setSurfaceInterval('60'); setPg2(null);
        setDive2Depth(''); setRnt2(null); setAndl2(null);
    };

    const handleDive1Calc = () => {
        const depth = parseFloat(dive1Depth);
        const time = parseFloat(dive1Time);
        if (isNaN(depth) || isNaN(time)) return;

        const depthM = units === 'metric' ? depth : feetToMeters(depth);
        const ndl = DiveTable.getNdlForDepth(depthM);
        setNdl1(ndl);
        
        const pressureGroup = DiveTable.getPressureGroupAfterDive(depthM, time);
        setPg1(pressureGroup);
    };

    const handleSurfaceIntervalCalc = () => {
        if (!pg1) return;
        const si = parseInt(surfaceInterval, 10);
        if (isNaN(si)) return;

        const newPg = DiveTable.getNewPressureGroupAfterSurfaceInterval(pg1 as any, si);
        setPg2(newPg);
    };

    const handleDive2Calc = () => {
        if (!pg2) return;
        const depth = parseFloat(dive2Depth);
        if (isNaN(depth)) return;

        const depthM = units === 'metric' ? depth : feetToMeters(depth);
        const repetitiveTimes = DiveTable.getRepetitiveDiveTimes(pg2 as any, depthM);
        if (repetitiveTimes) {
            setRnt2(repetitiveTimes.rnt);
            setAndl2(repetitiveTimes.andl);
        } else {
            setRnt2(null);
            setAndl2(null);
        }
    };

    return (
        <CalculatorShell title="Dive Tables Planner (RDP)" onBack={onBack} infoContent={tablesInfo}>
            <div className="flex justify-between items-center mb-4">
                 <button onClick={handleReset} className="text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">Reset Planner</button>
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>

            {/* --- Step 1: First Dive --- */}
            <div className={`p-4 border-2 rounded-lg ${step >= 1 ? 'border-light-accent/50 dark:border-dark-accent/50' : 'border-black/10 dark:border-white/10'}`}>
                <h4 className="font-bold text-lg mb-2">1. Plan First Dive</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`Depth (${depthUnit})`} value={dive1Depth} onChange={setDive1Depth} />
                    <InputField label="Bottom Time (min)" value={dive1Time} onChange={setDive1Time} />
                </div>
                <button onClick={handleDive1Calc} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate NDL & PG</button>
                {ndl1 !== null && (
                    <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-2 gap-4">
                        <ResultBox title="No-Decompression Limit" value={ndl1 ?? 'N/A'} unit="min" tooltip="The maximum amount of time you can spend at this depth without requiring a mandatory decompression stop." />
                        <ResultBox title="Pressure Group" value={pg1 ?? 'N/A'} tooltip="A letter representing the amount of residual nitrogen in your body after a dive." />
                    </div>
                )}
                {pg1 && step === 1 && <button onClick={() => setStep(2)} className="w-full mt-4 bg-light-primary-start text-white font-bold py-2 rounded-lg">Next: Plan Surface Interval &rarr;</button>}
            </div>

             {/* --- Step 2: Surface Interval --- */}
            <div className={`mt-4 p-4 border-2 rounded-lg ${step >= 2 ? 'border-light-accent/50 dark:border-dark-accent/50' : 'border-black/10 dark:border-white/10'}`}>
                <h4 className={`font-bold text-lg mb-2 ${step < 2 ? 'text-gray-400' : ''}`}>2. Plan Surface Interval</h4>
                {step >= 2 && (
                    <>
                        <InputField label="Surface Interval (min)" value={surfaceInterval} onChange={setSurfaceInterval} />
                        <button onClick={handleSurfaceIntervalCalc} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate New Pressure Group</button>
                         {pg2 && (
                            <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-1">
                                <ResultBox title="New Pressure Group" value={pg2} tooltip="Your updated pressure group after spending time at the surface, reflecting the off-gassing of nitrogen." />
                            </div>
                        )}
                        {pg2 && step === 2 && <button onClick={() => setStep(3)} className="w-full mt-4 bg-light-primary-start text-white font-bold py-2 rounded-lg">Next: Plan Repetitive Dive &rarr;</button>}
                    </>
                )}
            </div>

            {/* --- Step 3: Repetitive Dive --- */}
            <div className={`mt-4 p-4 border-2 rounded-lg ${step >= 3 ? 'border-light-accent/50 dark:border-dark-accent/50' : 'border-black/10 dark:border-white/10'}`}>
                <h4 className={`font-bold text-lg mb-2 ${step < 3 ? 'text-gray-400' : ''}`}>3. Plan Repetitive Dive</h4>
                {step >= 3 && (
                    <>
                        <InputField label={`Next Dive Depth (${depthUnit})`} value={dive2Depth} onChange={setDive2Depth} />
                        <button onClick={handleDive2Calc} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate Repetitive Dive Limits</button>
                        {rnt2 !== null && andl2 !== null && (
                            <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <ResultBox title="Residual Nitrogen Time" value={rnt2} unit="min" tooltip="An 'imaginary' time penalty you must add to your next dive's bottom time to account for nitrogen still in your system." />
                                <ResultBox title="Adjusted NDL" value={andl2} unit="min" tooltip="The original No-Decompression Limit for this depth, adjusted for your residual nitrogen." />
                                 <ResultBox title="Actual Bottom Time" value={andl2 - rnt2 < 0 ? 0 : andl2 - rnt2} unit="min" tooltip="The maximum actual time you can spend at the bottom on your repetitive dive (ANDL - RNT)." />
                            </div>
                        )}
                    </>
                )}
            </div>
             <div className="mt-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-4">
                     <button onClick={() => setShowTableImages(true)} className="text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">
                        View Table Pictures
                    </button>
                    <button onClick={() => setShowTables(!showTables)} className="text-sm font-semibold text-light-text/70 dark:text-dark-text/70 hover:underline">
                        {showTables ? 'Hide' : 'Show'} Raw Data
                    </button>
                </div>
                 {showTables && (
                    <pre className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg text-left text-xs overflow-auto">
                        {`// This is a simplified, partial representation of the RDP for educational purposes.
// Table 1: NDL and Pressure Groups
{
  10m: { ndl: 219, pg: [...] },
  12m: { ndl: 147, pg: [...] },
  ...
  42m: { ndl: 8, pg: [...] }
}

// Table 2: Surface Interval Credit
// Example for 'Z' group:
{ min: 10, max: 48, newPg: 'Y' }
{ min: 49, max: 88, newPg: 'X' }
...

// Table 3: Repetitive Dive Timetable
// Format: { pg: { depth: { rnt, andl } } }
{
  A: { 10: { rnt: 10, andl: 209 } },
  B: { 10: { rnt: 19, andl: 200 } },
  ...
}`}
                    </pre>
                 )}
            </div>
            {showTableImages && <DiveTablesImagesModal onClose={() => setShowTableImages(false)} />}
        </CalculatorShell>
    );
};
