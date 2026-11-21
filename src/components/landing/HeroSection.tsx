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
import { GoldCrestMark } from '../ui/GoldCrestMark';
import { TiltCard3D } from '../ui/TiltCard3D';

const HeroGoldScene = lazy(() => import('../three/HeroGoldScene'));

interface HeroSectionProps {
  activeCalc: CalculatorId;
  favorites: CalculatorId[];
  recentIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  onExploreCalculators: () => void;
  onOpenCalculator: (id: CalculatorId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeCalc,
  favorites,
  recentIds,
  onToggleFavorite,
  onExploreCalculators,
  onOpenCalculator,
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
      className="luxury-hero-backdrop scroll-mt-24 border-b border-[#D4AF37]/20"
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 space-y-10">
        {/* Top Hero Row: Cinematic Typography + Interactive 3D Metallic Gold Emblem */}
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 lg:col-span-7"
          >
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#D4AF37]">
              Indian Finance &amp; CA Study Suite
            </p>

            <h1 className="heading-1 text-white max-w-[660px]">
              Indian finance and tax calculators,{' '}
              <span className="gold-text-gradient">with every step explained.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#A1A1AA] max-w-[580px]">
              Practical calculators for finance, taxation and CA studies, with clear
              step-by-step solutions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreCalculators}
                className="gold-shimmer-btn inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5D76E]"
              >
                <span>Explore calculators</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <span className="text-xs text-[#A1A1AA]">
                Free to use · Runs locally in your browser · No signup required
              </span>
            </div>
          </motion.div>

          {/* 3D WebGL Metallic Emblem Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/25 bg-[#08080A] shadow-[0_24px_60px_-24px_rgba(212,175,55,0.22)]">
              {/* Subtle radial gold aura behind WebGL canvas (zero backdrop-blur overlap) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(212,175,55,0.18),transparent_68%)]"
              />
              <Suspense
                fallback={
                  <div className="flex h-[260px] sm:h-[310px] lg:h-[340px] w-full items-center justify-center">
                    <GoldCrestMark size={112} />
                  </div>
                }
              >
                <HeroGoldScene />
              </Suspense>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Controls: Global Search + Category Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="luxury-input flex items-center gap-2.5 px-3.5 py-2.5 w-full lg:max-w-md">
              <Search className="h-4 w-4 text-[#D4AF37] shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators, 87A, EMI, compound..."
                aria-label="Search financial calculators"
                className="w-full bg-transparent text-sm text-white placeholder:text-[#A1A1AA]/70 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="text-[#A1A1AA] hover:text-[#F5D76E] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block rounded-lg border border-[#D4AF37]/30 bg-[#111111] px-1.5 py-0.5 font-mono text-[10px] text-[#F5D76E]">
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
                        ? 'gold-shimmer-btn font-semibold'
                        : 'border border-[#D4AF37]/20 bg-[#111111]/90 font-medium text-[#A1A1AA] hover:border-[#D4AF37]/50 hover:text-[#F5D76E]'
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA] pt-1">
              {favoriteCards.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#F5D76E]">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    Pinned:
                  </span>
                  {favoriteCards.map((c) => (
                    <button
                      key={`fav-${c.id}`}
                      type="button"
                      onClick={() => onOpenCalculator(c.id)}
                      className="rounded-lg border border-[#D4AF37]/25 bg-[#111111] px-2.5 py-1 font-medium text-white hover:border-[#F5D76E] hover:text-[#F5D76E] transition-colors cursor-pointer"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}

              {recentCards.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    <Clock className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                    Recent:
                  </span>
                  {recentCards.map((c) => (
                    <button
                      key={`rec-${c.id}`}
                      type="button"
                      onClick={() => onOpenCalculator(c.id)}
                      className="rounded-lg border border-[#D4AF37]/20 bg-[#111111] px-2.5 py-1 font-medium text-[#A1A1AA] hover:border-[#D4AF37]/60 hover:text-[#F5D76E] transition-colors cursor-pointer"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculator Directory Cards with 3D Tilt & Metallic Gold Highlights */}
          {filteredCards.length === 0 ? (
            <div className="luxury-card p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-white">
                No calculators match your current filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="gold-shimmer-btn rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Reset search &amp; filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              {filteredCards.map((card, idx) => {
                const Icon = card.icon;
                const isSelected = activeCalc === card.id;
                const isFav = favorites.includes(card.id);
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
                        isSelected ? 'luxury-card-accent' : 'luxury-card'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenCalculator(card.id)}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#F5D76E] to-[#D4AF37] text-[#050505] shadow-[0_6px_16px_-4px_rgba(212,175,55,0.55)]'
                                : 'border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F5D76E] group-hover:border-[#D4AF37]/55'
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
                                ? 'text-[#F5D76E] bg-[#D4AF37]/15'
                                : 'text-[#A1A1AA] hover:text-[#F5D76E] hover:bg-white/5'
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
                          className="mt-3.5 block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37] rounded-lg"
                        >
                          <p className="font-mono text-[11px] text-[#A1A1AA]">
                            {card.categoryLabel} · {card.formulaTag}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-white group-hover:text-[#F5D76E] transition-colors">
                            {card.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#A1A1AA]">
                            {card.shortDesc}
                          </p>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenCalculator(card.id)}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#F5D76E] hover:text-white transition-colors cursor-pointer"
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
        </div>
      </div>
    </section>
  );
};
