import React, { useState, useContext, useMemo } from 'react';
import { AppContext, IdentifyViewTab } from '../../App';
import { Briefing } from '../../types';
import { BriefingCard } from '../ContributionsLog';
import { ResultDisplay } from '../ResultDisplay';
import { InputSection } from '../InputSection';
import { ColorCorrectionView } from '../ColorCorrectionView';
import { DAILY_STANDARD_LIMIT, incrementUserBriefingCount, getUser } from '../../services/userService';
import { CorrectionStyle, generateSpeciesImage } from '../../services/geminiService';
import { updateBriefing } from '../../services/jobService';

interface IdentifyViewProps {
  initialTab: IdentifyViewTab;
  selectedFiles: File[] | null;
  setSelectedFiles: (files: File[] | null) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleMarineId: (files: File[] | null, prompt: string, location: string, region: string) => void;
  handleColorCorrect: (files: File[], style: CorrectionStyle) => void;
  handleSpeciesSearch: (query: string) => void;
  handleStartNewIdentification: () => void;
  isLoading: boolean;
  error: string | null;
  isCorrecting: boolean;
  currentBriefingResult: Briefing | null;
  setCurrentBriefingResult: (briefing: Briefing | null) => void;
  handleCorrection: (briefingId: number, correctedName: string) => void;
  handleConfirmIdentification: (briefingId: number) => void;
  handleUpdateBriefingDetails: (
    briefingId: number,
    details: Partial<
      Pick<Briefing, 'location' | 'dive_time' | 'max_depth' | 'dive_buddy' | 'notes' | 'species_sighted'>
    >
  ) => void;
  handleOpenChat: (context?: Briefing | null, message?: string | null) => void;
  onOpenLimitModal: () => void;
  isBriefingLimitReached: boolean;
  handleSelectBriefingFromHistory: (briefing: Briefing) => void;
  onCancel?: () => void;
  onShowMap: () => void;
}

const IdentifyView: React.FC<IdentifyViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<IdentifyViewTab>(props.initialTab || 'upload');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'species_asc' | 'species_desc'>('date_desc');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');

  const context = useContext(AppContext);
  if (!context) return null;
  const { user, briefings, setBriefings, setUser } = context;

  const sortedGalleryBriefings = useMemo(() => {
    const filtered = briefings.filter(
      (b) =>
        (b.type === 'marine_id' || b.type === 'color_correct') &&
        b.input.imageUrls &&
        b.input.imageUrls.length > 0
    );

    return filtered.sort((a, b) => {
      if (sortOption === 'date_desc') return b.createdAt - a.createdAt;
      if (sortOption === 'date_asc') return a.createdAt - b.createdAt;

      const nameA = (a.correction?.final_species || a.output?.suggestion?.species_name || 'Unknown').toLowerCase();
      const nameB = (b.correction?.final_species || b.output?.suggestion?.species_name || 'Unknown').toLowerCase();

      if (sortOption === 'species_asc') return nameA.localeCompare(nameB);
      if (sortOption === 'species_desc') return nameB.localeCompare(nameA);

      return 0;
    });
  }, [briefings, sortOption]);

  const handleGenerateImage = async (briefingId: number, speciesName: string) => {
    if (props.isBriefingLimitReached) {
      props.onOpenLimitModal();
      return;
    }

    setIsGeneratingImage(true);

    // Image generation counts as a heavy action
    incrementUserBriefingCount(user.uid, 'marine_id');
    const updatedUser = getUser(user.uid);
    if (updatedUser) setUser(updatedUser);

    try {
      const imageUrl = await generateSpeciesImage(speciesName);

      const updatedBriefings = briefings.map((b) => {
        if (b.id === briefingId) {
          const updated = {
            ...b,
            output: {
              ...b.output,
              generatedImageUrl: imageUrl,
            },
          };

          updateBriefing(updated as Briefing);

          if (props.currentBriefingResult && props.currentBriefingResult.id === briefingId) {
            props.setCurrentBriefingResult(updated as Briefing);
          }
          return updated as Briefing;
        }
        return b;
      });

      setBriefings(updatedBriefings);
    } catch (e) {
      console.error('Failed to generate species image', e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleStartNew = () => {
    setLocation('');
    setRegion('');
    props.handleStartNewIdentification();
  };

  const remaining = DAILY_STANDARD_LIMIT - (user.dailyUsage.briefingCount || 0);

  const TabButton: React.FC<{
    id: IdentifyViewTab;
    label: string;
    icon?: string;
  }> = ({ id, label, icon }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={[
          'px-4 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all',
          'border',
          active
            ? 'bg-white/80 dark:bg-white/15 border-white/20 text-light-text dark:text-dark-text shadow-sm'
            : 'bg-transparent border-transparent text-light-text/70 dark:text-dark-text/70 hover:bg-white/10 hover:border-white/10',
        ].join(' ')}
        type="button"
        aria-current={active ? 'page' : undefined}
      >
        <span className="inline-flex items-center gap-2">
          {icon ? <span className="text-base">{icon}</span> : null}
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Top bar: title + tabs + map */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-light-text dark:text-dark-text tracking-tight">
                Marine Identification
              </h1>
              <p className="mt-1 text-sm sm:text-base text-light-text/70 dark:text-dark-text/70">
                Upload a photo, search a species, browse your gallery, or correct colors.
              </p>
            </div>

            <button
              onClick={props.onShowMap}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-2xl font-bold border border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition"
              type="button"
              title="Open world sightings map"
            >
              🌍 World Sightings
            </button>
          </div>

          {/* Tabs container */}
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <TabButton id="upload" label="Photo Upload" icon="📷" />
              <TabButton id="search" label="Species Search" icon="🔎" />
              <TabButton id="gallery" label="Gallery" icon="🖼️" />
              <TabButton id="color" label="Color Fix" icon="🎨" />

              {/* Map on mobile */}
              <button
                onClick={props.onShowMap}
                className="sm:hidden px-4 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all bg-transparent text-light-text/70 dark:text-dark-text/70 hover:bg-white/10"
                type="button"
              >
                🌍 Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {/* UPLOAD */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: input */}
            <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
              <InputSection
                files={props.selectedFiles}
                onFileChange={props.setSelectedFiles}
                prompt={props.prompt}
                onPromptChange={props.setPrompt}
                location={location}
                onLocationChange={setLocation}
                region={region}
                onRegionChange={setRegion}
                onAttemptIdentify={() =>
                  props.handleMarineId(props.selectedFiles, props.prompt, location, region)
                }
                isLoading={props.isLoading}
                isBriefingLimitReached={props.isBriefingLimitReached}
                remainingBriefings={remaining}
                onCancel={props.onCancel}
              />
            </div>

            {/* Right: result */}
            <div>
              {props.currentBriefingResult && props.currentBriefingResult.type === 'marine_id' ? (
                <ResultDisplay
                  briefing={props.currentBriefingResult}
                  onCorrectionSubmit={props.handleCorrection}
                  onConfirmIdentification={props.handleConfirmIdentification}
                  onUpdateBriefingDetails={props.handleUpdateBriefingDetails}
                  isLoading={props.isLoading}
                  onStartChat={() => props.handleOpenChat(props.currentBriefingResult)}
                  isCorrecting={props.isCorrecting}
                  isDemo={false}
                  onStartNewIdentification={handleStartNew}
                  onGenerateImage={handleGenerateImage}
                  isGeneratingImage={isGeneratingImage}
                />
              ) : (
                <div className="sticky top-28 rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-8 min-h-[420px] flex flex-col items-center justify-center text-center">
                  <div className="text-5xl opacity-70">🛰️</div>
                  <h3 className="font-heading font-extrabold text-2xl mt-4 text-light-text dark:text-dark-text">
                    Awaiting your upload
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-light-text/70 dark:text-dark-text/70 max-w-md">
                    Choose a photo and hit identify. Your results will appear here with species info and dive log options.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-light-text/70 dark:text-dark-text/70">
                    Remaining today: {Math.max(remaining, 0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab === 'search' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-6 sm:p-8 mb-8">
              <div className="text-center">
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mb-2 text-light-text dark:text-dark-text">
                  Marine Species Search
                </h2>
                <p className="text-light-text/70 dark:text-dark-text/70">
                  Know the name? Look up detailed info, facts, and photos instantly.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="text"
                  value={props.prompt}
                  onChange={(e) => props.setPrompt(e.target.value)}
                  placeholder="Enter species name (e.g., Great Barracuda)"
                  className="w-full p-4 rounded-2xl bg-white/70 dark:bg-black/30 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent text-base sm:text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && props.handleSpeciesSearch(props.prompt)}
                  disabled={props.isLoading || props.isBriefingLimitReached}
                />

                {props.isLoading && props.onCancel ? (
                  <button
                    onClick={props.onCancel}
                    className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-heading font-extrabold text-lg py-3 hover:bg-red-500/15 transition"
                    type="button"
                  >
                    Cancel Search
                  </button>
                ) : (
                  <button
                    onClick={() => props.handleSpeciesSearch(props.prompt)}
                    disabled={props.isBriefingLimitReached || !props.prompt.trim()}
                    className="w-full rounded-2xl bg-white text-black font-heading font-extrabold text-lg py-3 hover:opacity-95 transition disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    type="button"
                  >
                    {props.isBriefingLimitReached ? 'Limit Reached' : 'Search'}
                  </button>
                )}

                {props.error ? (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-2 text-center">{props.error}</p>
                ) : null}
              </div>
            </div>

            {props.currentBriefingResult && props.currentBriefingResult.type === 'species_search' && (
              <ResultDisplay
                briefing={props.currentBriefingResult}
                onCorrectionSubmit={props.handleCorrection}
                onConfirmIdentification={props.handleConfirmIdentification}
                onUpdateBriefingDetails={props.handleUpdateBriefingDetails}
                isLoading={props.isLoading}
                onStartChat={() => props.handleOpenChat(props.currentBriefingResult)}
                isCorrecting={props.isCorrecting}
                isDemo={false}
                onStartNewIdentification={handleStartNew}
                onGenerateImage={handleGenerateImage}
                isGeneratingImage={isGeneratingImage}
              />
            )}
          </div>
        )}

        {/* GALLERY */}
        {activeTab === 'gallery' && (
          <div>
            <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-light-text dark:text-dark-text">
                    Your Gallery
                  </h2>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    Browse your identifications and color corrections.
                  </p>
                </div>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="p-2.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-black/10 dark:border-white/10 text-sm font-semibold text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="species_asc">Species (A-Z)</option>
                  <option value="species_desc">Species (Z-A)</option>
                </select>
              </div>
            </div>

            {sortedGalleryBriefings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedGalleryBriefings.map((b) => (
                  <BriefingCard key={b.id} briefing={b} onSelectBriefing={props.handleSelectBriefingFromHistory} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-black/10 dark:border-white/15 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-10 text-center">
                <div className="text-4xl opacity-70">🖼️</div>
                <h3 className="mt-3 font-heading font-extrabold text-xl text-light-text dark:text-dark-text">
                  Your gallery is empty
                </h3>
                <p className="mt-2 text-sm text-light-text/70 dark:text-dark-text/70">
                  Your identified species and color corrections will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* COLOR */}
        {activeTab === 'color' && (
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6">
            <ColorCorrectionView
              isLoading={props.isLoading}
              startBriefing={props.handleColorCorrect}
              currentBriefingResult={props.currentBriefingResult}
              error={props.error}
              isBriefingLimitReached={props.isBriefingLimitReached}
              onOpenChat={() => props.handleOpenChat(null, null)}
              onStartNew={handleStartNew}
              onCancel={props.onCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentifyView;
