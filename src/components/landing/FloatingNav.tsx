import { useEffect, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';

export type AppRoute = 'landing' | 'calculators' | 'privacy' | 'terms' | 'not-found';

interface FloatingNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, sectionId?: string) => void;
  onDownloadKit: () => void;
}

const MOBILE_ITEMS: { label: string; route: AppRoute; sectionId?: string }[] = [
  { label: 'Overview', route: 'landing' },
  { label: 'Benefits', route: 'landing', sectionId: 'benefits' },
  { label: 'How it works', route: 'landing', sectionId: 'how-it-works' },
  { label: 'FAQ', route: 'landing', sectionId: 'faq' },
  { label: 'Calculators', route: 'calculators' },
];

export function FloatingNav({
  currentRoute,
  onNavigate,
  onDownloadKit,
}: FloatingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLinkClick = (route: AppRoute, sectionId?: string) => {
    setMobileOpen(false);
    onNavigate(route, sectionId);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav
          aria-label="Primary navigation"
          className="flex w-fit max-w-full items-center gap-4 rounded-2xl border border-[#272727] bg-[#181818]/85 px-4 py-2 backdrop-blur-md sm:gap-8"
        >
          {/* Brand wordmark */}
          <button
            type="button"
            onClick={() => handleLinkClick('landing')}
            className="title-3 text-white transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] whitespace-nowrap shrink-0 rounded-md px-1"
          >
            FinCalc <span className="text-[#D4AF37]">Pro</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'benefits')}
              className={`title-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-1 whitespace-nowrap shrink-0 ${
                currentRoute === 'landing'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'how-it-works')}
              className="title-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-1 whitespace-nowrap shrink-0"
            >
              Process
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('landing', 'faq')}
              className="title-4 text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-1 whitespace-nowrap shrink-0"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('calculators')}
              className={`title-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-1 whitespace-nowrap shrink-0 ${
                currentRoute === 'calculators'
                  ? 'text-[#D4AF37]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Calculators
            </button>
          </div>

          {/* Primary header CTA */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={onDownloadKit}
              className="button-sm inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-[#000000] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E5C158] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap shrink-0"
            >
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              <span>Download kit</span>
            </button>
          </div>

          {/* Mobile animated menu toggle (hamburger <-> X) */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#272727] bg-[#1F1F1F] text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#272727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-white transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                mobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'
              }`}
            />
          </button>
        </nav>
      </div>

      {/* Full-height Mobile Menu Panel */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-[#000000]/95 px-6 pt-24 pb-8 backdrop-blur-xl transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {MOBILE_ITEMS.map((item, idx) => {
            const delayMs = Math.min(idx * 60, 400);
            const isCurrent =
              item.route === currentRoute && !item.sectionId;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleLinkClick(item.route, item.sectionId)}
                style={{ transitionDelay: mobileOpen ? `${delayMs}ms` : '0ms' }}
                className={`heading-4 text-left transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                  mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } ${isCurrent ? 'text-[#D4AF37]' : 'text-white'}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-[#272727] pt-6">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onDownloadKit();
            }}
            className="button-md flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-[#000000] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
          >
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            <span>Download free CA formula kit</span>
          </button>
          <p className="caption-4 text-center text-zinc-400">
            Free to use with no signup required
          </p>
        </div>
      </div>
    </>
  );
}
