
import React, { useState, useEffect } from 'react';
import { Briefing } from '../types';

interface EditableDiveLogDetailsProps {
  briefing: Briefing;
  onSave: (details: Partial<Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>>) => void;
  isDemo?: boolean;
}

export const EditableDiveLogDetails: React.FC<EditableDiveLogDetailsProps> = ({ briefing, onSave, isDemo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState({
        location: briefing.location || '',
        dive_time: briefing.dive_time?.toString() || '',
        max_depth: briefing.max_depth?.toString() || '',
        dive_buddy: briefing.dive_buddy || '',
        notes: briefing.notes || '',
        species_sighted: briefing.species_sighted || ''
    });

    useEffect(() => {
        setDetails({
            location: briefing.location || '',
            dive_time: briefing.dive_time?.toString() || '',
            max_depth: briefing.max_depth?.toString() || '',
            dive_buddy: briefing.dive_buddy || '',
            notes: briefing.notes || '',
            species_sighted: briefing.species_sighted || ''
        });
    }, [briefing]);


    const hasDetails = briefing.location || briefing.dive_time || briefing.max_depth || briefing.dive_buddy || briefing.notes || briefing.species_sighted;

    const handleSave = () => {
        const payload = {
            location: details.location.trim() || undefined,
            dive_time: details.dive_time ? Number(details.dive_time) : undefined,
            max_depth: details.max_depth ? Number(details.max_depth) : undefined,
            dive_buddy: details.dive_buddy.trim() || undefined,
            notes: details.notes.trim() || undefined,
            species_sighted: details.species_sighted.trim() || undefined
        };
        onSave(payload);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setDetails({
            location: briefing.location || '',
            dive_time: briefing.dive_time?.toString() || '',
            max_depth: briefing.max_depth?.toString() || '',
            dive_buddy: briefing.dive_buddy || '',
            notes: briefing.notes || '',
            species_sighted: briefing.species_sighted || ''
        });
        setIsEditing(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };
    
    const InputField: React.FC<{name: string, placeholder: string, value: string | number, onChange: any, type?: string, icon: React.ReactNode, className?: string}> = ({ name, placeholder, value, onChange, type = "text", icon, className = "" }) => (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text/40 dark:text-dark-text/40">{icon}</div>
            <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 pl-10 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg" />
        </div>
    );
    
    if (isDemo) return null;

    if (!isEditing && !hasDetails) {
        return (
            <div className="mt-6 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg text-center">
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent font-bold py-2 px-4 rounded-md hover:bg-light-accent/30 dark:hover:bg-dark-accent/30 transition-colors"
                >
                    + Add Dive Log Details
                </button>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="mt-6 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg animate-fade-in">
                <h4 className="font-heading font-semibold text-lg mb-3">Edit Dive Log</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField name="location" value={details.location} onChange={handleChange} placeholder="Location (e.g., Grand Cayman)" className="sm:col-span-2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>} />
                    <InputField name="dive_time" type="number" value={details.dive_time} onChange={handleChange} placeholder="Dive Time (min)" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>} />
                    <InputField name="max_depth" type="number" value={details.max_depth} onChange={handleChange} placeholder="Max Depth (m)" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 6.168A1 1 0 008 7.236v5.528a1 1 0 001.555.832l3.333-2.764a1 1 0 000-1.664L9.555 6.168z" clipRule="evenodd" /></svg>} />
                    <InputField name="dive_buddy" value={details.dive_buddy} onChange={handleChange} placeholder="Dive Buddy" className="sm:col-span-2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015.5-4.96A5 5 0 0117 11v1a3 3 0 00-3-3h-2a3 3 0 00-3 3v1a5 5 0 01-5.5 4.96A5 5 0 011 11v-1a3 3 0 003 3h2a3 3 0 003-3v-1z" /></svg>} />
                    <div className="relative sm:col-span-2">
                        <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none text-light-text/40 dark:text-dark-text/40"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></div>
                        <textarea name="notes" value={details.notes} onChange={handleChange} placeholder="Notes about the dive..." rows={3} className="w-full p-2 pl-10 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg" />
                    </div>
                     <div className="relative sm:col-span-2">
                        <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none text-light-text/40 dark:text-dark-text/40"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></div>
                        <textarea name="species_sighted" value={details.species_sighted} onChange={handleChange} placeholder="e.g., Turtle, Barracuda, Clownfish" rows={2} className="w-full p-2 pl-10 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-light-primary-start to-light-accent text-white font-bold py-2 px-4 rounded-md">Save Log</button>
                    <button onClick={handleCancel} className="bg-light-text/10 dark:bg-dark-text/10 px-4 py-2 rounded-md">Cancel</button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="mt-6 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                 <h4 className="font-heading font-semibold text-lg">Dive Log Details</h4>
                 <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-light-accent dark:text-dark-accent">Edit</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm leading-relaxed">
                {briefing.location && <p><strong>📍 Location:</strong> {briefing.location}</p>}
                {briefing.dive_time && <p><strong>⏱️ Time:</strong> {briefing.dive_time} min</p>}
                {briefing.max_depth && <p><strong>🌊 Depth:</strong> {briefing.max_depth} m</p>}
                {briefing.dive_buddy && <p><strong>🤝 Buddy:</strong> {briefing.dive_buddy}</p>}
                {briefing.species_sighted && <p className="col-span-2"><strong>🐠 Species Sighted:</strong> {briefing.species_sighted}</p>}
                {briefing.notes && <p className="col-span-2"><strong>📝 Notes:</strong> {briefing.notes}</p>}
            </div>
        </div>
    );
};
