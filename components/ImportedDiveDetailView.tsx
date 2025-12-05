
import React, { useRef } from 'react';
import { Briefing } from '../types';
import { BriefingResultContainer } from './JobResultContainer';
import { EditableDiveLogDetails } from './EditableDiveLogDetails';

interface ImportedDiveDetailViewProps {
    briefing: Briefing;
    onUpdateBriefingDetails: (briefingId: number, details: Partial<Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>>) => void;
    onUpdateBriefingImage: (briefingId: number, imageUrl: string) => void;
    onOpenChat: () => void;
}

export const ImportedDiveDetailView: React.FC<ImportedDiveDetailViewProps> = ({ briefing, onUpdateBriefingDetails, onUpdateBriefingImage, onOpenChat }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (briefing.type !== 'imported_dive') {
        return <p>Invalid briefing type for this view.</p>;
    }

    const handlePhotoUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                onUpdateBriefingImage(briefing.id, imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const hasImage = briefing.input?.imageUrls && briefing.input.imageUrls.length > 0;

    return (
        <BriefingResultContainer
            briefing={briefing}
            title={briefing.location || 'Imported Dive'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
            actions={
                <button 
                    onClick={onOpenChat}
                    className="bg-gradient-to-r from-light-primary-start to-light-accent text-white dark:from-dark-primary-start dark:to-dark-accent font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
                >
                    Discuss with Steve
                </button>
            }
        >
            {hasImage ? (
                <div className="my-4">
                    <div className="w-full max-h-96 bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center p-2">
                        <img src={briefing.input.imageUrls![0]} alt={`Dive at ${briefing.location}`} className="rounded-md max-w-full max-h-[368px] object-contain" />
                    </div>
                </div>
            ) : (
                <div className="my-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button 
                        onClick={handlePhotoUploadClick}
                        className="w-full bg-light-bg dark:bg-dark-bg border-2 border-dashed border-light-accent/50 dark:border-dark-accent/50 rounded-lg p-8 text-center hover:border-light-accent dark:hover:border-dark-accent transition-colors"
                    >
                        <div className="flex flex-col items-center gap-2 text-light-text/70 dark:text-dark-text/70">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="font-semibold text-lg">Add a Dive Photo</span>
                            <span className="text-sm">Help bring your log to life!</span>
                        </div>
                    </button>
                </div>
            )}
            <p className="text-xl text-center text-light-text/80 dark:text-dark-text/80">
                This dive was imported from your logbook on {new Date(briefing.createdAt).toLocaleDateString()}.
            </p>
            <EditableDiveLogDetails 
                briefing={briefing} 
                onSave={(details) => onUpdateBriefingDetails(briefing.id, details)} 
            />
        </BriefingResultContainer>
    );
};
