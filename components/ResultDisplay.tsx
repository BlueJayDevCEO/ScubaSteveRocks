
import React, { useState, useContext } from 'react';
import { Briefing } from '../types';
import { AppContext } from '../App';
import { BriefingResultContainer } from './JobResultContainer';
import { EditableDiveLogDetails } from './EditableDiveLogDetails';

const ConfidenceMeter: React.FC<{ score: number }> = ({ score }) => {
  let label = "Positive ID";
  let color = "bg-green-500 dark:bg-green-400";
  const width = Math.max(5, score); // Ensure a minimum width for visibility

  if (score < 70) {
    label = "Just a hunch";
    color = "bg-yellow-500 dark:bg-yellow-400";
  } else if (score < 95) {
    label = "Pretty Sure";
    color = "bg-light-primary-end dark:bg-dark-primary-end";
  }

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-heading font-semibold text-lg">Steve's Confidence</h4>
        <span className={`font-bold text-sm`}>
          {label}
        </span>
      </div>
      <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-4 overflow-hidden border border-black/5 dark:border-white/5">
        <div 
          className={`h-4 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <p className="text-right text-sm font-mono mt-1 text-light-text/70 dark:text-dark-text/70">{score}%</p>
    </div>
  );
};

interface ResultDisplayProps {
  briefing: Briefing;
  onCorrectionSubmit: (briefingId: number, correctedName: string) => void;
  onConfirmIdentification: (briefingId: number) => void;
  onUpdateBriefingDetails: (briefingId: number, details: Partial<Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>>) => void;
  isLoading: boolean;
  onStartChat: (context: Briefing) => void;
  isCorrecting: boolean;
  isDemo?: boolean;
  onStartNewIdentification?: () => void;
  onGenerateImage?: (briefingId: number, speciesName: string) => void;
  isGeneratingImage?: boolean;
}

const formatEducationalText = (markdown: string) => {
    if (!markdown) return { __html: '' };

    let html = markdown
        .replace(/\(([^)]+)\)/g, '(<em>$1</em>)')
        .replace(/^\*\*(.*)\*\*$/gm, '<h4 class="font-heading font-semibold text-lg mt-4 mb-2 text-light-accent dark:text-dark-accent">$1</h4>')
        .replace(/(?:^\* .*\r?\n?)+/gm, (match) => {
            const items = match.trim().split('\n').map(item => `<li>${item.substring(2).trim()}</li>`).join('');
            return `<ul class="list-disc list-inside space-y-1 ml-2 mb-4">${items}</ul>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');

    return { __html: html };
};

const getPlaceholderImage = (text: string) => {
  // Use placehold.co for a clean, generated image with the text
  const encodedText = encodeURIComponent(text);
  return `https://placehold.co/600x400/0077b6/ffffff?text=${encodedText}`;
};

const getGoogleImageSearchLink = (term: string) => {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(term + " marine life")}`;
};

const getFishBaseSearchLink = (term: string) => {
    return `https://www.fishbase.se/search.php?q=${encodeURIComponent(term)}`;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ briefing, onCorrectionSubmit, onConfirmIdentification, onUpdateBriefingDetails, isLoading, onStartChat, isCorrecting, isDemo, onStartNewIdentification, onGenerateImage, isGeneratingImage }) => {
    const [correctedName, setCorrectedName] = useState('');
    const context = useContext(AppContext);
    const user = context?.user;

    const result = briefing.output?.suggestion;

    if (!result || !user) {
        return (
            <BriefingResultContainer
                briefing={briefing}
                title={isDemo ? "How it Works" : "Result"}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            >
                <div className="text-center p-8">
                    {isDemo 
                        ? <p>Try identifying a species from an example, or upload your own media in the section to the left.</p>
                        : <p>No identification result available for this briefing.</p>
                    }
                </div>
            </BriefingResultContainer>
        );
    }
    
    const footerWithLink = result.footer.replace(
        'Scuba Steve',
        '<a href="/" class="font-bold text-light-accent dark:text-dark-accent hover:underline">Scuba Steve AI™</a>'
    );

                  // Treat undefined as "not logged yet" (common in your objects)
              const isConfirmed = briefing.contributionLogged === true && !briefing.correction;
              const isCorrected = briefing.contributionLogged === true && !!briefing.correction;
              
              // ✅ Show actions whenever it's not explicitly logged yet
              const needsAction = briefing.contributionLogged !== true && !isDemo;


    const actions = !isDemo ? (
        <div className="flex flex-wrap items-center gap-2">
            <button 
                onClick={() => onStartChat(briefing)}
                className="bg-gradient-to-r from-light-primary-start to-light-accent text-white dark:from-dark-primary-start dark:to-dark-accent font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
            >
                Discuss with Steve
            </button>
            <a 
                href={getGoogleImageSearchLink(result.species_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-bold py-2 px-4 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2 border border-black/10 dark:border-white/10"
                title="Search Google Images"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Google Images
            </a>
             <a 
                href={getFishBaseSearchLink(result.species_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-bold py-2 px-4 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2 border border-black/10 dark:border-white/10"
                title="Search FishBase"
            >
                <span className="text-lg">🐟</span>
                FishBase
            </a>
            {onStartNewIdentification && (
                <button 
                    onClick={onStartNewIdentification}
                    className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-bold py-2 px-4 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap border border-black/10 dark:border-white/10"
                >
                    New Identification
                </button>
            )}
        </div>
    ) : undefined;

    // Determine which image to show: User uploaded > AI Generated > Placeholder
    const userImage = briefing.input?.imageUrls && briefing.input.imageUrls[0];
    const aiImage = briefing.output?.generatedImageUrl;

    return (
        <BriefingResultContainer
            briefing={briefing}
            title={result.species_name}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            actions={actions}
        >
            <div className="flex flex-col gap-4">
                <p className="text-xl text-light-text/80 dark:text-dark-text/80 italic">"{result.greeting}"</p>
                <ConfidenceMeter score={result.confidence} />
                
                {userImage ? (
                    <div className="w-full max-h-72 bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center p-2 relative">
                        <img src={userImage} alt={result.species_name} className="rounded-md max-w-full max-h-[272px] object-contain" />
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">User Upload</div>
                    </div>
                ) : aiImage ? (
                     <div className="w-full max-h-72 bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center p-2 relative group">
                        <img src={aiImage} alt={`AI Generated ${result.species_name}`} className="rounded-md max-w-full max-h-[272px] object-contain" />
                        <div className="absolute bottom-3 right-3 bg-light-accent/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-bold shadow-sm">AI Generated Visualization</div>
                    </div>
                ) : (
                    <div className="relative w-full max-h-72 bg-light-bg dark:bg-dark-bg rounded-lg overflow-hidden border border-black/10 dark:border-white/10 group">
                         <img 
                            src={getPlaceholderImage(result.species_name)} 
                            alt={result.species_name}
                            className="w-full h-64 object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                             {onGenerateImage && (
                                 <button 
                                    onClick={() => onGenerateImage(briefing.id, result.species_name)}
                                    disabled={isGeneratingImage}
                                    className="bg-gradient-to-r from-light-accent to-light-secondary text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none"
                                 >
                                    {isGeneratingImage ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Visualize with AI
                                        </>
                                    )}
                                 </button>
                             )}
                             <p className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">No image provided</p>
                        </div>
                    </div>
                )}

                <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={formatEducationalText(result.main_text)}
                />
                
                {/* Similar Species Section - Visual Grid */}
                {result.similar_species && result.similar_species.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-heading font-semibold text-lg mb-3">Similar Species & Lookalikes</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {result.similar_species.map((species, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-black/10 dark:border-white/10 bg-black">
                                    {/* Placeholder Image acting as the card background */}
                                    <img 
                                        src={getPlaceholderImage(species)} 
                                        alt={species}
                                        className="w-full h-28 object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-40"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                                        <span className="text-white text-xs font-medium opacity-90 mb-0.5 uppercase tracking-wide">Compare On</span>
                                        <span className="text-white text-sm font-bold truncate w-full text-shadow-sm leading-tight mb-2">{species}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            <a 
                                                href={getGoogleImageSearchLink(species)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white/20 backdrop-blur-md p-1.5 rounded-full hover:bg-white/40 text-white"
                                                title="Google Images"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </a>
                                            <a 
                                                href={getFishBaseSearchLink(species)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white/20 backdrop-blur-md p-1.5 rounded-full hover:bg-white/40 text-white"
                                                title="FishBase"
                                            >
                                                <span className="text-xs">🐟</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-light-text/60 dark:text-dark-text/60 mt-2 italic text-center">
                            Hover to compare on Google or FishBase.
                        </p>
                    </div>
                )}

                {/* Credible References Section */}
                {result.references && result.references.length > 0 && (
                    <div className="mt-4 p-4 border border-light-accent/20 dark:border-dark-accent/20 rounded-lg bg-light-bg/30 dark:bg-dark-bg/30">
                        <h4 className="font-heading font-semibold text-lg mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494M12 6.253A3.75 3.75 0 1115.75 10H12v2.507A3.75 3.75 0 1112 6.253z" /></svg>
                            Credible Sources
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {result.references.map((ref, idx) => (
                                <li key={idx} className="truncate">
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-light-primary-end dark:text-dark-primary-end hover:underline" title={ref.title}>
                                        {ref.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {!isDemo && (
                    <div className="mt-4 p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg">
                        {isConfirmed && <p className="font-semibold text-green-600 dark:text-green-400 text-center">✅ Sighting confirmed and logged to community map!</p>}
                        {isCorrected && <p className="font-semibold text-green-600 dark:text-green-400 text-center">✅ Correction submitted and logged. Thank you!</p>}

                        {needsAction && (
                             <div className="flex flex-col gap-4">
                                <p className="font-semibold text-center">Does this look right? Help our community by confirming or correcting.</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => onConfirmIdentification(briefing.id)} className="flex-1 bg-green-500/20 text-green-700 dark:text-green-300 dark:bg-green-500/20 font-bold py-2 px-4 rounded-md">
                                        Yes, that's it!
                                    </button>
                                     <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={correctedName} 
                                            onChange={(e) => setCorrectedName(e.target.value)} 
                                            placeholder="Enter correct species..."
                                            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg"
                                        />
                                        <button onClick={() => onCorrectionSubmit(briefing.id, correctedName)} disabled={!correctedName.trim() || isCorrecting} className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 dark:bg-yellow-500/20 font-bold p-2 rounded-md disabled:opacity-50">
                                            {isCorrecting ? '...' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <EditableDiveLogDetails briefing={briefing} onSave={(details) => onUpdateBriefingDetails(briefing.id, details)} isDemo={isDemo} />

                <p className="mt-4 text-sm text-light-text/60 dark:text-dark-text/60 italic" dangerouslySetInnerHTML={{ __html: footerWithLink }} />
            </div>
        </BriefingResultContainer>
    );
};
