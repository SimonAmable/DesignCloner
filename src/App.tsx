/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Banner } from './components/Banner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PricingModal } from './components/PricingModal';
import { InspectorMode } from './components/InspectorMode';
import { SimonStarIcon } from './components/SimonStarIcon';

export default function App() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);

  return (
    <div className="vbg-root min-h-screen bg-black text-white selection:bg-white selection:text-black font-inter">
      {/* Top Banner */}
      <Banner />

      {/* Main Content Area */}
      <main className="vbg-main relative flex w-full flex-col bg-black">
        {/* Hero Section */}
        <section className="vbg-hero-section relative p-2 sm:p-3">
          <div className="vbg-hero relative flex min-h-[620px] sm:min-h-[750px] md:min-h-[889px] flex-1 overflow-hidden rounded-[16px] sm:rounded-[24px] bg-black">
            
            {/* Background Ambience Video (Mirrored) */}
            <div className="vbg-video-wrap absolute inset-0 z-0 overflow-hidden rounded-[16px] sm:rounded-[24px] bg-black">
              <video
                className="vbg-video is-active absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_032550_63bcca7b-697f-4c1c-bf3b-45465f101d01.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                style={{ transform: 'matrix(-1, 0, 0, 1, 0, 0)' }}
              />
            </div>

            {/* Hero Interactive UI Layer */}
            <div className="vbg-hero-ui relative z-10 flex flex-1 flex-col items-center justify-start px-4 pt-[100px] pb-8 sm:px-6 sm:pt-[125px] sm:pb-10 md:px-14 md:pt-[151.2px]">
              
              {/* Header Navigation */}
              <Header
                onPricingClick={() => setIsPricingOpen(true)}
                onTryNowClick={() => setIsInspectorActive(prev => !prev)}
              />

              {/* Copy & CTA Section */}
              <div className="vbg-copy z-10 flex w-full max-w-[900px] flex-shrink-0 flex-col items-center justify-center gap-3 pt-6 pb-10 sm:gap-3.5 sm:pt-8 sm:pb-16 text-center text-white/78">
                
                {/* By SimonAmable Badge */}
                <a
                  className="vbg-powered-by group mb-0.5 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/15 bg-white/5 py-1 px-3 sm:px-3.5 transition-all duration-200 hover:border-white/35 hover:bg-white/10"
                  href="https://simonamable.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-medium text-[13px] sm:text-[14px] tracking-[0.16px] text-white/64 group-hover:text-white/90">
                    By
                  </span>
                  <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-black/60 p-0.5 text-white">
                    <SimonStarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-semibold text-[13px] sm:text-[14px] text-white tracking-wide group-hover:text-white">
                    SimonAmable
                  </span>
                </a>

                {/* H1 Main Headline */}
                <h1 className="vbg-h1 vbg-h1-b font-montserrat text-2xl font-extrabold uppercase leading-tight tracking-[-0.8px] text-white sm:text-4xl sm:tracking-[-1.2px] md:text-[48px] md:leading-[50.4px] md:tracking-[-1.44px] px-1">
                  <span className="block sm:whitespace-nowrap">Design With No Limits</span>
                  <span className="block sm:whitespace-nowrap">Grab the design. Prompt. Ship.</span>
                </h1>

                {/* Subtitle Description */}
                <p className="vbg-sub max-w-[540px] px-2 text-sm leading-relaxed text-white/78 sm:text-[18px] sm:leading-[26.1px]">
                  A magical browser extension for vibe coding faster. Hover any element, copy it for Lovable, Claude, Cursor or Gemini.
                </p>

                {/* Main CTA Button */}
                <button
                  type="button"
                  onClick={() => setIsPricingOpen(true)}
                  className="vbg-btn-white mt-1.5 sm:mt-2 flex h-11 sm:h-12 w-full max-w-[190px] sm:w-[174.3px] cursor-pointer items-center justify-center rounded-full bg-white px-6 sm:px-7 text-center font-semibold text-sm sm:text-base leading-[22.4px] text-black transition-all"
                >
                  Get Pro Access
                </button>
              </div>

              {/* Showcase Demo Video Card */}
              <div
                className="vbg-demo relative z-10 mt-8 sm:mt-14 w-full max-w-[1200px] flex-shrink-0"
                aria-hidden="true"
              >
                <video
                  className="vbg-demo-video block aspect-[3184/2160] w-full rounded-[12px] sm:rounded-[18px] bg-black object-contain shadow-[0px_24px_60px_0px_rgba(0,0,0,0.55),0px_6px_18px_0px_rgba(0,0,0,0.35)]"
                  src="https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/amewdemoheroArea.mp4"
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  muted
                />
              </div>
            </div>
          </div>
        </section>

        {/* Next / Footer Section with Rotating Paste Target Line */}
        <section className="vbg-next relative bg-black px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 text-white">
          <Footer />
        </section>
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      {/* Interactive Element Inspector Overlay */}
      <InspectorMode
        isActive={isInspectorActive}
        onDeactivate={() => setIsInspectorActive(false)}
      />
    </div>
  );
}
