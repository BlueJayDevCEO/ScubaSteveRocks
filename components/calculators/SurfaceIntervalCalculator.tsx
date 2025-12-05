
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { Tooltip } from '../Tooltip';
import * as DiveTable from '../../logic/diveTables';
import { InfoSection, Formula } from './InfoContent';

const siInfo = (
    <>
        <InfoSection title="What is this Calculator?">
            <p>This calculator determines your new Pressure Group after spending time at the surface between dives. This time is called the Surface Interval (SI).</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>During your surface interval, your body off-gasses some of the residual nitrogen it absorbed during the dive. The longer you wait, the more nitrogen you release, and the lower your pressure group becomes. This calculator uses the logic from PADI's RDP Table 2 to find your new PG based on your starting PG and the length of your SI.</p>
        </InfoSection>
        <InfoSection title="The 'Formula'">
            <Formula>New Pressure Group = TableLookup(Starting PG, Surface Interval Time)</Formula>
            <p className="text-sm">This is a table lookup process. The calculator finds your starting PG and then cross-references it with your surface interval time to find the resulting new pressure group.</p>
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

export const SurfaceIntervalCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [startPg, setStartPg] = useState('G');
    const [surfaceInterval, setSurfaceInterval] = useState('60');
    const [newPg, setNewPg] = useState<string | null>(null);

    const handleCalculate = () => {
        const si = parseInt(surfaceInterval, 10);
        if (isNaN(si)) {
            setNewPg(null);
            return;
        }

        const result = DiveTable.getNewPressureGroupAfterSurfaceInterval(startPg as any, si);
        setNewPg(result);
    };

    return (
        <CalculatorShell title="Surface Interval Calculator" onBack={onBack} infoContent={siInfo}>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Enter your starting pressure group and surface interval time to find your new pressure group for your next dive.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">Starting Pressure Group</label>
                    <select value={startPg} onChange={e => setStartPg(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md">
                        {pressureGroups.map(pg => <option key={pg} value={pg}>{pg}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">Surface Interval (min)</label>
                    <input type="number" value={surfaceInterval} onChange={e => setSurfaceInterval(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
                </div>
            </div>
            <button onClick={handleCalculate} className="w-full mt-4 bg-light-bg dark:bg-dark-bg font-semibold py-2 rounded-lg">Calculate</button>

            {newPg && (
                <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg grid grid-cols-1">
                    <ResultBox title="New Pressure Group" value={newPg} tooltip="Your updated pressure group after spending time at the surface, reflecting the off-gassing of nitrogen." />
                </div>
            )}
        </CalculatorShell>
    );
};
