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
        className="inline-flex items-center gap-2 rounded-xl border border-[#6366F1]/35 bg-[#0B1020] px-3.5 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]"
      >
        <Download className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
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
          className="inline-flex items-center gap-2 rounded-xl border border-[#6366F1]/35 bg-[#0B1020] px-3.5 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#06B6D4] hover:text-[#38BDF8] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]"
        >
          <Smartphone className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080D1B]/80 backdrop-blur-sm p-4">
            <div className="aurora-card w-full max-w-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#F8FAFC]">Install on iPhone or iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close guide"
                  className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-white/10 hover:text-[#F8FAFC] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
                1. Tap the <strong className="text-[#F8FAFC]">Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and select <strong className="text-[#F8FAFC]">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="aurora-btn-primary mt-5 w-full rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
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
