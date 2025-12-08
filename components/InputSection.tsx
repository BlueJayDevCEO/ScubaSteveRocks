
import React, { useState, useRef, useEffect, useContext } from 'react';
import { User } from '../types';
import { AppContext } from '../App';
import { REGIONS } from '../services/marineSightings';

interface InputSectionProps {
  files: File[] | null;
  onFileChange: (files: File[] | null) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  onAttemptIdentify: () => void;
  isLoading: boolean;
  isBriefingLimitReached: boolean;
  remainingBriefings: number;
  onCancel?: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  files,
  onFileChange,
  prompt,
  onPromptChange,
  location,
  onLocationChange,
  region,
  onRegionChange,
  onAttemptIdentify,
  isLoading,
  isBriefingLimitReached,
  remainingBriefings,
  onCancel
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const context = useContext(AppContext);
  const user = context?.user;
  
  // Strict Guest Check
  const isGuest = user?.uid === 'mock-demo-user' || user?.email === 'scubasteve@scubasteve.rocks';

  useEffect(() => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        
        return () => URL.revokeObjectURL(objectUrl);
      }
    }
    setPreviewUrl(null);
  }, [files]);


  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    // Enabled for guests now (they have a limit)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(Array.from(e.target.files));
    }
  };

  const handleClearAll = () => {
      onFileChange(null);
      onPromptChange('');
      onLocationChange('');
      onRegionChange('');
      setShowLocationError(false);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const triggerFileSelect = () => {
      fileInputRef.current?.click();
  };

  const handleIdentifyClick = () => {
      if (!location.trim() || !region) {
          setShowLocationError(true);
          return;
      }
      setShowLocationError(false);
      onAttemptIdentify();
  };

  const hasContent = (files && files.length > 0);

  if (!user) return null;

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 flex flex-col gap-6 self-start">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl">Marine Species ID</h2>
          <p className="text-light-text/70 dark:text-dark-text/70">Upload photos or videos to identify marine life.</p>
        </div>
      </div>
      
      {files && files.length > 0 ? (
          <div className="animate-fade-in space-y-3">
              {previewUrl && (
                  <div className="relative w-full h-40 bg-light-bg dark:bg-dark-bg rounded-lg flex items-center justify-center border border-black/5 dark:border-white/5 p-1">
                      <img src={previewUrl} alt="Upload preview" className="max-w-full max-h-full object-contain rounded" />
                  </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-black/5 dark:border-white/5">
                  <div className="flex-shrink-0">
                      {files[0].type.startsWith('image/') ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                  </div>
                  <div className="flex-grow min-w-0">
                      <p className="truncate text-sm font-semibold text-light-text dark:text-dark-text">
                          {files.length === 1 ? files[0].name : `${files.length} files selected`}
                      </p>
                      <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                          {files.length === 1 ? `${(files[0].size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </p>
                  </div>
                  <button 
                      onClick={() => onFileChange(null)} 
                      className="flex-shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors flex items-center gap-1" 
                      aria-label="Remove file"
                  >
                      <span className="text-xs font-bold">Remove</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
          </div>
      ) : (
        <div 
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-light-accent dark:border-dark-accent bg-light-accent/5 dark:bg-dark-accent/5' : 'border-light-text/20 dark:border-dark-text/20 hover:border-light-accent/70 dark:hover:border-dark-accent/70'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
        >
            <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-light-text/40 dark:text-dark-text/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a4 4 0 01-4 4h-1" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01" /></svg>
                <p className="font-semibold text-light-text/80 dark:text-dark-text/80">
                    Drag & drop media or <span className="text-light-accent dark:text-dark-accent font-bold">browse files</span>
                </p>
                <p className="text-xs text-light-text/60 dark:text-dark-text/60">Max 20MB per file. PNG, JPG, WEBP, MP4, MOV, etc.</p>
            </div>
        </div>
      )}

      {/* Location & Region Inputs - REQUIRED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="region" className="block font-semibold mb-1 text-light-text dark:text-dark-text">
                Region <span className="text-red-500">*</span>
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => {
                  onRegionChange(e.target.value);
                  if (e.target.value) setShowLocationError(false);
              }}
              className={`w-full p-3 bg-light-bg dark:bg-dark-bg border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-all ${showLocationError && !region ? 'border-red-500 ring-1 ring-red-500' : 'border-light-text/20 dark:border-dark-text/20'}`}
              disabled={isBriefingLimitReached || isLoading}
            >
                <option value="" disabled>Select Region</option>
                {REGIONS.filter(r => r !== 'Global').map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block font-semibold mb-1 text-light-text dark:text-dark-text">
                Specific Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => {
                  onLocationChange(e.target.value);
                  if (e.target.value.trim()) setShowLocationError(false);
              }}
              placeholder="e.g. Blue Hole"
              className={`w-full p-3 bg-light-bg dark:bg-dark-bg border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-all ${showLocationError && !location.trim() ? 'border-red-500 ring-1 ring-red-500' : 'border-light-text/20 dark:border-dark-text/20'}`}
              disabled={isBriefingLimitReached || isLoading}
            />
          </div>
      </div>
      
      {showLocationError && (
        <p className="text-red-500 text-sm font-semibold animate-fade-in text-center bg-red-100 dark:bg-red-900/30 p-2 rounded">
            Where did you take this photo? Please select a Region AND type the dive site/area so I can pin it on the world map.
        </p>
      )}

      <div>
        <label htmlFor="prompt" className="block font-semibold mb-1 text-light-text/80 dark:text-dark-text/80 text-sm">Additional Notes (Optional)</label>
        <textarea
          id="prompt"
          rows={2}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., 'Found at 15m depth, very aggressive behavior.'"
          className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-text/20 dark:border-dark-text/20 rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-all disabled:opacity-50 text-sm"
          disabled={isBriefingLimitReached || isLoading}
        />
      </div>
      
      <div className="flex gap-3">
          {/* Clear/Reset Button */}
          {!isLoading && hasContent && (
              <button
                onClick={handleClearAll}
                className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Clear all inputs"
              >
                  Clear
              </button>
          )}

          {/* Main Action / Cancel Button */}
          {isLoading && onCancel ? (
              <button 
                onClick={onCancel}
                className="flex-grow bg-red-500 text-white font-heading font-bold text-2xl py-3 rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Cancel Request
              </button>
          ) : (
              <button 
                onClick={handleIdentifyClick}
                disabled={isLoading || isBriefingLimitReached || !hasContent}
                className="flex-grow bg-gradient-to-r from-light-primary-start to-light-accent text-white font-heading font-bold text-2xl py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20 transform hover:-translate-y-0.5 active:translate-y-0 disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              >
                {isBriefingLimitReached ? 'Daily Limit Reached' : 'Identify'}
              </button>
          )}
      </div>

       <div className="text-center text-sm p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-accent/10 dark:border-dark-accent/10">
            {isGuest ? (
                <p>Guest Mode: <span className="font-bold text-light-accent dark:text-dark-accent">Limited daily IDs</span> available. Sign in for more.</p>
            ) : (
                <p>
                    You have <span className="font-bold text-light-accent dark:text-dark-accent">{remainingBriefings}</span> free briefings left today.
                </p>
            )}
        </div>
    </div>
  );
};
