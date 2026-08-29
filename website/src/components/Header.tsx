import React from 'react';
import { DiamondEyesLogo } from './DiamondEyesLogo';

interface HeaderProps {
  onPricingClick?: () => void;
  onTryNowClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPricingClick, onTryNowClick }) => {
  return (
    <header
      id="main-header"
      className="vbg-header absolute top-3 sm:top-5 right-0 left-0 z-40 flex h-[56px] sm:h-[68px] items-center justify-between px-4 sm:px-6 md:px-9"
    >
      {/* Left Logo */}
      <a href="/" className="vbg-logo flex items-center cursor-pointer transition-opacity hover:opacity-90">
        <DiamondEyesLogo />
      </a>

      {/* Center Chrome Badge */}
      <div className="vbg-chrome-pill vbg-hide-mobile flex flex-1 items-center justify-center gap-[7px] whitespace-nowrap px-2">
        <span className="vbg-chrome-label text-[13px] leading-[18.2px] tracking-[0.13px] text-white/62">
          Available to install on
        </span>
        <img
          src="https://getdesign.ai/__l5e/assets-v1/3746095d-7c29-419e-844d-6b5e29e5133c/chrome-icon.png"
          alt="Chrome Icon"
          className="vbg-chrome-icon block h-[18px] w-[18px] max-w-full"
        />
        <span className="vbg-chrome-name text-[13px] font-bold leading-[18.2px] tracking-[0.13px] text-white">
          Google Chrome
        </span>
      </div>

      {/* Right Actions */}
      <div className="vbg-right flex items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={onPricingClick}
          className="vbg-btn-outline vbg-hide-mobile block h-9 sm:h-10 cursor-pointer rounded-full border-2 border-white px-3.5 sm:px-[18px] text-center text-xs sm:text-sm font-semibold text-white transition-colors"
        >
          Pricing
        </button>

        <span className="try-now-wrap relative flex">
          <button
            type="button"
            onClick={onTryNowClick}
            className="try-now-btn flex h-9 sm:h-10 cursor-pointer items-center gap-1.5 sm:gap-2 rounded-full border-2 border-white bg-white px-3.5 sm:px-[18px] text-center text-xs sm:text-sm font-semibold text-black transition-colors"
            aria-label="Try now"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="block h-3.5 w-3.5 sm:h-4 sm:w-4"
            >
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path
                fillRule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 6.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-6.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                clipRule="evenodd"
              />
            </svg>
            Try now
          </button>

          {/* Curved Hand-Drawn Hint Arrow (desktop only) */}
          <span
            className="try-hint pointer-events-none absolute -bottom-[62px] -left-[108px] hidden items-end gap-1.5 whitespace-nowrap text-2xl font-semibold text-white md:flex"
            style={{
              fontFamily: 'Caveat, cursive',
              transformOrigin: '170.5px 0px',
              transform: 'rotate(-6deg)'
            }}
            aria-hidden="true"
          >
            <span className="try-hint-text">Try on this page</span>
            <svg
              className="try-hint-arrow mb-[2px] block h-[52px] w-[34px]"
              viewBox="0 0 48 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 64c6-1 28-10 28-46"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M25 28l11-12 11 9"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
    </header>
  );
};
