import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Menu, ShieldCheck, User, X } from 'lucide-react';
import { GoldCrestMark } from './GoldCrestMark';
import { useAuth } from '../../context/AuthContext';
import { SUITE_MODULE_ITEMS } from '../suite/SuiteWorkspace';
import type { SuiteModuleId } from '../suite/InsightsDashboardModule';

export type MainNavSection =
  | 'interest'
  | 'loan-emi'
  | 'income-tax'
  | 'insights'
  | 'planners'
  | 'reports'
  | 'learn';

interface HeaderProps {
  activeNavSection: MainNavSection;
  onSelectNavSection: (section: MainNavSection) => void;
  onSelectSuiteModule?: (moduleId: SuiteModuleId) => void;
  onGoHome: () => void;
}

export const MAIN_NAV_ITEMS: { id: MainNavSection; label: string; shortLabel: string }[] = [
  { id: 'interest', label: 'Interest Calculator', shortLabel: 'Interest' },
  { id: 'loan-emi', label: 'Home Loan EMI', shortLabel: 'Loan EMI' },
  { id: 'income-tax', label: 'Income Tax', shortLabel: 'Tax' },
  { id: 'insights', label: 'Insights', shortLabel: 'Insights' },
  { id: 'planners', label: 'Wealth Planners', shortLabel: 'Planners' },
  { id: 'reports', label: 'Reports', shortLabel: 'Reports' },
  { id: 'learn', label: 'Learn & Glossary', shortLabel: 'Learn' },
];

export const Header: React.FC<HeaderProps> = ({
  activeNavSection,
  onSelectNavSection,
  onSelectSuiteModule,
  onGoHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, adminStatus, openAuthModal } = useAuth();

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

  const handleMobileSuiteClick = (moduleId: SuiteModuleId) => {
    setMobileMenuOpen(false);
    if (onSelectSuiteModule) {
      onSelectSuiteModule(moduleId);
    }
  };

  return (
    <>
      <header className="sticky top-3 z-40 px-3 sm:px-6 no-print">
        <div className="aurora-floating-nav mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3.5 py-2 sm:px-5">
          {/* Brand Crest */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onGoHome();
            }}
            className="inline-flex items-center gap-2 pl-1 text-sm sm:text-base font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
          >
            <GoldCrestMark size={28} animate3D={false} />
            <span>
              CalHub <span className="aurora-text-gradient font-bold">FinCalc</span>
            </span>
          </button>

          {/* Single Main Floating Pill Navigation Container */}
          <nav
            aria-label="Primary financial navigation"
            className="hidden lg:flex items-center gap-0.5 rounded-full border border-[#6366F1]/25 bg-[#080D1B]/65 p-1"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isCurrent = activeNavSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative rounded-full px-2.5 xl:px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4] ${
                    isCurrent
                      ? 'text-[#F8FAFC] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#38BDF8]'
                  }`}
                >
                  {isCurrent && (
                    <motion.span
                      layoutId="header-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#A855F7] shadow-[0_0_22px_-2px_rgba(99,102,241,0.7)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Account / SQLite Vault Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal(user ? 'login' : 'register');
              }}
              aria-label={user ? `Account settings for ${user.name}` : 'Open Account and SQLite Vault'}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6366F1]/35 bg-[#0B1020]/90 px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#06B6D4] hover:text-[#38BDF8] transition-colors whitespace-nowrap cursor-pointer"
            >
              {adminStatus.isAdminSession ? (
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
              ) : user ? (
                <User className="h-3.5 w-3.5 text-[#06B6D4]" aria-hidden="true" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-[#8B5CF6]" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {user ? user.name.split(' ')[0] : 'Account'}
              </span>
            </button>

            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[#6366F1]/35 bg-[#0F172A]/60 text-[#38BDF8] transition-colors hover:border-[#06B6D4] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Frosted-Glass Aurora Mobile Drawer */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-30 lg:hidden bg-[#080D1B]/95 backdrop-blur-2xl transition-opacity duration-200 overflow-y-auto ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex min-h-full flex-col justify-center gap-3 px-6 pt-20 pb-24 max-w-md mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#38BDF8]">
            Core Calculators
          </p>
          {MAIN_NAV_ITEMS.slice(0, 3).map((item) => {
            const isCurrent = activeNavSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#8B5CF6]/60 bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#A855F7] text-[#F8FAFC] shadow-[0_12px_28px_-8px_rgba(99,102,241,0.6)]'
                    : 'border-[#6366F1]/25 bg-[#0F172A]/60 text-[#F8FAFC] hover:border-[#06B6D4]/55 hover:text-[#38BDF8]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#A855F7]">
            Financial Suite (10 Modules)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUITE_MODULE_ITEMS.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleMobileSuiteClick(mod.id)}
                className="rounded-xl border border-[#6366F1]/25 bg-[#0F172A]/60 px-3 py-2.5 text-left text-xs font-semibold text-[#F8FAFC] hover:border-[#06B6D4]/60 hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                {mod.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
