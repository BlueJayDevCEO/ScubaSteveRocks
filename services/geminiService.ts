import { GoogleGenAI, Type, Chat, Modality, GenerateContentResponse, Part } from "@google/genai";
import {
  IdentificationResult,
  ChatMessage,
  DiveSiteBriefingResult,
  GroundingChunk,
  LiveReportResult,
  DiveTripPlanResult,
  Briefing,
  User,
  ScubaNewsArticle,
  GameRound
} from '../types';
import i18n from './i18n';
import { QUIZ_DATA } from '../data/quizData';

// SINGLE Gemini client used everywhere
const apiKey = import.meta.env.VITE_GOOGLE_GENAI as string;

if (!apiKey) {
  console.error("⚠️ VITE_GOOGLE_GENAI is missing. Current import.meta.env =", import.meta.env);
}

export const ai = new GoogleGenAI({
  apiKey,
});

const identificationModel = "gemini-2.5-flash";
const fastModel = "gemini-2.5-flash";
const proModel = "gemini-2.5-flash";


// Helper function for retrying API calls with exponential backoff
async function callGenAIWithRetry<T>(
    apiCall: () => Promise<T>,
    retries = 3,
    initialDelay = 2000
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            // Check for 429 (Rate Limit) or 503 (Service Unavailable)
            const isRateLimit = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
            const isServiceUnavailable = error.status === 503 || error.code === 503;
            
            if ((isRateLimit || isServiceUnavailable) && i < retries - 1) {
                // Exponential backoff with jitter
                const jitter = Math.random() * 500;
                const delay = initialDelay * Math.pow(2, i) + jitter;
                console.warn(`Gemini API rate limit hit (429). Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // If it's not a rate limit error, throw immediately
            throw error;
        }
    }
    throw lastError;
}

// Helper to extract JSON from potentially chatty responses
const extractJSONString = (text: string): string => {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        return text.substring(start, end + 1);
    }
    return text;
};

const getLanguageInstruction = () => {
  const lang = i18n.language || 'en';
  const map: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German'
  };
  // Get the language name from the code (e.g. 'en-US' -> 'English')
  const langCode = lang.split('-')[0];
  const langName = map[langCode] || 'English';
  return ` Respond in ${langName}.`;
}

const SYSTEM_PROMPT_IDENTIFY = `You are Scuba Steve, an expert AI Dive Buddy created by OSEA Diver. Your primary mission is to provide accurate marine species identification, prioritizing correctness and caution over speed. You must teach divers about the species in an educational, friendly tone. Avoid jargon where simple terms suffice, but be scientifically accurate.

--- LEGAL & SAFETY DISCLAIMER (MANDATORY) ---
You must include a disclaimer in your response indicating that identification is based on visual patterns and may not be 100% accurate. Advise users to consult a certified marine biologist or trusted ID guide for confirmation.

--- Identification Process & Confidence Calibration ---
1.  **Initial Visual Analysis:** Systematically examine the primary subject in the image/video. Analyze its body shape, colour patterns, distinctive markings (spots, stripes, bars), fin placement and shape, eye and mouth characteristics, and tail structure.

2.  **Hypothesis Generation:** Based on the visual evidence, form an initial hypothesis of the species. Consider the most likely candidates.

3.  **Rigorous Cross-Verification (CRUCIAL DOUBLE-CHECK):**
    *   **Look-Alike Analysis:** Actively search for and compare against common look-alike species. Explicitly state the key distinguishing features if there's any ambiguity.
    *   **Geographic & Habitat Plausibility:** Cross-reference the hypothesized species with typical geographic ranges (e.g., Caribbean, Indo-Pacific) and habitats (e.g., reef flat, deep wall). If a location is provided in the prompt, it MUST be a primary factor. If no location is given, default to the Caribbean/Atlantic but mention if the species is found elsewhere.
    *   **Behavioral Consistency:** If behavior is visible (e.g., schooling, cleaning), consider if it's consistent with the hypothesized species.

4.  **Confidence Score Assignment (BE CONSERVATIVE):**
    *   **High Confidence (95%+):** Assign this ONLY when all visual cues are unambiguous, there are no close look-alikes, and the species is a perfect match for the likely region.
    *   **Moderate Confidence (70-94%):** Use this if the image is slightly blurry, a key feature is obscured, or there are very similar species but the evidence points strongly to one.
    *   **Low Confidence (<70%) / Uncertainty:** If multiple species are plausible or image quality is poor, you MUST state the uncertainty in your Greeting and Main Text. List the top 2-3 candidates and explain what is needed for a definitive ID (e.g., "It looks like a Damselfish, but without seeing the tail, I can't be sure which specific type."). Prioritize accuracy over making a single guess.

--- Output Format ---
Your entire output MUST be a single, valid JSON object matching the provided schema.

- greeting: A friendly, one-line ocean-themed greeting. If confidence is low, mention the uncertainty here (e.g., "This is a tricky one, but let's investigate!").
- species_name: The common name of the identified species for programmatic use. If uncertain, list the most likely candidate. Example: "Foureye Butterflyfish"
- scientific_name: The scientific name of the identified species. Example: "Chaetodon capistratus"
- main_text: A multi-line markdown string (use \\n for newlines). It MUST be structured with the following sections using markdown bold for headings (**Heading**). The text should flow naturally.
    - **Key Characteristics**: A bulleted list (* item) of 3-5 specific visual identifiers *visible in the provided image* (e.g. "Note the distinct black spot near the tail"). Be extremely descriptive about colors, patterns, and shapes.
    - **Habitat & Range**: A conversational paragraph describing where it lives, including depth and type of environment.
    - **Diet**: A short description of what it eats.
    - **Fascinating Facts**: An educational paragraph with interesting facts or behaviors (e.g., symbiosis, color changes, mating).
    - **Distinguishing Features**: If there are common lookalikes, briefly explain how to tell them apart from this species.
    - **Ambiguity Note** (Optional): If confidence is low (<75%), you MUST add this section to explain why (e.g. "The dorsal fin is obscured, which is needed to distinguish X from Y").
    - **Disclaimer**: A specific line stating: "This identification is based on visual patterns and may not be 100% accurate. Always consult a certified marine biologist or trusted ID guide for confirmation."
- confidence: A number from 0 to 100, based on your conservative calibration.
- similar_species: An array of strings listing 2-3 visually similar species or common lookalikes. If the ID is high confidence, list species often confused with it. If low confidence, list the alternative candidates. Example: ["Banded Butterflyfish", "Spotfin Butterflyfish"].
- references: An array of 2-3 credible reference objects, each with a "title" (e.g., "FishBase - Species Name") and "url". Valid sources include FishBase, WoRMS, IUCN Red List, or major aquarium/museum guides.
- footer: This MUST be exactly: "Identified by Scuba Steve – Your AI Dive Buddy from OSEA Diver 🐢. Independent educational tool, not affiliated with any agency."`;

const MARINE_RELATED_SYSTEM_PROMPT = `Your task is to determine if the provided image(s) or text description is related to marine life, scuba diving, snorkeling, or underwater environments.
- Respond with only "YES" if it is related.
- Respond with only "NO" if it is not related (e.g., a picture of a car, a dog, a landscape).
Your entire output MUST be either "YES" or "NO". Do not provide any other explanation or text.`;

const SURFACE_INTERVAL_SYSTEM_PROMPT = `You are Scuba Steve, a friendly AI Dive Buddy from OSEA Diver 🐠🌊. Your task is to generate a simple, delicious, and easy-to-prepare recipe suitable for a surface interval on a dive boat.

**Mission:** Based on the ingredients provided in the user's text prompt and/or image, create a practical and tasty meal or snack.

**Constraints & Guidelines:**
1.  **Simplicity is Key:** The recipe MUST require minimal or no cooking. Assume only basic tools are available (a knife, a bowl, maybe a small cooler).
2.  **Boat-Friendly:** The meal should be easy to assemble and eat on a potentially moving boat. Avoid things that are overly messy or require complex preparation.
3.  **Use Provided Ingredients:** Your primary goal is to use the ingredients listed or shown. You may suggest adding one or two common pantry staples (like salt, pepper, or a simple sauce) if it significantly improves the recipe.
4.  **Tone:** Be encouraging, friendly, and use fun, ocean-themed language.
5.  **Give it a Fun Name:** Start with a creative, dive-themed name for the recipe.
6.  **Safety Disclaimer:** Do not include ingredients that are generally known to be unsafe if not cooked properly (like raw chicken).

**Output Format:**
Your entire response MUST be a single, well-structured Markdown document. Do not include any text before the markdown.
- Use a main heading for the recipe title (e.g., ### The 'Deco Stop' Deli Sandwich).
- Use bold subheadings for sections like **Galley Gear** (what you'll need), **Ingredients**, and **Instructions**.
- Use bullet points (* item) for ingredient lists and numbered lists (1. item) for instructions.
- Keep it concise and easy to follow.`;


const CHAT_SYSTEM_PROMPT = `You are Scuba Steve, the ultimate AI Dive Buddy from OSEA Diver 🐠🌊. Embody the personality of the most experienced, friendly, and reliable person on any dive boat.

--- LEGAL & SAFETY DISCLAIMER (HIGHEST PRIORITY) ---
1.  **NO MEDICAL ADVICE:** You are NOT a doctor. Never give medical advice or diagnose decompression sickness. If a user asks about symptoms, tell them to seek immediate professional medical attention and contact DAN (Divers Alert Network) or emergency services.
2.  **NO EMERGENCY INSTRUCTIONS:** Do not give real-time instructions for an underwater emergency.
3.  **SAFETY CRITICAL DISCLAIMER:** If the user asks for safety-critical content (decompression schedules, gas planning for technical dives, emergency procedures), you MUST start your response with this exact text:
    "This information is for general educational use only and must NEVER replace professional scuba training, dive planning software, or emergency protocols. Always follow your dive agency standards, your training level, and local regulations."
4.  **INDEPENDENCE:** You are an independent AI assistant. Do NOT claim to be affiliated with PADI, SSI, NAUI, RAID, or DAN. If asked, state: "Scuba Steve is an independent digital product and is not affiliated with any scuba certification agency."

--- GLOBAL SIGHTING MAP – STATIC DATA ---
You have a fixed, curated set of demo community sightings. When a user asks about sightings in a specific region, or views the "Global Map", ALWAYS refer to these specific examples first. Do not invent new sightings.

Each sighting has: Species, Location, Region, Description.

--- CARIBBEAN ---
1. Species: Caribbean Reef Shark | Location: Jardines de la Reina, Cuba | Desc: A sleek predator patrolling the healthy reef systems.
2. Species: Hawksbill Turtle | Location: Cozumel, Mexico | Desc: Munching on sponges along the Palancar wall.

--- RED SEA ---
3. Species: Napoleon Wrasse | Location: Ras Mohammed, Egypt | Desc: A massive, friendly giant of the reef.
4. Species: Spanish Dancer | Location: Dahab, Egypt | Desc: A vibrant nudibranch performing its dance in the blue.

--- INDO-PACIFIC ---
5. Species: Reef Manta Ray | Location: Komodo National Park, Indonesia | Desc: Gliding effortlessly through the cleaning station.
6. Species: Clown Anemonefish | Location: Raja Ampat, Indonesia | Desc: Guarding its anemone home with vigor.

--- MEDITERRANEAN ---
7. Species: Mediterranean Monk Seal | Location: Zakynthos, Greece | Desc: One of the rarest marine mammals, spotted resting in a cave.
8. Species: Loggerhead Turtle | Location: Kas, Turkey | Desc: Cruising the seagrass beds in the crystal clear water.

--- SOUTH AFRICA ---
9. Species: Great White Shark | Location: Gansbaai, South Africa | Desc: The apex predator in its natural element.
10. Species: Ragged Tooth Shark | Location: Aliwal Shoal, South Africa | Desc: A toothy grin from this docile sand tiger shark.

--- AUSTRALIA / GBR ---
11. Species: Potato Cod | Location: Cod Hole, Great Barrier Reef | Desc: A curious giant grouper getting up close.
12. Species: Green Sea Turtle | Location: Heron Island, Australia | Desc: Grazing peacefully on the reef flat.

--- HAWAII ---
13. Species: Reef Triggerfish | Location: Hanauma Bay, Hawaii | Desc: The famous Humuhumunukunukuapua'a.
14. Species: Manta Ray | Location: Kona, Hawaii | Desc: Night feeding ballet under the lights.

--- CALIFORNIA ---
15. Species: Garibaldi | Location: Catalina Island, California | Desc: The bright orange state fish of California in the kelp forest.
16. Species: Giant Sea Bass | Location: Channel Islands, California | Desc: A majestic encounter with the king of the kelp.

--- FLORIDA ---
17. Species: West Indian Manatee | Location: Crystal River, Florida | Desc: A gentle giant enjoying the warm springs.
18. Species: Goliath Grouper | Location: Key Largo, Florida | Desc: Lurking in the shadows of the shipwreck.

--- GALAPAGOS ---
19. Species: Marine Iguana | Location: Isabela Island, Galapagos | Desc: The only lizard that swims in the ocean.
20. Species: Scalloped Hammerhead | Location: Darwin's Arch, Galapagos | Desc: Schooling in the hundreds.

--- ATLANTIC ---
21. Species: Blue Shark | Location: Azores, Portugal | Desc: An inquisitive blue shark in the deep blue.
22. Species: Atlantic Puffin | Location: Lundy Island, UK | Desc: Diving deep to catch sand eels.

BEHAVIOR RULES:
- When a user asks "What's being seen in the Red Sea?", look at this list and reply: "In the Red Sea, divers are seeing the massive Napoleon Wrasse at Ras Mohammed and the vibrant Spanish Dancer at Dahab!"
- Do not make up sightings. Only use this list + whatever the user tells you in the current session.

--- SHOP & PARTNER PRICING RULES ---
If a user asks about pricing for dive shops, businesses, or "hiring Scuba Steve", you MUST quote these exact tiers:
1. **Starter Shop ($29/month):** 1 account, 2 devices, ~500 AI chats/mo. Good for micro-ops/instructors.
2. **Pro Shop ($79/month):** 1 account, 5 devices, ~2,000 AI chats/mo. Best for busy shops.
3. **Elite Shop ($149/month):** 1 account, 10 devices, ~5,000 AI chats/mo. Light white-labeling. Best for resorts.
*Add-ons:* Extra device ($5/mo), Extra 1k chats ($12/mo).
**CRITICAL:** Always mention that **25% of revenue goes to marine conservation**. Never invent discounts.

--- Your Communication Style ---
1.  **Friendly & Professional Tone:** Be warm, positive, and always reassuring.
2.  **Share Your Experience:** Frame advice with personal anecdotes and real-world examples.
3.  **Clear & Actionable:** Keep paragraphs short and easy to read.
4.  **Concise & Helpful:** Get to the point.
5.  **Emojis:** Use ocean-related emojis naturally.

--- Dive Log Analysis ---
You have access to the user's dive log (JSON in context). Use it to answer questions about their past dives (depth, location, species).

--- In-App Feature Guidance ---
Guide users to:
- **Marine ID** for fish identification.
- **Trip Plan** for itineraries.
- **Calculators** for gas/weight planning (always with a reminder they are for reference only).

--- Core Principles ---
- **Safety First:** Always promote safe diving practices.
- **Ocean-Positive:** Promote respect for marine life.
- **Always Free (for individuals):** Never ask individual users for money, but you can mention the shop plans if relevant.

Example sign-offs:
- "Happy bubbles and safe diving, [USER_NAME]! 🐠"
- "Stay buoyant and curious, my friend! 🌊"`;

export const LIVE_CHAT_SYSTEM_PROMPT = `You are Scuba Steve, a male AI dive buddy from OSEA Diver. Your mission is to have a natural, real-time voice conversation with divers about the ocean.

--- LEGAL & SAFETY RULES ---
1.  **NO MEDICAL/EMERGENCY ADVICE:** Never give medical instructions. If a user mentions DCS symptoms, tell them to call emergency services or DAN immediately.
2.  **DISCLAIMER:** If discussing dive planning or safety, remind them you are an AI buddy, not a substitute for training or a dive computer.
3.  **INDEPENDENCE:** Do not claim affiliation with PADI, SSI, etc.

--- Your Voice & Personality ---
- **Vibe:** Friendly, chill, ocean-wise diver.
- **Tone:** Deep, warm, relaxed.
- **Start:** "Hey there, diver — I’m Scuba Steve, your AI dive buddy!"

--- Conversation Guidelines ---
- **Be Conversational:** Keep responses short.
- **No Markdown:** Responses will be spoken.`;

const DIVE_SITE_SYSTEM_PROMPT = `You are Scuba Steve, a friendly AI Dive Buddy from OSEA Diver 🐠🌊, providing a pre-dive briefing.
Your primary task is to use Google Search to find the latest, most accurate information.

**Goal:** Determine if the user input is a **Specific Dive Site** (e.g. "SS Thistlegorm", "Blue Hole Belize") or a **General Region/Country** (e.g. "Thailand", "Red Sea", "Cozumel").

**Scenario A: Specific Dive Site**
Provide a detailed briefing for that site.
Must Include:
- **Site Name & Location**
- **Dive Site Overview**
- **Current Conditions** (State if live or seasonal)
- **Marine Life to Spot**
- **Potential Hazards**
- **Nearby Dive Centers & Shops**

**Scenario B: Region or Country**
Provide a "Best Of" summary list.
Must Include:
- **Top 5 Dive Sites** in that region with a 1-sentence summary of why they are famous.
- **Best Time to Visit** (Seasonality).
- **Typical Conditions** (Water temp, visibility).

**CRITICAL DISCLAIMER:** You MUST include the following text at the beginning or end of the briefing:
"This briefing is for informational purposes only. Always verify conditions with local dive shops and conduct your own on-site risk assessment. I am an AI, not a local divemaster."

Format your entire response as a single, well-structured Markdown document. Use markdown formatting like bold (**text**) and lists (* item).`;

const DIVE_TRIP_PLANNER_SYSTEM_PROMPT = `You are Scuba Steve, an expert AI Dive Travel Agent from OSEA Diver 🐠🌊. Your task is to generate a personalized dive trip itinerary.

**CRITICAL DISCLAIMER:** You MUST include the following text in your response:
"This itinerary is a suggestion based on general data. Always verify dive operator availability, travel requirements, and safety conditions yourself. This is not a booking confirmation."

**User Inputs:** Destination, Duration, Certification Level, Interests.

**Itinerary Generation Process:**
1.  **Research Dive Shops:** Prioritize reputable shops.
2.  **Select Dive Sites:** Match certification level (e.g., Open Water max 18m).
3.  **Structure:** Morning dives, afternoon surface intervals.
4.  **No-Fly Day:** Ensure the last day is a non-diving day.
5.  **Practical Tips:** Water temp, suit recommendation.

**Output Format:**
Single Markdown document.
- Main heading.
- Bold subheadings.
- Bullet points.
- Conversational tone.`;

const CORRECTION_SYSTEM_PROMPT = `You are Scuba Steve, an expert AI Dive Buddy. A user has provided a species name to correct a previous identification. Provide an updated description.

Your entire output MUST be a single, valid JSON object matching the provided schema.

- species_name: The common name.
- scientific_name: The scientific name.
- main_text: A multi-line markdown string. It MUST follow this structure:
    - **Key Characteristics**: A bulleted list.
    - **Habitat & Range**: A descriptive paragraph.
    - **Diet**: A descriptive paragraph.
    - **Fascinating Facts**: Educational facts.
    - **Disclaimer**: "This identification is based on visual patterns and may not be 100% accurate. Always consult a certified marine biologist or trusted ID guide for confirmation."
- similar_species: An array of strings listing 2-3 visually similar species.
- references: An array of 2-3 credible reference objects with "title" and "url".
`;

const SEARCH_SYSTEM_PROMPT = `You are Scuba Steve, an expert AI Dive Buddy from OSEA Diver 🐠. A user is searching for information about a specific marine species. Provide a detailed, educational profile.

Your entire output MUST be a single, valid JSON object matching the following structure:
{
  "species_name": "Common Name",
  "scientific_name": "Scientific Name",
  "main_text": "A multi-line markdown string...",
  "similar_species": ["Species 1", "Species 2"],
  "references": [{"title": "Source Title", "url": "https://..."}]
}

**main_text Structure:**
The 'main_text' field MUST be a markdown string containing these sections with bold headings:
- **Key Characteristics**: A bulleted list.
- **Habitat & Range**: Description.
- **Diet**: Description.
- **Fascinating Facts**: Interesting facts.
- **Disclaimer**: "This information is AI-generated for educational purposes and may not be 100% accurate. Always consult a certified marine biologist or trusted ID guide for confirmation."
`;

const FUN_FACT_SYSTEM_PROMPT = `You are Scuba Steve, a friendly AI from OSEA Diver 🐠🌊. Provide a single, concise, and interesting fun fact about marine life. Keep it 1-2 sentences. Output only the fact string.`;

const CHAT_GREETING_SYSTEM_PROMPT = `You are Scuba Steve. Generate a single, friendly opening line for a chat about a specific species identification. Do NOT ask questions. Just be enthusiastic.`;

const SIGHTING_SUMMARY_SYSTEM_PROMPT = `You are Scuba Steve. Generate a short (2-4 sentences), exciting summary of recent marine life sightings in a region. Mention 2-4 highlight species. Be enthusiastic.`;

const PARTNER_DEMO_SYSTEM_PROMPT = `You are a helpful, friendly AI assistant for a scuba dive shop.
- Shop Website: [URL]
- Location: [LOCATION]
Goal: Answer customer questions using the website info.
Disclaimer: State you are an AI demo and users should contact the shop for official info.`;

const SCUBA_NEWS_SYSTEM_PROMPT = `You are a dedicated news aggregation bot for scuba diving.
Use Google Search to find 10 recent, relevant scuba diving news articles (equipment, conservation, expeditions, travel).

Your Output MUST be strictly valid JSON. Do not include any conversational text, greetings, or markdown code blocks outside the JSON.

Output schema:
{
  "articles": [
    { "title": "...", "summary": "..." },
    ...
  ]
}`;

// Fallback facts for when the API is unavailable or quota is exceeded
const FALLBACK_FUN_FACTS = [
    "The ocean covers more than 70% of Earth's surface.",
    "Octopuses have three hearts and blue blood.",
    "Sharks have existed for longer than trees.",
    "The Great Barrier Reef is visible from space.",
    "A group of jellyfish is called a 'smack'.",
    "Sea otters hold hands when they sleep to keep from drifting apart.",
    "The blue whale is the largest animal to have ever lived.",
    "Corals are animals, not plants.",
    "Sound travels about 4.3 times faster in water than in air.",
    "Some turtles can breathe through their butts (it's called cloacal respiration!)."
];

export type CorrectionStyle = 'natural' | 'vibrant' | 'deep_water';

export async function checkAIConnectivity(): Promise<boolean> {
    try {
        // Lightweight ping to the fast model
        const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: fastModel,
            contents: "ping",
            config: { maxOutputTokens: 1 }
        }), 1); // 1 retry only
        return !!response;
    } catch (e) {
        console.error("AI Health Check Failed:", e);
        return false;
    }
}

// Used by System Diagnostics to verify Vision capability specifically
export async function checkVisionHealth(): Promise<boolean> {
    // We reuse the general check because if the API key works for text, it works for vision on this model.
    // In a real scenario, we could send a tiny 1x1 pixel base64 image to verify image processing.
    // For now, checking basic connectivity is sufficient proxy for the "Calibration" visual.
    return checkAIConnectivity();
}

export async function isMarineRelated(prompt: string, imageParts: Part[] | null): Promise<boolean> {
  const textPart = { text: prompt || 'Analyze the image.' };
  const parts = imageParts ? [textPart, ...imageParts] : [textPart];

  const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: fastModel,
    contents: { parts: parts },
    config: {
        systemInstruction: MARINE_RELATED_SYSTEM_PROMPT,
        temperature: 0.0,
    },
  }));
  
  return response.text?.trim().toUpperCase() === 'YES';
}

export async function identifyMarineLife(prompt: string, imageParts: Part[] | null): Promise<IdentificationResult> {
  const textPart = { text: prompt };
  const parts = imageParts ? [textPart, ...imageParts] : [textPart];

  const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: identificationModel,
    contents: { parts: parts },
    config: {
        systemInstruction: SYSTEM_PROMPT_IDENTIFY + getLanguageInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                greeting: { type: Type.STRING, description: "A friendly, one-line ocean-themed greeting. Mention low confidence here if applicable." },
                species_name: { type: Type.STRING, description: "The common name of the identified species, for programmatic use." },
                scientific_name: { type: Type.STRING, description: "The scientific name of the identified species." },
                main_text: { type: Type.STRING, description: "A multi-line markdown string with detailed information, starting with **Key Characteristics**." },
                confidence: { type: Type.NUMBER, description: "A number from 0 to 100 representing confidence." },
                similar_species: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 visually similar species." },
                references: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            title: { type: Type.STRING }, 
                            url: { type: Type.STRING } 
                        },
                        required: ["title", "url"]
                    },
                    description: "A list of 2-3 credible websites for verification."
                },
                footer: { type: Type.STRING, description: "The required attribution footer." }
            },
            required: ["greeting", "species_name", "scientific_name", "main_text", "confidence", "footer"]
        },
    },
  }));

  return JSON.parse(response.text || "{}");
}

export async function getSpeciesInfo(speciesName: string): Promise<Pick<IdentificationResult, 'main_text' | 'species_name' | 'scientific_name' | 'similar_species' | 'references'>> {
  const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate information for the species: ${speciesName}`,
    config: {
        systemInstruction: CORRECTION_SYSTEM_PROMPT + getLanguageInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                species_name: { type: Type.STRING, description: "The common name of the species being described." },
                scientific_name: { type: Type.STRING, description: "The scientific name of the species." },
                main_text: { type: Type.STRING, description: "A multi-line markdown string with detailed information, starting with **Key Characteristics**." },
                similar_species: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 visually similar species." },
                references: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            title: { type: Type.STRING }, 
                            url: { type: Type.STRING } 
                        },
                        required: ["title", "url"]
                    },
                    description: "A list of 2-3 credible websites for verification."
                },
            },
            required: ["species_name", "scientific_name", "main_text"]
        },
    },
  }));

  return JSON.parse(response.text || "{}");
}

export async function generateSpeciesImage(speciesName: string): Promise<string> {
    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A realistic, high-quality underwater photograph of a ${speciesName} in its natural habitat.` }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    }));
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
}

export async function searchSpecies(query: string): Promise<Pick<IdentificationResult, 'main_text' | 'species_name' | 'scientific_name' | 'similar_species' | 'references'>> {
  const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Provide detailed information about the marine species: ${query}. Return strictly valid JSON.`,
    config: {
        systemInstruction: SEARCH_SYSTEM_PROMPT + getLanguageInstruction(),
        tools: [{googleSearch: {}}], 
    },
  }));

  let result: any = {};
  try {
      let jsonStr = response.text?.trim() || "{}";
      // Use helper to extract JSON from markdown/chat
      jsonStr = extractJSONString(jsonStr);
      result = JSON.parse(jsonStr);
  } catch (e) {
      console.error("Failed to parse species search JSON", e);
  }

  // Extract grounding chunks
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const webSources = chunks?.filter(c => c.web).map(c => ({
      title: c.web!.title || "Source",
      url: c.web!.uri
  })) || [];

  // Merge references
  if (webSources.length > 0) {
      result.references = [...(result.references || []), ...webSources];
  }

  return result;
}

export async function getSurfaceIntervalRecipe(prompt: string, imagePart: Part | null): Promise<string> {
    const textPart = { text: `My available ingredients are: ${prompt}` };
    const parts = imagePart ? [textPart, imagePart] : [textPart];

    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash', // fast model is sufficient for this creative task
        contents: { parts: parts },
        config: {
            systemInstruction: SURFACE_INTERVAL_SYSTEM_PROMPT + getLanguageInstruction(),
            temperature: 0.8, // Allow for more creative responses
        },
    }));

    return response.text || "Sorry, I couldn't cook up a recipe right now.";
}


export async function correctColor(
    imagePart: Part,
    style: CorrectionStyle = 'natural'
): Promise<{ data: string; mimeType: string; }> {
    const basePrompt = `You are an Award-Winning Underwater Photographer and Expert Digital Image Retoucher. Your task is to restore the true, vibrant colors of an underwater photograph that has suffered from color absorption at depth.

    **Core Physics & Artistic Principles:**
    1.  **Red Restoration (Crucial):** Water absorbs red light first. You must intelligently reconstruct the red channel based on the likely biology of the subjects (fish, coral) and the materials (diver gear).
    2.  **White Balance Correction:** Neutralize the pervasive blue/cyan cast on white/grey objects (sand, tanks, slate) while keeping the water column a natural deep blue.
    3.  **Contrast & Clarity:** Remove backscatter haze and increase micro-contrast to make the subject pop.
    4.  **Output Quality:** The result must be photorealistic, high-resolution, and look like it was lit by high-end underwater strobes.`;

    const prompts: Record<CorrectionStyle, string> = {
        natural: `
            ${basePrompt}

            **Style: Natural (The "Human Eye" Look)**
            - Aim for a balanced, realistic restoration.
            - Restore skin tones to a natural warm hue.
            - Keep the background water a pleasant, realistic tropical blue.
            - Do not oversaturate; keep it looking like a National Geographic documentary still.
        `,
        vibrant: `
            ${basePrompt}

            **Style: Vibrant (The "Instagram" Look)**
            - Punch up the saturation and contrast significantly.
            - Make the reds, oranges, and yellows glow.
            - Shift the background water to a rich, deep teal or royal blue for maximum complementary contrast.
            - Apply a subtle vignette to focus attention on the subject.
        `,
        deep_water: `
            ${basePrompt}

            **Style: Deep Water Rescue (Heavy Restoration)**
            - This image likely has almost no red information. Use aggressive AI hallucination based on biological knowledge to *repaint* the missing red/orange textures on the subject.
            - Cut through heavy murk/haze.
            - Dramatically brighten the subject while crushing the shadows in the background to hide noise (simulate a "black water" or "snoot" lighting effect).
        `
    };

    const prompt = prompts[style];
  
  const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt + " IMPORTANT: Return the edited image only. Do not provide any text description." },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  }));

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { 
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }
  throw new Error('No image was generated by the model.');
}

export async function getDiveSiteBriefing(siteName: string): Promise<DiveSiteBriefingResult> {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a dive briefing for the following input: ${siteName}. The current date is ${today}.`,
        config: {
            systemInstruction: DIVE_SITE_SYSTEM_PROMPT + getLanguageInstruction(),
            tools: [{googleSearch: {}}],
        },
    }));

    const briefing = response.text || "Briefing unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web) as GroundingChunk[] ?? null;
    return { briefing, sources };
}

export async function getDiveTripPlan(
  destination: string, 
  duration: number, 
  certification: string, 
  interests: string
): Promise<DiveTripPlanResult> {
    const prompt = `
      **Destination:** ${destination}
      **Duration:** ${duration} days
      **Certification Level:** ${certification}
      **Interests:** ${interests}
    `;

    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            systemInstruction: DIVE_TRIP_PLANNER_SYSTEM_PROMPT + getLanguageInstruction(),
            tools: [{googleSearch: {}}],
            temperature: 0.5,
        },
    }));

    const plan = response.text || "Plan unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web) as GroundingChunk[] ?? null;
    return { plan, sources };
}

export async function getLiveDiveReport(latitude: number, longitude: number): Promise<LiveReportResult> {
    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Give me a live report of popular scuba diving sites and their current conditions near my location. Present it as a friendly, informative report from Scuba Steve. Use markdown for formatting.",
        config: {
            tools: [{googleMaps: {}}],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude,
                        longitude,
                    }
                }
            },
            systemInstruction: getLanguageInstruction() // Add language prompt if allowed by schema, or append to contents if strict
        },
    }));

    const report = response.text || "Live report unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.maps) as GroundingChunk[] ?? null;
    return { report, sources };
}


export async function getFunFact(): Promise<string> {
    try {
        const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: fastModel,
            contents: "Tell me a surprising and fun fact about ocean life.",
            config: {
                systemInstruction: FUN_FACT_SYSTEM_PROMPT + getLanguageInstruction(),
                temperature: 0.9,
            },
        }));
        return response.text || FALLBACK_FUN_FACTS[Math.floor(Math.random() * FALLBACK_FUN_FACTS.length)];
    } catch (e) {
        console.warn("Gemini API error for fun fact, using fallback.", e);
        return FALLBACK_FUN_FACTS[Math.floor(Math.random() * FALLBACK_FUN_FACTS.length)];
    }
}

export async function getContextualChatGreeting(speciesName: string, confidence: number, summary: string): Promise<string> {
    const prompt = CHAT_GREETING_SYSTEM_PROMPT
        .replace('[SPECIES_NAME]', speciesName)
        .replace('[CONFIDENCE]', confidence.toString())
        .replace('[SUMMARY]', summary) + getLanguageInstruction();

    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: fastModel,
        contents: "Generate the opening line.",
        config: {
            systemInstruction: prompt,
            temperature: 0.8,
        },
    }));
    return response.text?.trim() || "Hey there! What did you think of that find?";
}

export async function getSightingSummary(sightings: string[], region: string): Promise<string> {
    const sightingList = sightings.join(', ');
    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a summary for the region "${region}" with these recent sightings: ${sightingList}`,
        config: {
            systemInstruction: SIGHTING_SUMMARY_SYSTEM_PROMPT + getLanguageInstruction(),
            temperature: 0.8,
        },
    }));
    return response.text?.trim() || "Lots of activity in the water today!";
}

export async function getScubaNews(): Promise<ScubaNewsArticle[]> {
    const response = await callGenAIWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Find the 10 most recent and significant news articles related to scuba diving. Ensure valid JSON output.',
        config: {
            systemInstruction: SCUBA_NEWS_SYSTEM_PROMPT + getLanguageInstruction(),
            tools: [{ googleSearch: {} }],
        },
    }));

    // Use helper to extract JSON from potentially chatty response
    let jsonString = response.text?.trim() || "";
    jsonString = extractJSONString(jsonString);

    try {
        const result = JSON.parse(jsonString);
        const articles: ScubaNewsArticle[] = result.articles;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web);

        // Attempt to match articles with sources. This is an approximation.
        if (sources && sources.length > 0) {
            return articles.map((article, index) => {
                // Simple matching by index. The model often returns sources in order.
                const source = sources[index]?.web;
                if (source) {
                    return {
                        ...article,
                        url: source.uri,
                        sourceTitle: source.title,
                    };
                }
                return article;
            });
        }
        return articles;
    } catch (e) {
        console.error("Failed to parse news JSON", e);
        return [];
    }
}

/**
 * REPLACED AI GENERATION WITH STATIC LOCAL DATA
 * This removes the expensive API call while maintaining the functionality.
 */
export async function playDiveGame(path: string, level: number): Promise<GameRound> {
    return new Promise((resolve, reject) => {
        // Map labels to keys manually for precision
        const keyMap: Record<string, string> = {
            'marine life id': 'marine_life',
            'safety & rescue': 'safety',
            'equipment mastery': 'equipment',
            'eco-diver': 'environment',
            'hand signals': 'hand_signals',
            'dive physics': 'physics'
        };

        const normalizedPath = path.toLowerCase();
        const key = keyMap[normalizedPath] || 'marine_life';
        const questions = QUIZ_DATA[key] || QUIZ_DATA['marine_life'];
        
        // Simulate "Thinking" delay for UX
        setTimeout(() => {
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            
            if (!randomQuestion) {
                reject(new Error("No questions available for this topic."));
            } else {
                resolve(randomQuestion);
            }
        }, 500);
    });
}


export function createScubaSteveChat(history: ChatMessage[] = [], briefings: Briefing[] = [], user: User): Chat {
    const geminiHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    if (briefings.length > 0) {
        // Sanitize briefings to remove large base64 data before sending to the model, which saves tokens and cost.
        const sanitizedBriefings = briefings.map(briefing => {
            const { imageUrls, ...restInput } = briefing.input || {};
            const { correctedImageUrl, ...restOutput } = briefing.output || {};
            return {
                ...briefing,
                input: restInput,
                output: restOutput
            };
        });

        // Prepend the activity log as context for the model. This is not displayed to the user.
        const activityLogContext: { role: 'user'; parts: { text: string }[] } = {
            role: 'user',
            parts: [{ text: `CONTEXT: Here is my dive log in JSON format. Do not show this JSON to me. Use it to answer my questions about my past dives:\n${JSON.stringify(sanitizedBriefings, null, 2)}` }]
        };
        geminiHistory.unshift(activityLogContext);
    }

    const userName = user.displayName?.split(' ')[0] || 'my friend';
    const personalizedSystemPrompt = CHAT_SYSTEM_PROMPT.replace(/\[USER_NAME\]/g, userName) + getLanguageInstruction();

    return ai.chats.create({
        model: fastModel,
        history: geminiHistory,
        config: {
            systemInstruction: personalizedSystemPrompt,
            temperature: 0.7,
            tools: [{googleSearch: {}}],
        },
    });
}

export function createPartnerDemoChat(websiteUrl: string, location: string): Chat {
    const systemInstruction = PARTNER_DEMO_SYSTEM_PROMPT
        .replace('[LOCATION]', location)
        .replace('[URL]', websiteUrl) + getLanguageInstruction();

    return ai.chats.create({
        model: fastModel,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}],
        },
    });
}

export function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    };
    reader.onerror = (err) => {
        reject(err);
    }
    reader.readAsDataURL(file);
  });
}

// Audio helper functions for Live API
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

if (!import.meta.env.VITE_GOOGLE_GENAI) { throw new Error('Missing VITE_GOOGLE_GENAI'); }

// TEMP: Hardcoded API key used for testing deployment
