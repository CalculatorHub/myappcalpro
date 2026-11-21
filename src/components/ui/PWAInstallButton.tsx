import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#111111] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
      >
        <Download className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#111111] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#F5D76E] hover:text-[#F5D76E] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
        >
          <Smartphone className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="luxury-card w-full max-w-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Install on iPhone or iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close guide"
                  className="rounded-lg p-1.5 text-[#A1A1AA] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                1. Tap the <strong className="text-white">Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="gold-shimmer-btn mt-5 w-full rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
