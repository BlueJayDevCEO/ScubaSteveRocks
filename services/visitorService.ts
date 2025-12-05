const VISITOR_COUNT_KEY = 'scubaSteveVisitorCount';
const SESSION_FLAG_KEY = 'scubaSteveVisitorCounted';

/**
 * Increments the global visitor count if the user has not been counted in the current session.
 * @returns The total visitor count.
 */
export const incrementAndGetVisitorCount = (): number => {
    try {
        const hasBeenCounted = sessionStorage.getItem(SESSION_FLAG_KEY);
        // Start with a higher base number for a better visual effect
        let currentCount = parseInt(localStorage.getItem(VISITOR_COUNT_KEY) || '1337', 10);

        if (!hasBeenCounted) {
            currentCount++;
            localStorage.setItem(VISITOR_COUNT_KEY, currentCount.toString());
            sessionStorage.setItem(SESSION_FLAG_KEY, 'true');
        }
        
        return currentCount;
    } catch (e) {
        console.error("Failed to manage visitor count", e);
        return 1; // Return a default value on error
    }
};