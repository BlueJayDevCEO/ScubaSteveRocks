
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Briefing } from '../types';
import { ImageComparator } from './ImageComparator';
import { BriefingResultContainer } from './JobResultContainer';
import { CorrectionStyle } from '../services/geminiService';

interface ColorCorrectionViewProps {
    isLoading: boolean;
    startBriefing: (mediaFiles: File[], style: CorrectionStyle) => void;
    currentBriefingResult: Briefing | null;
    error: string | null;
    isBriefingLimitReached: boolean;
    onOpenChat: () => void;
    onStartNew?: () => void;
    onCancel?: () => void;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const demoColorCorrectBriefing: Briefing = {
  id: 1,
  userId: 'demo',
  type: 'color_correct',
  status: 'completed',
  createdAt: Date.now(),
  input: {
    imageUrls: ['https://storage.googleapis.com/static.osea.app/sea-turtle-before.jpg'],
  },
  output: {
    correctedImageUrl: 'https://storage.googleapis.com/static.osea.app/sea-turtle-after.jpg'
  }
};

const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const resizeImage = (file: File, maxWidth = 1280): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        img.onload = () => {
            URL.revokeObjectURL(url);
            let width = img.width;
            let height = img.height;

            // If image is smaller than limit, return original
            if (width <= maxWidth && height <= maxWidth) {
                resolve(file);
                return;
            }
            
            // Maintain aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context unavailable"));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else {
                    reject(new Error("Image resize failed"));
                }
            }, 'image/jpeg', 0.85);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
};

const extractFrameFromVideo = (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.src = URL.createObjectURL(videoFile);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadedmetadata = () => {
            video.currentTime = video.duration / 2; // Seek to the middle
        };

        video.onseeked = () => {
            if (!ctx) return reject(new Error('Canvas context is not available.'));
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Failed to create blob from canvas.'));
                const frameFile = new File([blob], `frame-from-${videoFile.name}.jpg`, { type: 'image/jpeg' });
                URL.revokeObjectURL(video.src); // Clean up
                resolve(frameFile);
            }, 'image/jpeg', 0.95); // High quality JPEG
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Failed to load video file.'));
        };
    });
};

// --- Enhanced Animation Component ---
const ProcessingAnimation = () => {
    const [statusText, setStatusText] = useState("Calibrating white balance...");
    
    const messages = [
        "Reading the reef colors...",
        "Clearing the blue haze...",
        "Bringing back the warm reds...",
        "Filtering out backscatter...",
        "Polishing the pixels...",
        "Almost perfect..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusText(messages[Math.floor(Math.random() * messages.length)]);
        }, 3500); // Slower text rotation
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-12 relative overflow-hidden rounded-2xl bg-gradient-to-b from-light-bg to-light-primary-start/10 dark:from-dark-bg dark:to-dark-primary-start/10 w-full min-h-[400px]">
             <style>{`
                @keyframes swim-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                @keyframes rise-slow {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    30% { opacity: 0.8; }
                    100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
                }
                @keyframes breathe {
                    0% { transform: scale(0.95); opacity: 0.3; }
                    50% { transform: scale(1.05); opacity: 0.6; }
                    100% { transform: scale(0.95); opacity: 0.3; }
                }
                .animate-swim-slow { animation: swim-slow 8s ease-in-out infinite; }
                .animate-rise-slow { animation: rise-slow 5s ease-out infinite; }
                .animate-breathe { animation: breathe 4s ease-in-out infinite; }
             `}</style>

             {/* Background Breathing Ripples */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-light-accent/20 dark:border-dark-accent/20 animate-breathe"></div>
                <div className="absolute w-48 h-48 rounded-full border border-light-accent/30 dark:border-dark-accent/30 animate-breathe" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute w-80 h-80 rounded-full border border-light-accent/10 dark:border-dark-accent/10 animate-breathe" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Swimming Diver Icon - Floating Lazily */}
            <div className="relative z-10 animate-swim-slow">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-32 h-32 text-light-accent dark:text-dark-accent drop-shadow-xl" fill="currentColor">
                    <path d="M448 192c-17.7 0-32 14.3-32 32v48h-48c-17.7 0-32 14.3-32 32s14.3 32 32 32h112c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zm-256 96c-17.7 0-32 14.3-32 32v48c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32s-14.3-32-32-32h-16v-16c0-17.7-14.3-32-32-32zm160-96h-48v-16c0-17.7-14.3-32-32-32s-32 14.3-32 32v48c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32s-14.3-32-32-32zM128 224c0-17.7-14.3-32-32-32s-32 14.3-32 32v112c0 17.7 14.3 32 32 32h112c17.7 0 32-14.3 32-32s-14.3-32-32-32H160v-48h48c17.7 0 32-14.3 32-32s-14.3-32-32-32h-80z"/>
                 </svg>
                 
                 {/* Rising Bubbles */}
                 <div className="absolute -top-6 -right-2 flex flex-col items-center gap-2">
                    <div className="w-2 h-2 bg-light-accent/50 dark:bg-dark-accent/50 rounded-full animate-rise-slow"></div>
                    <div className="w-3 h-3 bg-light-accent/40 dark:bg-dark-accent/40 rounded-full animate-rise-slow" style={{ animationDelay: '1.5s' }}></div>
                    <div className="w-1.5 h-1.5 bg-light-accent/30 dark:bg-dark-accent/30 rounded-full animate-rise-slow" style={{ animationDelay: '2.5s' }}></div>
                 </div>
            </div>

            <div className="mt-10 z-10 text-center">
                <h3 className="text-2xl font-heading font-bold text-light-text dark:text-dark-text animate-pulse">
                    Developing Photo...
                </h3>
                <p className="text-lg text-light-text/80 dark:text-dark-text/80 mt-2 font-mono transition-opacity duration-500">
                    {statusText}
                </p>
            </div>
        </div>
    );
}


export const ColorCorrectionView: React.FC<ColorCorrectionViewProps> = ({ isLoading, startBriefing, currentBriefingResult, error, isBriefingLimitReached, onOpenChat, onStartNew, onCancel }) => {
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [correctionStyle, setCorrectionStyle] = useState<CorrectionStyle>('natural');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isBriefingLimitReached) return;
        const file = event.target.files?.[0];
        
        setLocalError(null); // Clear previous errors
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setLocalError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
                setMediaFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCorrect = useCallback(async () => {
        if (!mediaFile || isBriefingLimitReached) return;
        
        setLocalError(null);
        let fileToProcess = mediaFile;

        try {
            if (mediaFile.type.startsWith('video/')) {
                 fileToProcess = await extractFrameFromVideo(mediaFile);
            } else {
                // Resize image to avoid API payload limits and ensure reliability
                fileToProcess = await resizeImage(mediaFile);
            }
            
            startBriefing([fileToProcess], correctionStyle);
        } catch (err) {
            console.error("Preprocessing error:", err);
            setLocalError("Could not process image. Please try a different file.");
        }

    }, [mediaFile, startBriefing, isBriefingLimitReached, correctionStyle]);

    const handleClearSelection = useCallback(() => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleStartNew = () => {
        if (onStartNew) {
            onStartNew();
        }
        handleClearSelection();
    };

    const handleDownload = useCallback(async () => {
        const briefing = currentBriefingResult;
        if (!briefing || briefing.type !== 'color_correct' || !briefing.output?.correctedImageUrl) return;

        const blob = dataURLtoBlob(briefing.output.correctedImageUrl);
        if (!blob) return;

        const fileName = `corrected-${briefing.input?.originalFileNames?.[0] || 'image.jpg'}`;
        const file = new File([blob], fileName, { type: blob.type });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Corrected Image',
                    text: 'Here is the color-corrected image from Scuba Steve.',
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                  console.error('Error sharing file:', error);
                }
            }
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, [currentBriefingResult]);

    const hasResult = !!(currentBriefingResult && currentBriefingResult.type === 'color_correct');
    
    const styleOptions: { id: CorrectionStyle; label: string; description: string }[] = [
        { id: 'natural', label: 'Natural', description: 'Realistic colors, as if in shallow water.' },
        { id: 'vibrant', label: 'Vibrant', description: 'Enhanced saturation and contrast for a punchy look.' },
        { id: 'deep_water', label: 'Deep Water', description: 'Aggressively corrects heavy blue/green casts.' },
    ];

    if (isLoading) {
        return (
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full animate-fade-in">
                <ProcessingAnimation />
                 {onCancel && (
                    <div className="mt-6 text-center">
                        <button 
                            onClick={onCancel}
                            className="bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-2 px-6 rounded-full hover:bg-red-500/30 transition-colors shadow-sm"
                        >
                            Cancel Processing
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (hasResult) {
        const resultActions = (
            <>
                 <button 
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-light-primary-start to-light-accent text-white dark:from-dark-primary-start dark:to-dark-accent font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity shadow-md whitespace-nowrap flex items-center gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Corrected
                </button>
                 {onStartNew && (
                    <button 
                        onClick={handleStartNew}
                        className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-bold py-2 px-4 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                        Correct Another
                    </button>
                )}
                 <button 
                    onClick={onOpenChat}
                    className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-bold py-2 px-4 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                    Discuss with Steve
                </button>
            </>
        );

        return (
            <BriefingResultContainer
                briefing={currentBriefingResult!}
                title="Color Correction Result"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5zM7 7l5 5 5-5M7 13l5 5 5-5" /></svg>}
                actions={resultActions}
            >
                {currentBriefingResult!.input.imageUrls?.[0] && currentBriefingResult!.output?.correctedImageUrl && (
                    <ImageComparator 
                        before={currentBriefingResult!.input.imageUrls[0]}
                        after={currentBriefingResult!.output.correctedImageUrl}
                    />
                )}
            </BriefingResultContainer>
        );
    }
    
    // RENDER INPUT FORM
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full flex flex-col items-center gap-6 animate-fade-in">
            <div className="text-center max-w-2xl">
                <h2 className="font-heading font-semibold text-2xl sm:text-3xl mb-2">Underwater Photo Color Correction</h2>
                <p className="text-light-text/80 dark:text-dark-text/80">
                    Lost the vibrant reds and yellows in your underwater shots? Upload a photo or video, and I'll restore its natural colors. This uses one of your daily briefings.
                </p>
            </div>

            {mediaPreview ? (
                <div className="w-full max-w-lg flex flex-col items-center gap-2 animate-fade-in relative">
                     <div className="w-full bg-light-bg dark:bg-dark-bg rounded-lg p-2 h-48 flex items-center justify-center border border-black/5 dark:border-white/5 relative">
                        <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                         <button 
                            onClick={handleClearSelection}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                            title="Remove Photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    <button onClick={handleClearSelection} className="text-sm text-light-text/70 dark:text-dark-text/70 hover:underline">
                        Use a different photo
                    </button>
                </div>
            ) : (
                <>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isBriefingLimitReached || isLoading} className="w-full max-w-lg bg-light-bg dark:bg-dark-bg border-2 border-dashed border-light-accent/50 dark:border-dark-accent/50 rounded-lg p-4 h-48 flex flex-col items-center justify-center hover:border-light-accent dark:hover:border-dark-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                        <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-light-accent/70 dark:text-dark-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="font-semibold text-lg">{isBriefingLimitReached ? 'Daily Limit Reached' : 'Click to Upload Media'}</span>
                        </div>
                    </button>
                </>
            )}

            {localError && <p className="text-light-accent dark:text-dark-accent text-center">{localError}</p>}
            
            {mediaPreview && !isLoading && (
                <div className="w-full max-w-lg animate-fade-in space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg text-center mb-2">Step 2: Select Correction Style</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {styleOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setCorrectionStyle(opt.id)}
                                    className={`p-3 rounded-lg text-left transition-all border-2 ${correctionStyle === opt.id ? 'bg-light-accent/10 border-light-accent dark:bg-dark-accent/10 dark:border-dark-accent' : 'bg-light-bg/50 border-transparent hover:border-light-accent/50 dark:bg-dark-bg/50 dark:hover:border-dark-accent/50'}`}
                                >
                                    <p className="font-bold">{opt.label}</p>
                                    <p className="text-xs text-light-text/70 dark:text-dark-text/70">{opt.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleCorrect} disabled={!mediaFile || isLoading || isBriefingLimitReached} className="w-full bg-gradient-to-r from-light-accent to-light-secondary dark:from-dark-accent dark:to-dark-secondary text-white font-bold text-xl py-3 rounded-lg hover:opacity-90 transition-colors shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Correcting...' : 'Restore Colors'}
                    </button>
                </div>
            )}
            
            {!mediaFile && !isLoading && (
                 <div className="w-full text-center mt-8 border-t border-black/10 dark:border-white/10 pt-8">
                    <h3 className="font-heading font-bold text-xl mb-4">See An Example</h3>
                     <div className="flex justify-center">
                        <ImageComparator 
                            before={demoColorCorrectBriefing.input.imageUrls![0]}
                            after={demoColorCorrectBriefing.output!.correctedImageUrl!}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
