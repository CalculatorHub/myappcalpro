import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowLeft, BookOpen } from '@phosphor-icons/react';
import { FinancialYearKey } from './data/taxRules';
import { CALCULATORS, CalculatorId } from './components/Header';
import { CategoryGrid } from './components/CategoryGrid';
import { SimpleInterestCalc } from './components/calculators/SimpleInterestCalc';
import { CompoundInterestCalc } from './components/calculators/CompoundInterestCalc';
import { LoanEmiCalc } from './components/calculators/LoanEmiCalc';
import { PercentageRupeeCalc } from './components/calculators/PercentageRupeeCalc';
import { IncomeTaxCalc } from './components/calculators/IncomeTaxCalc';
import { TaxReferenceModal } from './components/TaxReferenceModal';
import { Footer } from './components/Footer';
import { AppRoute, FloatingNav } from './components/landing/FloatingNav';
import { LandingPage } from './components/landing/LandingPage';
import { CookieNotice, LegalOrFallbackView } from './components/landing/LegalAndFallback';
import { downloadCAFormulaKit } from './utils/formulaKit';

function resolveRouteFromPath(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return 'landing';
  if (clean === '/calculators') return 'calculators';
  if (clean === '/privacy') return 'privacy';
  if (clean === '/terms') return 'terms';
  return 'not-found';
}

const ROUTE_PATHS: Record<Exclude<AppRoute, 'not-found'>, string> = {
  landing: '/',
  calculators: '/calculators',
  privacy: '/privacy',
  terms: '/terms',
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? resolveRouteFromPath(window.location.pathname) : 'landing'
  );
  const [activeCalc, setActiveCalc] = useState<CalculatorId>('income-tax');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFY, setSelectedFY] = useState<FinancialYearKey>('FY2026-27');
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [cookieVisible, setCookieVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fincalc_cookie_ack') !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextRoute: AppRoute, sectionId?: string) => {
    setRoute(nextRoute);
    if (nextRoute !== 'not-found') {
      const targetPath = ROUTE_PATHS[nextRoute];
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }

    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenCalculator = (id: CalculatorId) => {
    setActiveCalc(id);
    navigate('calculators');
  };

  const handleDownloadKit = () => {
    downloadCAFormulaKit();
    setDownloadStatus(
      'CA formula kit downloaded. Open FinCalc-Pro-CA-Formula-Kit.txt from your downloads folder.'
    );
  };

  const handleAcceptCookie = () => {
    setCookieVisible(false);
    try {
      localStorage.setItem('fincalc_cookie_ack', '1');
    } catch {
      // ignore storage errors
    }
  };

  const activeMeta = CALCULATORS.find((c) => c.id === activeCalc) ?? CALCULATORS[0];

  return (
    <MotionConfig reducedMotion="user">
      <div
        id="top"
        className="flex min-h-screen flex-col overflow-x-clip bg-bg-main text-primary"
      >
        {/* Keyboard Skip to Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent-gold focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg-main"
        >
          Skip to content
        </a>

        <FloatingNav
          currentRoute={route}
          onNavigate={navigate}
          onDownloadKit={handleDownloadKit}
          onOpenCalculators={() => navigate('calculators')}
        />

        <main id="main-content" className="flex-1">
          {route === 'landing' && (
            <LandingPage
              onDownloadKit={handleDownloadKit}
              downloadStatus={downloadStatus}
              onOpenCalculator={handleOpenCalculator}
              onOpenFormulaGuide={() => setReferenceOpen(true)}
            />
          )}

          {route === 'calculators' && (
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-20 pb-12 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate('landing')}
                  className="button-sm inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-raised px-3 py-1.5 text-secondary transition-colors hover:border-border-default hover:text-primary"
                >
                  <ArrowLeft size={16} weight="bold" aria-hidden="true" />
                  <span>Back to overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReferenceOpen(true)}
                  className="button-sm inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-raised px-3 py-1.5 text-accent-gold transition-colors hover:border-accent-gold"
                >
                  <BookOpen size={16} weight="regular" aria-hidden="true" />
                  <span>Formula guide</span>
                </button>
              </div>

              <CategoryGrid
                activeCalc={activeCalc}
                onSelectCalc={setActiveCalc}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <section
                aria-label={`${activeMeta.title} workspace`}
                className="space-y-6 border-t border-border-subtle pt-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="caption-4 gold-accent">
                      {activeMeta.categoryLabel}
                    </span>
                    <h2 className="heading-4 mt-1 text-primary">{activeMeta.title}</h2>
                  </div>
                  <p className="caption-2 text-secondary">{activeMeta.summary}</p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCalc}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {activeCalc === 'simple-interest' && <SimpleInterestCalc />}
                    {activeCalc === 'compound-interest' && <CompoundInterestCalc />}
                    {activeCalc === 'loan-emi' && <LoanEmiCalc />}
                    {activeCalc === 'percentage-rupee' && <PercentageRupeeCalc />}
                    {activeCalc === 'income-tax' && (
                      <IncomeTaxCalc selectedFY={selectedFY} onChangeFY={setSelectedFY} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          )}

          {(route === 'privacy' || route === 'terms' || route === 'not-found') && (
            <LegalOrFallbackView
              route={route}
              onBackHome={() => navigate('landing')}
              onNavigate={navigate}
            />
          )}
        </main>

        <Footer selectedFY={selectedFY} onNavigate={navigate} />

        <TaxReferenceModal
          open={referenceOpen}
          onClose={() => setReferenceOpen(false)}
          selectedFY={selectedFY}
        />

        <CookieNotice
          visible={cookieVisible}
          onAccept={handleAcceptCookie}
          onOpenPrivacy={() => navigate('privacy')}
        />
      </div>
    </MotionConfig>
  );
}
