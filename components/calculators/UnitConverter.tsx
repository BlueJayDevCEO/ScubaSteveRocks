
import React, { useState } from 'react';
import { CalculatorShell } from './CalculatorShell';
import { metersToFeet, feetToMeters, barToPsi, psiToBar, celsiusToFahrenheit, fahrenheitToCelsius } from '../../logic/diveCalculations';
import { InfoSection, Formula } from './InfoContent';

type ConversionType = 'depth' | 'pressure' | 'temperature';

const converterInfo = (
    <>
        <InfoSection title="What is this?">
            <p>A simple utility to convert between metric (meters, bar, °C) and imperial (feet, psi, °F) units commonly used in scuba diving. Enter a value in either field to see its equivalent in the other system.</p>
        </InfoSection>
        <InfoSection title="Conversion Factors">
            <ul className="list-disc list-inside text-sm">
                <li>1 meter = 3.28084 feet</li>
                <li>1 bar = 14.5038 psi</li>
                <li>°F = (°C × 9/5) + 32</li>
            </ul>
        </InfoSection>
    </>
);

export const UnitConverter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [conversion, setConversion] = useState<ConversionType>('depth');
    
    const [metricValue, setMetricValue] = useState('');
    const [imperialValue, setImperialValue] = useState('');
    
    // Clear values when switching conversion type
    const handleConversionChange = (type: ConversionType) => {
        setConversion(type);
        setMetricValue('');
        setImperialValue('');
    };

    const handleMetricChange = (val: string) => {
        setMetricValue(val);
        const num = parseFloat(val);
        if (isNaN(num)) {
            setImperialValue('');
            return;
        }
        
        let converted: number;
        switch (conversion) {
            case 'depth':
                converted = metersToFeet(num);
                break;
            case 'pressure':
                converted = barToPsi(num);
                break;
            case 'temperature':
                converted = celsiusToFahrenheit(num);
                break;
        }
        setImperialValue(converted.toFixed(2));
    };

    const handleImperialChange = (val: string) => {
        setImperialValue(val);
        const num = parseFloat(val);
        if (isNaN(num)) {
            setMetricValue('');
            return;
        }
        
        let converted: number;
        switch (conversion) {
            case 'depth':
                converted = feetToMeters(num);
                break;
            case 'pressure':
                converted = psiToBar(num);
                break;
            case 'temperature':
                converted = fahrenheitToCelsius(num);
                break;
        }
        setMetricValue(converted.toFixed(2));
    };

    let metricUnit = '';
    let imperialUnit = '';
    
    if (conversion === 'depth') {
        metricUnit = 'meters';
        imperialUnit = 'feet';
    } else if (conversion === 'pressure') {
        metricUnit = 'bar';
        imperialUnit = 'psi';
    } else if (conversion === 'temperature') {
        metricUnit = '°C';
        imperialUnit = '°F';
    }

    return (
        <CalculatorShell title="Unit Converter" onBack={onBack} infoContent={converterInfo}>
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-1 p-1 rounded-full bg-light-bg dark:bg-dark-bg">
                    <button onClick={() => handleConversionChange('depth')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${conversion === 'depth' ? 'bg-white dark:bg-dark-card shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/10'}`}>Depth</button>
                    <button onClick={() => handleConversionChange('pressure')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${conversion === 'pressure' ? 'bg-white dark:bg-dark-card shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/10'}`}>Pressure</button>
                    <button onClick={() => handleConversionChange('temperature')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${conversion === 'temperature' ? 'bg-white dark:bg-dark-card shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/10'}`}>Temp</button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <InputField label={metricUnit} value={metricValue} onChange={handleMetricChange} />
                <div className="text-center font-bold text-2xl text-light-text/50 dark:text-dark-text/50 transform rotate-90 md:rotate-0">=</div>
                <InputField label={imperialUnit} value={imperialValue} onChange={handleImperialChange} />
            </div>
        </CalculatorShell>
    );
};

const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void}> = ({label, value, onChange}) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-light-text/80 dark:text-dark-text/80 mb-1">{label}</label>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-md" />
    </div>
);
