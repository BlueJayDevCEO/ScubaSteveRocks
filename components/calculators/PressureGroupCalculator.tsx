
import React, { useState, useEffect } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import { feetToMeters } from '../../logic/diveCalculations';
import * as DiveTable from '../../logic/diveTables';
import { InfoSection, Formula } from './InfoContent';

type UnitSystem = 'metric' | 'imperial';

const pgInfo = (
    <>
        <InfoSection title="What is a Pressure Group?">
            <p>A Pressure Group (PG) is a letter from A to Z that represents the theoretical amount of nitrogen remaining in your body's tissues after a dive. The further down the alphabet, the more residual nitrogen you have.</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>This calculator uses the logic from PADI's RDP Table 1. Based on your dive's maximum depth and actual bottom time, it looks up the corresponding Pressure Group. It also shows you the No-Decompression Limit (NDL) for that depth so you can ensure your dive was within recreational limits.</p>
        </InfoSection>
        <InfoSection title="The 'Formula'">
            <Formula>Pressure Group = TableLookup(Depth, Time)</Formula>
            <p className="text-sm">This is not a mathematical formula but a lookup process. The calculator finds the planned depth on the table, then finds the bottom time that is equal to or just greater than your actual bottom time to determine the PG.</p>
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

export const PressureGroupCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [depth, setDepth] = useState('');
    const [time, setTime] = useState('');
    const [ndl, setNdl] = useState<number | null>(null);
    const [pg, setPg] = useState<string | null>(null);

    const depthUnit = units === 'metric' ? 'm' : 'ft';

    useEffect(() => {
        setNdl(null);
        setPg(null);
    }, [depth, time, units]);

    const handleCalculate = () => {
        const depthVal = parseFloat(depth);
        const timeVal = parseFloat(time);
        if (isNaN(depthVal) || isNaN(timeVal)) return;

        const depthM = units === 'metric' ? depthVal : feetToMeters(depthVal);
        const ndlVal = DiveTable.getNdlForDepth(depthM);
        setNdl(ndlVal);
        
        const pressureGroup = DiveTable.getPressureGroupAfterDive(depthM, timeVal);
        setPg(pressureGroup);
    };

    return (
        <CalculatorShell title="Pressure Group Calculator" onBack={onBack} infoContent={pgInfo}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Enter your dive depth and bottom time to find your end-of-dive pressure group.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label={`Depth (${depthUnit})`} value={depth} onChange={setDepth} />
                <InputField label="Bottom Time (min)" value={time} onChange={setTime} />
            </div>
            <button onClick={handleCalculate} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate</button>
            {pg !== null && (
                <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-2 gap-4">
                    <ResultBox title="No-Decompression Limit" value={ndl ?? 'N/A'} unit="min" tooltip="The maximum amount of time you can spend at this depth without requiring a mandatory decompression stop." />
                    <ResultBox title="Pressure Group" value={pg ?? 'N/A'} tooltip="A letter representing the amount of residual nitrogen in your body after a dive." />
                </div>
            )}
             {pg === null && ndl !== null && parseFloat(time) > ndl && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-lg text-center font-bold text-red-500">
                    Warning: Dive exceeds No-Decompression Limit. This requires a decompression dive plan, which is outside the scope of this recreational calculator.
                </div>
            )}
        </CalculatorShell>
    );
};
