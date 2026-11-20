import { useEffect, useRef } from 'react';
import {
  ArrowsLeftRight,
  Bank,
  MagnifyingGlass,
  Percent,
  Scales,
  TrendUp,
  X,
} from '@phosphor-icons/react';
import { CALCULATORS, CalculatorId } from './Header';

const CALC_ICONS: Record<CalculatorId, typeof Percent> = {
  'simple-interest': Percent,
  'compound-interest': TrendUp,
  'loan-emi': Bank,
  'percentage-rupee': ArrowsLeftRight,
  'income-tax': Scales,
};

interface CategoryGridProps {
  activeCalc: CalculatorId;
  onSelectCalc: (id: CalculatorId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function CategoryGrid({
  activeCalc,
  onSelectCalc,
  searchQuery,
  onSearchChange,
}: CategoryGridProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? CALCULATORS.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
      )
    : CALCULATORS;

  return (
    <section aria-label="Calculator directory" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="caption-4 gold-accent">
            Indian Financial &amp; CA Study Suite
          </span>
          <h1 className="heading-3 mt-1 text-primary">
            Interactive Calculator Workspace
          </h1>
        </div>

        {/* Live Calculator Search with Ctrl/Cmd+K shortcut */}
        <div className="relative w-full sm:w-88">
          <MagnifyingGlass
            size={16}
            weight="regular"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search calculators (EMI, 87A, ₹ ratio)..."
            aria-label="Search calculators"
            className="min-h-[44px] w-full rounded-lg border border-border-subtle bg-bg-card pr-16 pl-10 text-xs text-primary placeholder:text-muted transition-colors hover:border-border-default focus:border-accent-gold focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear calculator search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-secondary hover:text-primary"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 font-mono-num text-xs text-muted sm:inline-block">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* Responsive Category Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-card px-5 py-4 text-xs text-secondary">
          <span>No calculators match &ldquo;{searchQuery}&rdquo;.</span>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="font-medium gold-accent hover:underline"
          >
            Show all calculators
          </button>
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
          {filtered.map((calc) => {
            const isActive = activeCalc === calc.id;
            const Icon = CALC_ICONS[calc.id];
            return (
              <button
                key={calc.id}
                type="button"
                onClick={() => onSelectCalc(calc.id)}
                className={`group flex min-w-[235px] snap-start flex-col justify-between rounded-xl border p-4 text-left transition-colors sm:min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold ${
                  isActive
                    ? 'border-accent-gold bg-bg-raised'
                    : 'card card-hover'
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-accent-gold bg-bg-card gold-accent'
                          : 'border-border-subtle bg-bg-raised text-secondary group-hover:text-accent-gold'
                      }`}
                    >
                      <Icon size={16} weight="regular" aria-hidden="true" />
                    </span>
                    <span
                      className={`caption-4 ${
                        isActive ? 'gold-accent' : 'text-muted'
                      }`}
                    >
                      {isActive ? 'Active' : calc.categoryLabel.split(' · ')[0]}
                    </span>
                  </div>

                  <h2 className="title-4 text-primary group-hover:text-accent-gold-hover">
                    {calc.title}
                  </h2>
                  <p className="caption-5 mt-1.5 text-secondary">
                    {calc.summary}
                  </p>
                </div>

                <div className="font-mono-num caption-5 mt-3 border-t border-border-subtle pt-2.5 text-muted truncate">
                  {calc.formulaHint}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
