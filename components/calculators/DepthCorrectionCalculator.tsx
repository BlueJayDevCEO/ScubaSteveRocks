
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { metersToFeet, feetToMeters, correctDepthForFreshwater } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

// A gauge calibrated for saltwater reads ~3% deeper in freshwater.
// Actual Fresh Depth = Saltwater Gauge Reading / 1.03
const FRESHWATER_CORRECTION_FACTOR = 1.03;

type UnitSystem = 'metric' | 'imperial';

const depthCorrectionInfo = (
    <>
        <InfoSection title="Why Correct for Depth?">
            <p>Most dive computers and depth gauges are calibrated for the density of saltwater. Since freshwater is about 3% less dense than saltwater, a saltwater-calibrated gauge will read deeper than your actual depth when you dive in freshwater (like lakes, quarries, or cenotes).</p>
        </InfoSection>
        <InfoSection title="How it Works">
            <p>This calculator applies the ~3% correction factor to convert between the reading on a saltwater gauge and the true depth in freshwater. This is important for accurate dive planning, especially when using dive tables.</p>
        </InfoSection>
        <InfoSection title="The Formula">
            <Formula>Actual Fresh Depth = Gauge Reading / 1.03</Formula>
            <p className="text-sm">Enter a value in either field to calculate the other. For example, if your gauge reads 30m in a lake, your actual depth is closer to 29.1m.</p>
        </InfoSection>
    </>
);


export const DepthCorrectionCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [units, setUnits] = useState<UnitSystem>('metric');
    const [gaugeReadingM, setGaugeReadingM] = useState<number | ''>('');
    const [actualDepthM, setActualDepthM] = useState<number | ''>('');

    const handleGaugeChange = (valStr: string) => {
        const num = parseFloat(valStr);
        const metricVal = units === 'imperial' ? feetToMeters(num) : num;
        
        if (!isNaN(metricVal)) {
            setGaugeReadingM(metricVal);
            setActualDepthM(correctDepthForFreshwater(metricVal));
        } else {
            setGaugeReadingM('');
            setActualDepthM('');
        }
    };

    const handleActualChange = (valStr: string) => {
        const num = parseFloat(valStr);
        const metricVal = units === 'imperial' ? feetToMeters(num) : num;
        
        if (!isNaN(metricVal)) {
            setActualDepthM(metricVal);
            setGaugeReadingM(metricVal * FRESHWATER_CORRECTION_FACTOR);
        } else {
            setGaugeReadingM('');
            setActualDepthM('');
        }
    };

    const depthUnit = units === 'metric' ? 'm' : 'ft';

    const displayGauge = gaugeReadingM !== '' ? (units === 'metric' ? gaugeReadingM : metersToFeet(gaugeReadingM)) : '';
    const displayActual = actualDepthM !== '' ? (units === 'metric' ? actualDepthM : metersToFeet(actualDepthM)) : '';
    
    const formatValue = (value: number | '', precision: number) => {
        if (value === '') return '';
        return value.toFixed(precision);
    };

    return (
        <CalculatorShell title="Depth Correction Calculator" onBack={onBack} infoContent={depthCorrectionInfo}>
             <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => setUnits('metric')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'metric' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Metric</button>
                    <button onClick={() => setUnits('imperial')} className={`px-3 py-1 text-sm font-semibold rounded-full ${units === 'imperial' ? 'bg-white dark:bg-dark-card shadow-sm' : ''}`}>Imperial</button>
                </div>
            </div>
            <p className="text-sm text-center mb-4 text-light-text/70 dark:text-dark-text/70">Convert between a saltwater-calibrated gauge reading and the true depth in freshwater.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <InputField 
                    label={`Gauge Reading in Fresh Water (${depthUnit})`}
                    value={formatValue(displayGauge, units === 'metric' ? 1 : 0)}
                    onChange={handleGaugeChange}
                />
                <InputField
                    label={`Actual Depth in Fresh Water (${depthUnit})`}
                    value={formatValue(displayActual, units === 'metric' ? 1 : 0)}
                    onChange={handleActualChange}
                />
            </div>
             <p className="mt-4 text-xs text-center text-light-text/70 dark:text-dark-text/70 italic">Note: Saltwater is ~3% denser than fresh water. A gauge calibrated for salt water will read deeper than the actual depth when used in fresh water.</p>
        </CalculatorShell>
    );
};


const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void}> = ({label, value, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
    </div>
);
