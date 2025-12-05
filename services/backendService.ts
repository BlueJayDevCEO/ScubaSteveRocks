
import { Part } from "@google/genai";
import { User, Briefing } from '../types';
import { isMarineRelated, identifyMarineLife, fileToGenerativePart } from './geminiService';

/**
 * Extracts a specified number of frames from a video file as base64 strings.
 * This is a helper function moved from App.tsx to be used in the backend service.
 * @param videoFile The video file to process.
 * @param framesToExtract The number of frames to extract.
 * @returns A promise that resolves to an array of base64 encoded frame data.
 */
const extractVideoFrames = (videoFile: File, framesToExtract: number = 3): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.src = URL.createObjectURL(videoFile);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames: string[] = [];

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;
            if (duration === 0) {
                 URL.revokeObjectURL(video.src);
                 reject(new Error("Video has no duration or could not be loaded."));
                 return;
            }
            const interval = duration / (framesToExtract + 1);
            let currentTime = interval;
            let capturedFrames = 0;

            const captureFrame = () => {
                video.currentTime = currentTime;
            };

            video.onseeked = () => {
                if (!ctx) {
                    reject(new Error("Canvas context not available"));
                    return;
                }
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                frames.push(base64Data);
                capturedFrames++;
                
                if (capturedFrames >= framesToExtract) {
                    URL.revokeObjectURL(video.src);
                    resolve(frames);
                } else {
                    currentTime += interval;
                    captureFrame();
                }
            };
            
            video.onerror = (e) => {
                 URL.revokeObjectURL(video.src);
                 reject(e);
            }

            captureFrame(); // Start the process
        };
        
         video.onerror = (e) => {
             URL.revokeObjectURL(video.src);
             reject(new Error(`Video loading error: ${e}`));
        };
    });
};

export const processMarineIdBriefing = async (
    user: User, 
    initialBriefing: Briefing, 
    mediaFiles: File[] | null,
    prompt: string
): Promise<Briefing> => {

    const hasMedia = mediaFiles && mediaFiles.length > 0;
    let mediaParts: Part[] | null = null;

    if (hasMedia) {
        const videoFile = mediaFiles.find(f => f.type.startsWith('video/'));
        if (videoFile) {
            const frames = await extractVideoFrames(videoFile);
            mediaParts = frames.map(frameData => ({
                inlineData: { mimeType: 'image/jpeg', data: frameData }
            }));
        } else {
            mediaParts = await Promise.all(mediaFiles.map(file => fileToGenerativePart(file)));
        }
    }

    // Step 1: Security check - is the content marine-related? (Optional, can be skipped for performance)
    // const isRelevant = await isMarineRelated(prompt, mediaParts);

    // Step 2: Always perform the full identification for the user
    const fullPrompt = prompt.trim() || 'Identify the species in the image/video.';
    const suggestion = await identifyMarineLife(fullPrompt, mediaParts);
    
    // The contribution logic is now handled by the frontend based on user interaction.
    // contributionLogged is explicitly set to false so the UI can prompt the user.
    const updatedBriefing: Briefing = { 
        ...initialBriefing, 
        status: 'completed', 
        output: { suggestion },
        contributionLogged: false
    };
    
    return updatedBriefing;
};