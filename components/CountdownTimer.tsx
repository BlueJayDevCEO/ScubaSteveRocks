
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryTimestamp: number;
  onComplete?: () => void;
}

const calculateTimeLeft = (expiry: number) => {
  const difference = expiry - new Date().getTime();
  let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryTimestamp, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryTimestamp));

  useEffect(() => {
    // Set up an interval that updates the time left every second.
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryTimestamp);
      setTimeLeft(newTimeLeft);

      // When the countdown finishes, clear the interval and call the onComplete callback.
      if (newTimeLeft.hours <= 0 && newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    // Clean up the interval when the component unmounts or dependencies change.
    return () => clearInterval(timer);
  }, [expiryTimestamp, onComplete]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="font-mono text-4xl font-bold bg-light-bg dark:bg-dark-bg p-4 rounded-lg my-4 text-light-accent dark:text-dark-accent">
      <span>{pad(timeLeft.hours)}</span>:
      <span>{pad(timeLeft.minutes)}</span>:
      <span>{pad(timeLeft.seconds)}</span>
    </div>
  );
};
