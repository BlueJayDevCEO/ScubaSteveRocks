
import React from 'react';
import { Briefing } from '../types';
import { BriefingResultContainer } from './JobResultContainer';
import { ScubaSteveLogo } from './ScubaSteveLogo';

const formatMarkdown = (content: string) => {
    if (!content) return { __html: '' };
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    return { __html: html };
};

interface SharedBriefingViewProps {
    briefing: Briefing;
}

export const SharedBriefingView: React.FC<SharedBriefingViewProps> = ({ briefing }) => {
    let content = null;
    let title = "Shared Briefing";
    // Default icon, can be specialized based on type if needed
    let icon = <ScubaSteveLogo className="w-8 h-8 rounded-full" />;

    if (briefing.type === 'marine_id' && briefing.output?.suggestion) {
        const result = briefing.output.suggestion;
        title = result.species_name;
        content = (
            <div className="flex flex-col gap-4">
                <p className="text-xl italic">"{result.greeting}"</p>
                {briefing.input.imageUrls?.[0] && (
                    <div className="flex justify-center">
                        <img src={briefing.input.imageUrls[0]} alt={title} className="rounded-lg max-h-96 object-contain shadow-md" />
                    </div>
                )}
                <div dangerouslySetInnerHTML={formatMarkdown(result.main_text)} className="prose dark:prose-invert max-w-none text-left" />
            </div>
        );
    } else if (briefing.type === 'dive_site' && briefing.output?.briefing) {
        title = briefing.input.prompt || "Dive Site";
        content = (
             <div dangerouslySetInnerHTML={formatMarkdown(briefing.output.briefing.briefing)} className="prose dark:prose-invert max-w-none text-left" />
        );
    } else if (briefing.type === 'color_correct' && briefing.output?.correctedImageUrl) {
        title = "Color Correction";
        content = (
            <div className="flex flex-col gap-4 items-center">
                <div className="w-full max-w-lg">
                    <p className="font-bold mb-2">Original:</p>
                    <img src={briefing.input.imageUrls?.[0]} alt="Original" className="rounded-lg w-full mb-4" />
                    <p className="font-bold mb-2">Corrected by Scuba Steve:</p>
                    <img src={briefing.output.correctedImageUrl} alt="Corrected" className="rounded-lg w-full shadow-lg" />
                </div>
            </div>
        );
    } else {
        title = "Shared Content";
        content = (
            <div className="text-center py-8">
                <p className="text-lg text-light-text/80 dark:text-dark-text/80">This content type is not fully supported in the shared view yet.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 flex items-center justify-center">
            <div className="w-full max-w-3xl animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-white dark:bg-dark-card rounded-full shadow-lg mb-4">
                        <ScubaSteveLogo className="w-16 h-16 rounded-full" />
                    </div>
                    <h1 className="font-heading font-bold text-3xl text-light-text dark:text-dark-text">Scuba Steve AI™</h1>
                    <p className="text-light-text/70 dark:text-dark-text/70">Shared Discovery</p>
                </div>
                
                <BriefingResultContainer
                    briefing={briefing}
                    title={title}
                    icon={icon}
                    footerText="Discover more with Scuba Steve - Your AI Dive Buddy"
                >
                    {content}
                </BriefingResultContainer>

                <div className="mt-8 text-center">
                    <a href="/" className="bg-gradient-to-r from-light-accent to-light-secondary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform inline-block">
                        Try Scuba Steve Yourself
                    </a>
                </div>
            </div>
        </div>
    );
};
