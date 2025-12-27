
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { createCheckoutSession } from '../services/stripeService';

export const DonationBanner: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AppContext);
    const user = context?.user;

    const handleDonate = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user || user.uid === 'mock-demo-user' || user.email === 'steve@scubasteve.rocks') {
            alert("Please sign in to donate.");
            return;
        }
        setIsLoading(true);
        try {
            await createCheckoutSession(user.uid, 'donation');
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 p-3 rounded-xl bg-light-primary-end/10 text-light-text dark:bg-dark-primary-end/10 dark:text-dark-text animate-fade-in text-center">
            <p>Loved this? Toss a coin to Steve.
                <button 
                    onClick={handleDonate}
                    disabled={isLoading}
                    className="font-bold text-light-accent dark:text-dark-accent hover:underline ml-2 whitespace-nowrap disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Donate Now'}
                </button>
            </p>
            <p className="text-xs mt-1 text-light-text/60 dark:text-dark-text/60">
                OSEA Diver™ donates up to 25% of all proceeds to verified marine-conservation partners.
            </p>
        </div>
    );
};
