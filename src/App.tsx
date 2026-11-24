import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Header, type MainNavSection } from './components/ui/Header';
import { LuxuryLoader } from './components/ui/LuxuryLoader';
import { InteractiveBackground } from './components/ui/InteractiveBackground';
import { MobileBottomNav } from './components/ui/MobileBottomNav';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { HeroSection } from './components/landing/HeroSection';
import { CalculatorWorkspace } from './components/calculators/CalculatorWorkspace';
import { HistoryPanel } from './components/calculators/HistoryPanel';
import { Footer, type AppRoute } from './components/landing/Footer';
import { LegalView } from './components/landing/LegalView';
import type { CalculatorId } from './data/calculatorCatalog';
import {
  appendCalculationHistory,
  clearCalculationHistory,
  getCalculationHistory,
  getFavorites,
  getRecentCalculators,
  recordRecentCalculator,
  removeCalculationHistoryItem,
  saveFavorites,
  saveTheme,
  type CalculationHistoryItem,
} from './utils/storage';

function resolveRouteFromPath(pathname: string): AppRoute {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname === '/privacy') return 'privacy';
  if (pathname === '/terms') return 'terms';
  return 'not-found';
}

function pathForRoute(route: AppRoute): string {
  if (route === 'privacy') return '/privacy';
  if (route === 'terms') return '/terms';
  return '/';
}

function sectionForCalculator(id: CalculatorId): MainNavSection {
  if (id === 'simple-interest' || id === 'compound-interest') return 'interest';
  if (id === 'loan-emi') return 'loan-emi';
  return 'income-tax';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window === 'undefined' ? 'home' : resolveRouteFromPath(window.location.pathname)
  );
  const [activeCalc, setActiveCalc] = useState<CalculatorId>('simple-interest');
  const [lastInterestCalc, setLastInterestCalc] = useState<
    'simple-interest' | 'compound-interest'
  >('simple-interest');
  const [favorites, setFavorites] = useState<CalculatorId[]>(() => getFavorites());
  const [recentIds, setRecentIds] = useState<CalculatorId[]>(() => getRecentCalculators());
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() =>
    getCalculationHistory()
  );

  const activeNavSection = sectionForCalculator(activeCalc);

  // Sync browser back/forward history navigation
  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Ensure Obsidian Luxury dark root class remains locked
  useEffect(() => {
    saveTheme('dark');
  }, []);

  const handleNavigateRoute = (nextRoute: AppRoute) => {
    const targetPath = pathForRoute(nextRoute);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (route !== 'home') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      setRoute('home');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCalculator = (id: CalculatorId) => {
    if (id === 'simple-interest' || id === 'compound-interest') {
      setLastInterestCalc(id);
    }
    setActiveCalc(id);
    setRecentIds(recordRecentCalculator(id));
  };

  const handleSelectNavSection = (section: MainNavSection) => {
    const targetCalc: CalculatorId =
      section === 'interest'
        ? lastInterestCalc
        : section === 'loan-emi'
        ? 'loan-emi'
        : 'income-tax';
    handleSelectCalculator(targetCalc);
    handleNavigateSection('calculators');
  };

  const handleOpenCalculator = (id: CalculatorId) => {
    handleSelectCalculator(id);
    handleNavigateSection('calculators');
  };

  const handleToggleFavorite = (id: CalculatorId) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const handleSaveHistory = (
    entry: Omit<CalculationHistoryItem, 'id' | 'timestamp'>
  ) => {
    setHistory(appendCalculationHistory(entry));
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(removeCalculationHistoryItem(id));
  };

  const handleClearHistory = () => {
    setHistory(clearCalculationHistory());
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-[#080D1B] text-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
        <InteractiveBackground />
        <LuxuryLoader />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-gradient-to-r focus:from-[#2563EB] focus:to-[#8B5CF6] focus:px-3 py-2 focus:text-xs focus:font-semibold focus:text-[#F8FAFC]"
        >
          Skip to content
        </a>

        <Header
          activeNavSection={activeNavSection}
          onSelectNavSection={handleSelectNavSection}
          onGoHome={() => handleNavigateRoute('home')}
        />

        <main id="main-content" className="relative z-10 flex-1">
          {route === 'home' ? (
            <>
              <HeroSection
                activeCalc={activeCalc}
                favorites={favorites}
                recentIds={recentIds}
                onToggleFavorite={handleToggleFavorite}
                onExploreCalculators={() => handleNavigateSection('calculators')}
                onOpenCalculator={handleOpenCalculator}
              />
              <CalculatorWorkspace
                activeNavSection={activeNavSection}
                activeCalc={activeCalc}
                onSelectCalc={handleSelectCalculator}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSaveHistory={handleSaveHistory}
              />
              <HistoryPanel
                history={history}
                onOpenCalculator={handleOpenCalculator}
                onRemoveItem={handleRemoveHistoryItem}
                onClearHistory={handleClearHistory}
              />
            </>
          ) : (
            <LegalView mode={route} onBackHome={() => handleNavigateRoute('home')} />
          )}
        </main>

        <Footer
          onNavigateRoute={handleNavigateRoute}
          onNavigateSection={handleNavigateSection}
        />
        <MobileBottomNav
          activeNavSection={activeNavSection}
          onSelectNavSection={handleSelectNavSection}
        />
        <OfflineIndicator />
      </div>
    </MotionConfig>
  );
}
