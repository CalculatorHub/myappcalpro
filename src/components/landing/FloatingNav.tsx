import { useEffect, useState } from 'react';
import { BookOpen, DownloadSimple } from '@phosphor-icons/react';
import { Logo3D } from './Logo3D';

export type AppRoute = 'landing' | 'calculators' | 'privacy' | 'terms' | 'not-found';

interface FloatingNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, sectionId?: string) => void;
  onDownloadKit: () => void;
  onOpenCalculators: () => void;
}

const MOBILE_ITEMS: { label: string; route: AppRoute; sectionId?: string }[] = [
  { label: 'Calculators', route: 'calculators' },
  { label: 'Formula Guide', route: 'landing', sectionId: 'formula-guide' },
  { label: 'Privacy', route: 'privacy' },
  { label: 'Terms', route: 'terms' },
];

export function FloatingNav({
  currentRoute,
  onNavigate,
  onDownloadKit,
  onOpenCalculators,
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
      {/* Compact Header Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(7,9,15,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark with 3D Logo */}
          <button
            type="button"
            onClick={() => handleLinkClick('landing')}
            className="inline-flex items-center gap-2 title-3 font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-md px-1 text-primary"
          >
            <Logo3D />
            FinCalc <span className="gold-accent">Pro</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            <button
              type="button"
              onClick={() => onOpenCalculators()}
              className={`title-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-md px-1 ${
                currentRoute === 'calculators'
                  ? 'text-accent-gold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Calculators
            </button>
            <button
              type="button"
              onClick={() => onDownloadKit()}
              className="button-sm inline-flex items-center gap-2 rounded-lg bg-accent-gold px-3 py-1.5 text-bg-main transition-transform hover:bg-accent-gold-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <DownloadSimple size={14} weight="bold" aria-hidden="true" />
              <span>Formula Guide</span>
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-bg-raised text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold md:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5 rotate-0'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-current transition-opacity duration-300 ${
                mobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5 rotate-0'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-bg-main/98 backdrop-blur-xl transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col justify-between h-full px-6 pt-20 pb-8">
          <nav className="flex flex-col gap-4">
            {MOBILE_ITEMS.map((item, idx) => {
              const delayMs = Math.min(idx * 50, 250);
              const isCurrent = item.route === currentRoute && !item.sectionId;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleLinkClick(item.route, item.sectionId)}
                  style={{ transitionDelay: mobileOpen ? `${delayMs}ms` : '0ms' }}
                  className={`title-2 text-left transition-[transform,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-md px-1 ${
                    mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  } ${isCurrent ? 'text-accent-gold' : 'text-primary'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border-subtle pt-6">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenCalculators();
              }}
              className="button-md flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-bg-main transition-transform hover:bg-accent-gold-hover active:scale-95"
            >
              <BookOpen size={18} weight="bold" aria-hidden="true" />
              <span>Open Calculators</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onDownloadKit();
              }}
              className="button-sm flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-raised px-4 py-2 text-secondary transition-colors hover:text-primary hover:border-border-default"
            >
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              <span>Download Formula Kit</span>
            </button>
            <p className="caption-4 text-center text-muted">
              Free to use · No signup required
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
