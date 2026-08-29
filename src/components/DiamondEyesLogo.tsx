import React from 'react';

export const DiamondEyesLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Carbon Diamond with Simple Black Filled Circle Eyes */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 transition-transform duration-300 hover:scale-105"
        aria-hidden="true"
      >
        {/* Solid All-White Carbon Diamond Gem Shape */}
        <polygon
          points="8,7 28,7 34,16 18,33 2,16"
          fill="#ffffff"
        />

        {/* Simple Black Filled Circle Eyes */}
        <circle cx="13" cy="17" r="2.3" fill="#000000" />
        <circle cx="23" cy="17" r="2.3" fill="#000000" />
      </svg>

      {/* Brand Wordmark */}
      <span className="font-montserrat font-extrabold text-[16px] sm:text-[19px] tracking-[-0.5px] uppercase text-white whitespace-nowrap">
        Design Cloner
      </span>
    </div>
  );
};

