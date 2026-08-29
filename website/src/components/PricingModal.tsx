import React from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0e0e11] p-5 sm:p-8 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex h-7 w-7 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white text-xs sm:text-sm"
        >
          ✕
        </button>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E64B22]/20 px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#E64B22]">
          <span>⚡</span> Early Access Special
        </div>

        <h3 className="font-montserrat text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
          Design Cloner Pro License
        </h3>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-white/70">
          Capture any live web component into clean, production-ready code optimized for Claude, Lovable, Cursor, Copilot, and Gemini.
        </p>

        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">$0</span>
              <span className="ml-2 text-sm sm:text-base text-white/40 line-through">$359</span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-emerald-400">
              100% FREE
            </span>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-white/50">Free forever • Lifetime updates & extension access</p>

          <ul className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/80">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Instant Chrome Extension access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 1-click Component & Full-page Inspector
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Auto-prompt formatter for Claude & Cursor
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Direct Figma token extraction
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Commercial license for unlimited projects
            </li>
          </ul>

          <button
            type="button"
            onClick={() => {
              alert('Enjoy Design Cloner for free!');
              onClose();
            }}
            className="mt-5 sm:mt-6 flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center rounded-full bg-white font-semibold text-sm sm:text-base text-black transition-all hover:bg-white/90"
          >
            Claim Lifetime Access (Free)
          </button>
        </div>
      </div>
    </div>
  );
};
