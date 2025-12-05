
import React, { useState } from 'react';
import { Briefing, User } from '../types';

interface DiveLogImporterProps {
    onImport: (briefings: Briefing[]) => void;
    user: User;
}

const EXPECTED_HEADERS = ['Date', 'Location', 'Max Depth', 'Dive Time', 'Buddy', 'Notes', 'Species Sighted'];

export const DiveLogImporter: React.FC<DiveLogImporterProps> = ({ onImport, user }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedDives, setParsedDives] = useState<Briefing[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                setError('Invalid file type. Please upload a CSV file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setParsedDives([]);
        }
    };

    const parseCSV = (csvText: string): Briefing[] => {
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length < 2) throw new Error("CSV file must have at least one data row.");

        const headerLine = lines[0].split(',').map(h => h.trim());
        const headerMap: { [key: string]: number } = {};
        
        // Loosely map expected headers to their index
        EXPECTED_HEADERS.forEach(expectedHeader => {
            const index = headerLine.findIndex(h => h.toLowerCase().replace(/\s/g, '').includes(expectedHeader.toLowerCase().replace(/\s/g, '')));
            if(index > -1) headerMap[expectedHeader] = index;
        });

        const requiredHeaders = ['Date', 'Location'];
        if (!requiredHeaders.every(h => Object.keys(headerMap).includes(h))) {
            throw new Error(`CSV must contain at least 'Date' and 'Location' columns. Found: ${headerLine.join(', ')}`);
        }

        const dataRows = lines.slice(1);
        const briefings: Briefing[] = dataRows.map((line, index) => {
            const values = line.split(',');
            const dateStr = values[headerMap['Date']];
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                console.warn(`Skipping row ${index + 2}: Invalid date format "${dateStr}"`);
                return null;
            }

            // FIX: Explicitly type the object being created to ensure it conforms to the Briefing interface.
            // This resolves issues with type inference for the 'type' property and the type predicate in the filter.
            const newBriefing: Briefing = {
                id: Date.now() + index, // Unique ID
                userId: user.uid,
                type: 'imported_dive',
                status: 'completed',
                createdAt: date.getTime(),
                location: values[headerMap['Location']]?.trim() || 'N/A',
                max_depth: headerMap['Max Depth'] ? parseInt(values[headerMap['Max Depth']], 10) || undefined : undefined,
                dive_time: headerMap['Dive Time'] ? parseInt(values[headerMap['Dive Time']], 10) || undefined : undefined,
                dive_buddy: values[headerMap['Buddy']]?.trim() || undefined,
                notes: values[headerMap['Notes']]?.trim() || undefined,
                species_sighted: values[headerMap['Species Sighted']]?.trim() || undefined,
                input: { prompt: `Imported Dive: ${values[headerMap['Location']]?.trim()}` }
            };
            return newBriefing;
        }).filter((b): b is Briefing => b !== null);

        return briefings;
    };

    const handleParse = () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsParsing(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = parseCSV(content);
                setParsedDives(parsed);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsParsing(false);
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        onImport(parsedDives);
        setFile(null);
        setParsedDives([]);
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full flex flex-col gap-6">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl">Import Your Dive Log</h2>
            <p className="text-light-text/70 dark:text-dark-text/70 -mt-4">
                Upload a CSV file of your past dives. The file should have columns like: <code className="text-xs bg-light-bg dark:bg-dark-bg p-1 rounded">Date, Location, Max Depth, Dive Time, Buddy, Notes, Species Sighted</code>. Only Date and Location are required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-light-accent/10 file:text-light-accent dark:file:bg-dark-accent/10 dark:file:text-dark-accent hover:file:bg-light-accent/20 dark:hover:file:bg-dark-accent/20"/>
                <button onClick={handleParse} disabled={!file || isParsing} className="w-full sm:w-auto bg-light-primary-start text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                    {isParsing ? 'Parsing...' : 'Preview Import'}
                </button>
            </div>

            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            
            {parsedDives.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="font-semibold text-xl mb-2">Import Preview ({parsedDives.length} dives found)</h3>
                    <div className="max-h-64 overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg p-2 space-y-2 bg-light-bg dark:bg-dark-bg">
                        {parsedDives.map((dive, index) => (
                            <div key={index} className="bg-light-card dark:bg-dark-card p-3 rounded-md text-sm">
                                <p><strong>📍 {dive.location}</strong> on {new Date(dive.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                                    {dive.max_depth && `Depth: ${dive.max_depth}m`} {dive.dive_time && `· Time: ${dive.dive_time}min`}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleConfirmImport} className="w-full mt-4 bg-gradient-to-r from-light-accent to-orange-500 text-white font-bold text-lg py-3 rounded-lg">
                        Confirm & Add to Log
                    </button>
                </div>
            )}
        </div>
    );
};
