import React from 'react';
import { GoldCrestMark } from '../ui/GoldCrestMark';
import { PWAInstallButton } from '../ui/PWAInstallButton';

export type AppRoute = 'home' | 'privacy' | 'terms' | 'not-found';

interface FooterProps {
  onNavigateRoute: (route: AppRoute) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateRoute,
  onNavigateSection,
}) => {
  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#050505] no-print">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRoute('home');
            }}
            className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            <GoldCrestMark size={28} animate3D={false} />
            <span>
              CalHub <span className="gold-text-gradient font-bold">FinCalc</span>
            </span>
          </a>
          <p className="max-w-md text-xs leading-relaxed text-[#A1A1AA]">
            Educational Indian finance and tax calculators. Results are estimates for study and
            planning purposes only—confirm statutory filings against Income Tax Department rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#A1A1AA]">
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => onNavigateSection('calculators')}
            className="gold-underline hover:text-[#F5D76E] transition-colors cursor-pointer"
          >
            Calculators
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('history')}
            className="gold-underline hover:text-[#F5D76E] transition-colors cursor-pointer"
          >
            History
          </button>
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRoute('privacy');
            }}
            className="gold-underline hover:text-[#F5D76E] transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              onNavigateRoute('terms');
            }}
            className="gold-underline hover:text-[#F5D76E] transition-colors cursor-pointer"
          >
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};
