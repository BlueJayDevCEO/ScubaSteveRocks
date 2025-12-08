
// --- Unit Conversion ---

export const metersToFeet = (meters: number): number => meters * 3.28084;
export const feetToMeters = (feet: number): number => feet / 3.28084;
export const barToPsi = (bar: number): number => bar * 14.5038;
export const psiToBar = (psi: number): number => psi / 14.5038;
export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;
export const celsiusToFahrenheit = (celsius: number): number => (celsius * 9/5) + 32;
export const fahrenheitToCelsius = (fahrenheit: number): number => (fahrenheit - 32) * 5/9;


// --- Core Dive Calculations ---

/**
 * Calculates Surface Air Consumption (SAC) and Respiratory Minute Volume (RMV).
 * @param startPressure - Starting tank pressure in bar.
 * @param endPressure - Ending tank pressure in bar.
 * @param tankLiters - The volume of the tank in liters.
 * @param durationMin - The duration of the dive in minutes.
 * @param avgDepthMeters - The average depth of the dive in meters.
 * @returns An object with sac (L/min) and rmv (L/min), or null if inputs are invalid.
 */
export const calculateSAC = (
    startPressure: number,
    endPressure: number,
    tankLiters: number,
    durationMin: number,
    avgDepthMeters: number
): { sac: number; rmv: number } | null => {
    if (durationMin <= 0 || tankLiters <= 0 || startPressure < endPressure) {
        return null;
    }
    const pressureUsed = startPressure - endPressure;
    const volumeUsed = pressureUsed * tankLiters;
    const avgPressureATA = (avgDepthMeters / 10) + 1;
    
    const rmv = volumeUsed / (durationMin * avgPressureATA);
    const sac = rmv; // SAC and RMV are often used interchangeably, representing the same value.

    return { sac, rmv };
};

/**
 * Calculates gas consumption for a planned dive.
 * @param sacLitersPerMin - Surface Air Consumption rate in liters per minute.
 * @param tankLiters - The volume of the tank in liters.
 * @param durationMin - The planned duration of the dive in minutes.
 * @param depthMeters - The planned depth of the dive in meters.
 * @param startPressureBar - The starting pressure in the tank in bar.
 * @returns An object with gas needed (liters), pressure used (bar), and end pressure (bar), or null.
 */
export const calculateGasConsumption = (
    sacLitersPerMin: number,
    tankLiters: number,
    durationMin: number,
    depthMeters: number,
    startPressureBar: number
): { gasNeededLiters: number; pressureUsedBar: number; endPressureBar: number } | null => {
    if ([sacLitersPerMin, tankLiters, durationMin, depthMeters, startPressureBar].some(v => v < 0)) {
        return null;
    }
     if ([sacLitersPerMin, tankLiters, durationMin, startPressureBar].some(v => v === 0)) {
        return null;
    }


    const avgPressureATA = (depthMeters / 10) + 1;
    const gasNeededLiters = sacLitersPerMin * durationMin * avgPressureATA;
    const pressureUsedBar = gasNeededLiters / tankLiters;
    const endPressureBar = startPressureBar - pressureUsedBar;

    return { gasNeededLiters, pressureUsedBar, endPressureBar };
};


/**
 * Calculates the Maximum Operating Depth (MOD) for a given gas mix.
 * @param o2Percent - The percentage of oxygen in the breathing gas (e.g., 32 for EANx32).
 * @param po2 - The desired partial pressure of oxygen limit (e.g., 1.4).
 * @returns The MOD in meters, or null if inputs are invalid.
 */
export const calculateMOD = (o2Percent: number, po2: number): number | null => {
    if (o2Percent <= 0 || po2 <= 0) {
        return null;
    }
    const o2Fraction = o2Percent / 100;
    const modInATA = po2 / o2Fraction;
    const modInMeters = (modInATA - 1) * 10;
    
    return modInMeters;
};

/**
 * Calculates the Equivalent Air Depth (EAD) for a Nitrox mix.
 * @param depthMeters - The actual depth of the dive in meters.
 * @param o2Percent - The percentage of oxygen in the breathing gas.
 * @returns The EAD in meters, or null if inputs are invalid.
 */
export const calculateEAD = (depthMeters: number, o2Percent: number): number | null => {
    if (depthMeters < 0 || o2Percent < 21 || o2Percent > 100) {
        return null;
    }
    const o2Fraction = o2Percent / 100;
    const n2Fraction = 1 - o2Fraction;
    const eadInMeters = ((n2Fraction / 0.79) * (depthMeters + 10)) - 10;
    
    return Math.max(0, eadInMeters); // EAD cannot be negative
};

/**
 * Calculates the best Nitrox mix (highest O2%) for a given depth and PPO2 limit.
 * @param depthMeters The planned depth in meters.
 * @param po2 The desired partial pressure of oxygen limit (e.g., 1.4).
 * @returns The best O2 percentage (rounded down), or null if inputs are invalid.
 */
export const calculateBestMix = (depthMeters: number, po2: number): number | null => {
    if (depthMeters < 0 || po2 <= 0) {
        return null;
    }
    const pressureATA = (depthMeters / 10) + 1;
    if (pressureATA === 0) return null;

    const o2Fraction = po2 / pressureATA;
    const o2Percent = o2Fraction * 100;

    // Return the floor value as dive shops blend to whole percentages
    return Math.floor(Math.min(100, o2Percent));
};

/**
 * Calculates the Partial Pressure of Oxygen (PPO2) for a given depth and gas mix.
 * @param depthMeters The depth in meters.
 * @param o2Percent The percentage of oxygen in the breathing gas.
 * @returns The PPO2 in ATA, or null if inputs are invalid.
 */
export const calculatePPO2 = (depthMeters: number, o2Percent: number): number | null => {
    if (depthMeters < 0 || o2Percent < 21 || o2Percent > 100) {
        return null;
    }
    const pressureATA = (depthMeters / 10) + 1;
    const o2Fraction = o2Percent / 100;
    return pressureATA * o2Fraction;
};

/**
 * Estimates a starting point for diver weighting.
 * @param bodyWeightKg - The diver's body weight in kilograms.
 * @param suitType - The type of exposure suit worn.
 * @param waterType - 'salt' or 'fresh'.
 * @returns An object with a recommended weight range in kg, or null if inputs are invalid.
 */
export const calculateWeighting = (
    bodyWeightKg: number,
    suitType: 'none' | '3mm' | '5mm' | '7mm' | 'drysuit',
    waterType: 'salt' | 'fresh'
): { minKg: number; maxKg: number } | null => {
    if (bodyWeightKg <= 0) {
        return null;
    }

    let basePercentage = 0;
    let extraKg = 0;

    switch (suitType) {
        case 'none':
            basePercentage = 0.01; // 1% of body weight as a very rough start
            extraKg = 1;
            break;
        case '3mm':
            basePercentage = 0.05; // 5% of body weight
            break;
        case '5mm':
            basePercentage = 0.08; // 8% of body weight
            break;
        case '7mm':
            basePercentage = 0.10; // 10% of body weight
            break;
        case 'drysuit':
            basePercentage = 0.10; // 10% of body weight + extra for undergarments
            extraKg = 4; // Average for undergarments
            break;
    }

    let saltWaterWeight = (bodyWeightKg * basePercentage) + extraKg;
    
    let finalWeight = saltWaterWeight;
    if (waterType === 'fresh') {
        finalWeight -= 2.5; // Freshwater is less dense, so less weight needed
    }
    
    // Provide a range to emphasize it's an estimate
    const minKg = Math.max(0, finalWeight - 1);
    const maxKg = finalWeight + 1;

    return { minKg, maxKg };
};

/**
 * Corrects a saltwater gauge reading for actual depth in freshwater.
 * @param gaugeReadingInMeters The depth reading from a saltwater-calibrated gauge.
 * @returns The actual depth in freshwater, in meters.
 */
export const correctDepthForFreshwater = (gaugeReadingInMeters: number): number => {
    // Saltwater is ~3% denser than fresh water.
    // A gauge calibrated for salt will read deeper than the actual depth in fresh water.
    // Actual Depth = Gauge Reading / 1.03
    return gaugeReadingInMeters / 1.03;
};

/**
 * Calculates the final volume of a flexible gas space based on Boyle's Law.
 * @param initialVolume The volume at the initial depth (any unit).
 * @param initialDepthMeters The initial depth in meters.
 * @param finalDepthMeters The final depth in meters.
 * @returns The final volume in the same unit as initialVolume.
 */
export const calculateBoylesLaw = (
    initialVolume: number,
    initialDepthMeters: number,
    finalDepthMeters: number
): number | null => {
    if (initialVolume < 0 || initialDepthMeters < 0 || finalDepthMeters < 0) return null;
    const p1_ata = (initialDepthMeters / 10) + 1;
    const p2_ata = (finalDepthMeters / 10) + 1;
    if (p2_ata === 0) return null; // Should not happen with depth >= 0
    const finalVolume = initialVolume * (p1_ata / p2_ata);
    return finalVolume;
};

/**
 * Estimates remaining dive time based on current conditions and SAC rate.
 * @param sacLitersPerMin Surface Air Consumption in liters per minute.
 * @param tankLiters The water capacity of the tank in liters.
 * @param currentPressureBar The current tank pressure in bar.
 * @param reservePressureBar The desired reserve pressure in bar.
 * @param depthMeters The current depth in meters.
 * @returns The estimated time remaining in minutes, or null if inputs invalid.
 */
export const calculateTimeRemaining = (
    sacLitersPerMin: number,
    tankLiters: number,
    currentPressureBar: number,
    reservePressureBar: number,
    depthMeters: number
): number | null => {
    if ([sacLitersPerMin, tankLiters, currentPressureBar, reservePressureBar, depthMeters].some(v => v < 0)) return null;
    if (currentPressureBar < reservePressureBar) return 0;

    const pressureATA = (depthMeters / 10) + 1;
    if (pressureATA <= 0 || sacLitersPerMin <= 0) return Infinity; // Or null, depends on desired behavior for surface
    
    const gasConsumptionAtDepth = sacLitersPerMin * pressureATA;
    if (gasConsumptionAtDepth === 0) return Infinity;
    
    const usableGasLiters = (currentPressureBar - reservePressureBar) * tankLiters;
    const timeRemainingMin = usableGasLiters / gasConsumptionAtDepth;

    return timeRemainingMin;
};

/**
 * Calculates the final oxygen percentage when topping up a tank with another gas.
 * @param initialPressure The starting pressure in the tank (any unit).
 * @param initialO2 The starting O2 percentage.
 * @param finalPressure The target final pressure (same unit as initial).
 * @param topUpO2 The O2 percentage of the gas being added.
 * @returns The final oxygen percentage, or null if inputs are invalid.
 */
export const calculateNitroxBlend = (
    initialPressure: number,
    initialO2: number,
    finalPressure: number,
    topUpO2: number
): number | null => {
    if ([initialPressure, initialO2, finalPressure, topUpO2].some(v => v < 0)) return null;
    if (finalPressure <= initialPressure) return null;

    const addedPressure = finalPressure - initialPressure;

    const finalO2Fraction = ((initialPressure * (initialO2 / 100)) + (addedPressure * (topUpO2 / 100))) / finalPressure;
    
    return finalO2Fraction * 100;
};
