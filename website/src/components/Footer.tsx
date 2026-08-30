import React from 'react';
import { PasteTicker } from './PasteTicker';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="vbg-footer relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 text-center">
      {/* Top Row: Copyright, Dynamic Paste Line, Contact */}
      <div className="flex w-full flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row md:gap-0">
        {/* Left Copyright */}
        <p className="vbg-copyright text-xs sm:text-sm tracking-[0.14px] text-white/70">
          © 2026 Design Cloner
        </p>

        {/* Center Dynamic Paste Line */}
        <div className="my-1 sm:my-2 md:my-0">
          <PasteTicker />
        </div>

        {/* Right Contact Link */}
        <div className="flex items-center gap-4">
          <a
            href="/privacy.html"
            className="vbg-copyright vbg-contact-link block text-xs sm:text-sm tracking-[0.14px] text-white/70 transition-colors hover:text-white"
          >
            Privacy
          </a>
          <a
            href="https://simonamable.com"
            target="_blank"
            rel="noopener noreferrer"
            className="vbg-copyright vbg-contact-link block text-xs sm:text-sm tracking-[0.14px] text-white/70 transition-colors hover:text-white"
          >
            Contact us
          </a>
        </div>
      </div>

      {/* Bottom 1-line Credit Line */}
      <div className="w-full pt-1 text-center">
        <p className="text-[12px] sm:text-[13px] tracking-wide text-white/60">
          Created by{' '}
          <a
            href="https://simonamable.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Simon
          </a>{' '}
          inspired by{' '}
          <a
            href="https://x.com/viktoroddy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Viktor
          </a>
        </p>
      </div>
    </footer>
  );
};


