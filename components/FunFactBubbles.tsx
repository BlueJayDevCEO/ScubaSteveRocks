
import React, { useState, useEffect, useRef } from 'react';
import { getFunFact } from '../services/geminiService';

interface Bubble {
  id: number;
  text: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export const FunFactBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [fact, setFact] = useState<string | null>(null);
  const [isFactVisible, setIsFactVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate ambient bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return; // Don't generate if tab is hidden

      const newBubble: Bubble = {
        id: Date.now(),
        text: '',
        left: Math.random() * 90 + 5, // 5% to 95%
        size: Math.random() * 40 + 20, // 20px to 60px
        duration: Math.random() * 10 + 10, // 10s to 20s
        delay: 0,
      };

      setBubbles(prev => [...prev.slice(-15), newBubble]); // Keep max 15 bubbles in DOM
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Occasionally fetch a fun fact
  useEffect(() => {
    const fetchFact = async () => {
        try {
            const newFact = await getFunFact();
            setFact(newFact);
            setIsFactVisible(true);
            
            // Hide after 10 seconds
            setTimeout(() => {
                setIsFactVisible(false);
            }, 10000);
        } catch (e) {
            console.error("Failed to fetch fun fact", e);
        }
    };

    // Fetch a fact every 5 minutes to save quota (was 2 mins)
    const factInterval = setInterval(fetchFact, 300000);
    
    // Initial fetch after 10 seconds
    const initialTimeout = setTimeout(fetchFact, 10000);

    return () => {
        clearInterval(factInterval);
        clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-[-100px] rounded-full bg-light-accent/10 dark:bg-dark-accent/10 border border-light-accent/20 dark:border-dark-accent/20 backdrop-blur-[1px]"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animation: `floatUp ${bubble.duration}s linear forwards`,
          }}
        />
      ))}

      {fact && (
          <div 
            className={`absolute bottom-24 right-4 sm:right-8 max-w-xs p-4 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-md rounded-2xl shadow-xl border border-light-accent/30 dark:border-dark-accent/30 transition-all duration-500 transform ${isFactVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
          >
              <div className="flex items-start gap-3">
                  <span className="text-2xl">🐡</span>
                  <div>
                      <h4 className="font-heading font-bold text-sm text-light-accent dark:text-dark-accent mb-1">Did you know?</h4>
                      <p className="text-sm text-light-text dark:text-dark-text">{fact}</p>
                  </div>
                  <button onClick={() => setIsFactVisible(false)} className="text-light-text/50 hover:text-light-text dark:text-dark-text/50 dark:hover:text-dark-text pointer-events-auto">&times;</button>
              </div>
          </div>
      )}
    </div>
  );
};
