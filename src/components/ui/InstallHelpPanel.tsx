import { useState, useEffect } from 'react';
import { X, Desktop, DeviceMobile } from '@phosphor-icons/react';

export function InstallHelpPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary"
        >
          <X size={20} />
        </button>
        <h2 className="title-1 mb-6 text-primary">Install FinCalc Pro</h2>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-accent-gold">
              <Desktop size={20} />
              <h3 className="title-3">Desktop (Chrome/Edge)</h3>
            </div>
            <p className="body-6 text-secondary">
              Look for the "Install" icon in the address bar (top right) or go to your browser menu and select "Install FinCalc Pro".
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-accent-gold">
              <DeviceMobile size={20} />
              <h3 className="title-3">Mobile Devices</h3>
            </div>
            <ul className="body-6 text-secondary space-y-2 list-disc list-inside">
              <li><span className="font-semibold text-primary">Android:</span> Tap the Chrome menu (⋮) → "Add to Home screen".</li>
              <li><span className="font-semibold text-primary">iPhone/iPad:</span> Tap the Safari Share button → "Add to Home Screen".</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
