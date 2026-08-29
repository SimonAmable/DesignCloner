import React, { useState, useEffect } from 'react';

interface BannerProps {
  onClose?: () => void;
}

export const Banner: React.FC<BannerProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 46,
    seconds: 57
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const h = String(timeLeft.hours).padStart(2, '0');
    const m = String(timeLeft.minutes).padStart(2, '0');
    const s = String(timeLeft.seconds).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!isVisible) return null;

  return (
    <div
      id="early-access-banner"
      className="vbg-banner relative z-50 flex min-h-8 items-center justify-center gap-1.5 px-7 py-1.5 sm:px-8 text-[11px] sm:text-[13px] leading-tight sm:leading-[18.2px] text-white text-center"
      style={{ backgroundColor: 'rgb(230, 75, 34)' }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="block flex-shrink-0 sm:w-4 sm:h-4"
      >
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
      <span className="flex-wrap items-center justify-center">
        Early Access Sale -{' '}
        <span className="vbg-strike line-through opacity-85">$359</span> now $0 (Free) -{' '}
        <span className="vbg-count font-bold whitespace-nowrap">{formatTime()}</span> left
      </span>
      <button
        type="button"
        className="vbg-banner-x absolute top-1 right-1.5 sm:right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-[6px] text-white transition-colors"
        aria-label="Close banner"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="block"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};
