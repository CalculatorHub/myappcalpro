import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { GoldCrestMark } from './GoldCrestMark';

export type MainNavSection = 'interest' | 'loan-emi' | 'income-tax';

interface HeaderProps {
  activeNavSection: MainNavSection;
  onSelectNavSection: (section: MainNavSection) => void;
  onGoHome: () => void;
}

export const MAIN_NAV_ITEMS: { id: MainNavSection; label: string; shortLabel: string }[] = [
  { id: 'interest', label: 'Interest Calculator', shortLabel: 'Interest' },
  { id: 'loan-emi', label: 'Home Loan EMI', shortLabel: 'Loan EMI' },
  { id: 'income-tax', label: 'Income Tax', shortLabel: 'Tax' },
];

export const Header: React.FC<HeaderProps> = ({
  activeNavSection,
  onSelectNavSection,
  onGoHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (section: MainNavSection) => {
    setMobileMenuOpen(false);
    onSelectNavSection(section);
  };

  return (
    <>
      <header className="sticky top-3 z-40 px-3 sm:px-6 no-print">
        <div className="glass-floating-nav mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-3.5 py-2 sm:px-5">
          {/* Brand Crest */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onGoHome();
            }}
            className="inline-flex items-center gap-2.5 pl-1 text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            <GoldCrestMark size={28} animate3D={false} />
            <span>
              CalHub <span className="gold-text-gradient font-bold">FinCalc</span>
            </span>
          </button>

          {/* Floating Rounded Pill Navigation Container */}
          <nav
            aria-label="Primary calculator navigation"
            className="hidden lg:flex items-center gap-1 rounded-full border border-[#D4AF37]/18 bg-black/45 p-1"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isCurrent = activeNavSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs xl:text-[13px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${
                    isCurrent
                      ? 'text-[#050505] font-semibold'
                      : 'text-[#A1A1AA] hover:text-[#F5D76E]'
                  }`}
                >
                  {isCurrent && (
                    <motion.span
                      layoutId="header-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F5D76E] via-[#D4AF37] to-[#C29724] shadow-[0_0_20px_-2px_rgba(212,175,55,0.65)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white/[0.04] text-[#F5D76E] transition-colors hover:border-[#F5D76E] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Luxury Frosted-Glass Mobile Drawer */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-30 lg:hidden bg-[#050505]/92 backdrop-blur-2xl transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-4 px-6 pt-16 max-w-md mx-auto">
          {MAIN_NAV_ITEMS.map((item) => {
            const isCurrent = activeNavSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#F5D76E]/55 bg-gradient-to-r from-[#F5D76E] to-[#D4AF37] text-[#050505] shadow-[0_12px_28px_-8px_rgba(212,175,55,0.55)]'
                    : 'border-[#D4AF37]/20 bg-white/[0.04] text-white hover:border-[#D4AF37]/50 hover:text-[#F5D76E]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
