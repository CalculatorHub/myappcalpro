import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Clock,
  Search,
  Star,
  X,
} from 'lucide-react';
import {
  CALCULATOR_CARDS,
  CATEGORY_TABS,
  type CalculatorCategory,
  type CalculatorId,
} from '../../data/calculatorCatalog';
import { SUITE_MODULE_ITEMS } from '../suite/SuiteWorkspace';
import type { SuiteModuleId } from '../suite/InsightsDashboardModule';
import { GoldCrestMark } from '../ui/GoldCrestMark';
import { TiltCard3D } from '../ui/TiltCard3D';

const HeroGoldScene = lazy(() =>
  import('../three/HeroGoldScene').catch(() =>
    new Promise<{ default: React.ComponentType }>((resolve) => {
      window.setTimeout(() => {
        import('../three/HeroGoldScene')
          .then(resolve)
          .catch(() =>
            resolve({
              default: () => (
                <div className="flex h-[260px] sm:h-[310px] lg:h-[340px] w-full items-center justify-center">
                  <GoldCrestMark size={112} />
                </div>
              ),
            })
          );
      }, 250);
    })
  )
);

class HeroSceneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const CARD_ICON_GRADIENTS: Record<CalculatorId, { active: string; idle: string }> = {
  'simple-interest': {
    active: 'from-[#2563EB] via-[#6366F1] to-[#8B5CF6] shadow-[0_6px_18px_-4px_rgba(99,102,241,0.65)]',
    idle: 'border-[#6366F1]/35 bg-[#6366F1]/12 text-[#818CF8] group-hover:border-[#06B6D4]/60',
  },
  'compound-interest': {
    active: 'from-[#8B5CF6] via-[#A855F7] to-[#D946EF] shadow-[0_6px_18px_-4px_rgba(168,85,247,0.65)]',
    idle: 'border-[#A855F7]/35 bg-[#A855F7]/12 text-[#C084FC] group-hover:border-[#D946EF]/60',
  },
  'loan-emi': {
    active: 'from-[#06B6D4] via-[#2563EB] to-[#6366F1] shadow-[0_6px_18px_-4px_rgba(6,182,212,0.65)]',
    idle: 'border-[#06B6D4]/35 bg-[#06B6D4]/12 text-[#38BDF8] group-hover:border-[#06B6D4]/65',
  },
  'income-tax': {
    active: 'from-[#10B981] via-[#06B6D4] to-[#2563EB] shadow-[0_6px_18px_-4px_rgba(16,185,129,0.6)]',
    idle: 'border-[#10B981]/35 bg-[#10B981]/12 text-[#34D399] group-hover:border-[#06B6D4]/65',
  },
};

interface HeroSectionProps {
  activeCalc: CalculatorId;
  activeSuiteModule: SuiteModuleId;
  favorites: CalculatorId[];
  recentIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  onExploreCalculators: () => void;
  onExploreSuite: () => void;
  onOpenCalculator: (id: CalculatorId) => void;
  onOpenSuiteModule: (id: SuiteModuleId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeCalc,
  activeSuiteModule,
  favorites,
  recentIds,
  onToggleFavorite,
  onExploreCalculators,
  onExploreSuite,
  onOpenCalculator,
  onOpenSuiteModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory>('all');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const filteredSuiteModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SUITE_MODULE_ITEMS.filter(
      (mod) =>
        mod.title.toLowerCase().includes(q) ||
        mod.shortLabel.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CALCULATOR_CARDS.filter((card) => {
      const categoryOk = selectedCategory === 'all' || card.category === selectedCategory;
      if (!categoryOk) return false;
      if (!q) return true;
      return (
        card.title.toLowerCase().includes(q) ||
        card.shortDesc.toLowerCase().includes(q) ||
        card.formulaTag.toLowerCase().includes(q) ||
        card.categoryLabel.toLowerCase().includes(q) ||
        card.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const favoriteCards = useMemo(
    () =>
      favorites
        .map((id) => CALCULATOR_CARDS.find((c) => c.id === id))
        .filter((c): c is (typeof CALCULATOR_CARDS)[number] => Boolean(c)),
    [favorites]
  );

  const recentCards = useMemo(
    () =>
      recentIds
        .map((id) => CALCULATOR_CARDS.find((c) => c.id === id))
        .filter((c): c is (typeof CALCULATOR_CARDS)[number] => Boolean(c))
        .slice(0, 3),
    [recentIds]
  );

  return (
    <section
      id="overview"
      className="aurora-hero-backdrop scroll-mt-24 border-b border-[#6366F1]/25"
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 space-y-10">
        {/* Top Hero Row: Aurora Typography + Interactive 3D Emblem */}
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 lg:col-span-7"
          >
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#38BDF8]">
              Indian Finance &amp; CA Study Suite
            </p>

            <h1 className="heading-1 text-[#F8FAFC] max-w-[660px]">
              Indian finance and tax calculators,{' '}
              <span className="aurora-text-gradient">with every step explained.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#94A3B8] max-w-[580px]">
              Practical calculators for finance, taxation and CA studies, with clear
              step-by-step solutions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreCalculators}
                className="aurora-btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06B6D4]"
              >
                <span>Explore calculators</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreSuite}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#6366F1]/40 bg-[#0B1020]/90 px-5 py-3.5 text-sm font-semibold text-[#F8FAFC] hover:border-[#06B6D4] hover:text-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Financial Suite (10 Modules)</span>
              </button>

              <span className="text-xs text-[#94A3B8]">
                Free to use · SQLite persistent wealth vault · Instant calculations
              </span>
            </div>
          </motion.div>

          {/* 3D WebGL Aurora Emblem Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#6366F1]/35 bg-[#0B1020]/85 shadow-[0_24px_60px_-24px_rgba(99,102,241,0.4)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(6,182,212,0.18),rgba(139,92,246,0.12)_48%,transparent_72%)]"
              />
              <HeroSceneErrorBoundary
                fallback={
                  <div className="flex h-[260px] sm:h-[310px] lg:h-[340px] w-full items-center justify-center">
                    <GoldCrestMark size={112} />
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="flex h-[260px] sm:h-[310px] lg:h-[340px] w-full items-center justify-center">
                      <GoldCrestMark size={112} />
                    </div>
                  }
                >
                  <HeroGoldScene />
                </Suspense>
              </HeroSceneErrorBoundary>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Controls: Global Search + Category Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="aurora-input flex items-center gap-2.5 px-3.5 py-2.5 w-full lg:max-w-md">
              <Search className="h-4 w-4 text-[#06B6D4] shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators, 87A, EMI, compound..."
                aria-label="Search financial calculators"
                className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/70 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="text-[#94A3B8] hover:text-[#38BDF8] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block rounded-lg border border-[#6366F1]/35 bg-[#080D1B] px-1.5 py-0.5 font-mono text-[10px] text-[#38BDF8]">
                  ⌘K
                </kbd>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter calculators by category"
              className="flex flex-wrap gap-1.5"
            >
              {CATEGORY_TABS.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'aurora-btn-primary font-semibold'
                        : 'border border-[#6366F1]/25 bg-[#0B1020]/90 font-medium text-[#94A3B8] hover:border-[#06B6D4]/55 hover:text-[#38BDF8]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorites & Recently Used Quick Strip */}
          {(favoriteCards.length > 0 || recentCards.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#94A3B8] pt-1">
              {favoriteCards.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#38BDF8]">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    Pinned:
                  </span>
                  {favoriteCards.map((c) => (
                    <button
                      key={`fav-${c.id}`}
                      type="button"
                      onClick={() => onOpenCalculator(c.id)}
                      className="rounded-lg border border-[#6366F1]/30 bg-[#0B1020] px-2.5 py-1 font-medium text-[#F8FAFC] hover:border-[#06B6D4] hover:text-[#38BDF8] transition-colors cursor-pointer"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}

              {recentCards.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#F8FAFC]">
                    <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" aria-hidden="true" />
                    Recent:
                  </span>
                  {recentCards.map((c) => (
                    <button
                      key={`rec-${c.id}`}
                      type="button"
                      onClick={() => onOpenCalculator(c.id)}
                      className="rounded-lg border border-[#6366F1]/25 bg-[#0B1020] px-2.5 py-1 font-medium text-[#94A3B8] hover:border-[#8B5CF6]/60 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculator Directory Cards (Shown once; Suite search hits appear inline when searching) */}
          {filteredCards.length === 0 && filteredSuiteModules.length === 0 ? (
            <div className="aurora-card p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#F8FAFC]">
                No calculators or planning tools match your current filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="aurora-btn-primary rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Reset search &amp; filters
              </button>
            </div>
          ) : (
            <>
              {filteredCards.length > 0 && (
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
                  {filteredCards.map((card, idx) => {
                    const Icon = card.icon;
                    const isSelected = activeCalc === card.id;
                    const isFav = favorites.includes(card.id);
                    const iconTone = CARD_ICON_GRADIENTS[card.id];
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.04 * idx,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <TiltCard3D
                          className={`group h-full p-4 text-left ${
                            isSelected ? 'aurora-card-accent' : 'aurora-card'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => onOpenCalculator(card.id)}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                                  isSelected
                                    ? `bg-gradient-to-br ${iconTone.active} text-[#F8FAFC]`
                                    : `border ${iconTone.idle}`
                                }`}
                                aria-label={`Open ${card.title}`}
                              >
                                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onToggleFavorite(card.id)}
                                aria-label={
                                  isFav
                                    ? `Unpin ${card.title} from favorites`
                                    : `Pin ${card.title} to favorites`
                                }
                                aria-pressed={isFav}
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                                  isFav
                                    ? 'text-[#38BDF8] bg-[#06B6D4]/15'
                                    : 'text-[#94A3B8] hover:text-[#38BDF8] hover:bg-white/5'
                                }`}
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenCalculator(card.id)}
                              className="mt-3.5 block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4] rounded-lg"
                            >
                              <p className="font-mono text-[11px] text-[#94A3B8]">
                                {card.categoryLabel} · {card.formulaTag}
                              </p>
                              <h3 className="mt-1 text-sm font-semibold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                                {card.title}
                              </h3>
                              <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">
                                {card.shortDesc}
                              </p>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenCalculator(card.id)}
                            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#38BDF8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                          >
                            <span>Open calculator</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </button>
                        </TiltCard3D>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Filtered Suite Matches (shown only during active search to avoid duplicating SuiteWorkspace grid) */}
              {isSearching && filteredSuiteModules.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#38BDF8]">
                    Matching Financial Suite Modules
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {filteredSuiteModules.map((mod) => {
                      const Icon = mod.icon;
                      const active = activeSuiteModule === mod.id;
                      return (
                        <button
                          key={`hero-suite-${mod.id}`}
                          type="button"
                          onClick={() => onOpenSuiteModule(mod.id)}
                          className={`group flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all cursor-pointer min-w-0 ${
                            active
                              ? 'border-[#06B6D4]/65 bg-gradient-to-br from-[#2563EB]/20 via-[#6366F1]/20 to-[#A855F7]/15'
                              : 'border-[#6366F1]/25 bg-[#0B1020]/80 hover:border-[#06B6D4]/55 hover:bg-[#0F172A]'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mod.accentGradient} text-[#F8FAFC] shadow-[0_4px_12px_-4px_rgba(99,102,241,0.5)]`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#38BDF8] transition-colors">
                              {mod.shortLabel}
                            </p>
                            <p className="text-[10px] text-[#94A3B8] truncate">{mod.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
