import React from 'react';

export const SimonStarIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 8-Pointed Star in Upper Right */}
      <g transform="translate(58, 26)">
        {/* Main Vertical & Horizontal Spikes */}
        <polygon points="0,-22 2.5,-3 22,0 2.5,3 0,22 -2.5,3 -22,0 -2.5,-3" fill="#ffffff" />
        {/* Diagonal Spikes */}
        <polygon points="0,-12 1.8,-1.8 12,0 1.8,1.8 0,12 -1.8,1.8 -12,0 -1.8,-1.8" transform="rotate(45)" fill="#ffffff" />
      </g>

      {/* Radiant Halo / Wheel behind the head */}
      <g transform="translate(37, 47)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="14" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        {/* 8 Spokes inside Wheel */}
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="1.8" />
        <line x1="-9.9" y1="-9.9" x2="9.9" y2="9.9" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="9.9" y1="-9.9" x2="-9.9" y2="9.9" stroke="#ffffff" strokeWidth="1.5" />
        {/* Inner Hub */}
        <circle cx="0" cy="0" r="3" fill="#ffffff" />
      </g>

      {/* Silhouette of Sitting Person Looking Upwards */}
      <g transform="translate(37, 50)">
        {/* Head tilted upward to top right */}
        <path
          d="M-3,-3 C-3,-6 1,-8 4,-6 C7,-4 7,-1 5,2 C3,4 -1,3 -3,-3 Z"
          fill="#ffffff"
        />
        {/* Torso & Cloak */}
        <path
          d="M-9,2 C-14,8 -13,22 -10,28 C-7,33 -1,34 5,34 C12,34 18,32 23,28 C26,25 21,20 17,21 C12,22 6,24 2,22 C-1,20 4,14 7,10 C9,7 6,4 2,4 C-2,4 -6,0 -9,2 Z"
          fill="#ffffff"
        />
        {/* Bent Knee & Leg pointing right */}
        <path
          d="M3,12 C8,15 15,22 28,30 C31,32 30,35 24,34 C16,33 9,25 0,17 Z"
          fill="#ffffff"
        />
        {/* Foot detail */}
        <path
          d="M25,29 C29,31 33,33 34,34 C33,36 28,36 24,34 Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  );
};
