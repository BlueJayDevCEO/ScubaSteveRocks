
import React from 'react';

export const DonationBanner: React.FC = () => {
    return (
        <div className="mt-4 p-3 rounded-xl bg-light-primary-end/10 text-light-text dark:bg-dark-primary-end/10 dark:text-dark-text animate-fade-in text-center">
            <p>Loved this? Toss a coin to Steve.
                <a href="https://buy.stripe.com/eVq4gy8wj090bjZgGA1ZS0e" target="_blank" rel="noopener noreferrer" className="font-bold text-light-accent dark:text-dark-accent hover:underline ml-2 whitespace-nowrap">
                    Donate Now
                </a>
            </p>
            <p className="text-xs mt-1 text-light-text/60 dark:text-dark-text/60">
                OSEA Diver™ donates up to 25% of all proceeds to verified marine-conservation partners.
            </p>
        </div>
    );
};
