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
          <p className="caption-1 text-[#D4AF37]">
            Indian Financial &amp; CA Study Suite
          </p>
          <h1 className="heading-3 mt-1 text-white">
            Interactive Calculator Workspace
          </h1>
        </div>

        {/* Live Calculator Search with Ctrl/Cmd+K shortcut */}
        <div className="relative w-full sm:w-88">
          <MagnifyingGlass
            size={16}
            weight="regular"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search calculators (EMI, 87A, ₹ ratio)..."
            aria-label="Search calculators"
            className="min-h-[44px] w-full rounded-lg border border-[#272727] bg-[#181818] pr-16 pl-10 text-xs text-white placeholder:text-zinc-500 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#313131] focus:border-[#D4AF37] focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear calculator search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-white"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 font-mono-num text-xs text-zinc-500 sm:inline-block">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* Responsive Category Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#272727] bg-[#181818] px-5 py-4 text-xs text-zinc-400">
          <span>No calculators match &ldquo;{searchQuery}&rdquo;.</span>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="font-medium text-[#E5C158] hover:underline"
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
                className={`group flex min-w-[235px] snap-start flex-col justify-between rounded-xl border p-4 text-left transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#131209]'
                    : 'border-[#272727] bg-[#181818] hover:border-[#313131] hover:bg-[#1F1F1F]'
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-[#D4AF37] bg-[#181818] text-[#D4AF37]'
                          : 'border-[#313131] bg-[#1F1F1F] text-zinc-400 group-hover:text-[#D4AF37]'
                      }`}
                    >
                      <Icon size={16} weight="regular" aria-hidden="true" />
                    </span>
                    <span
                      className={`caption-4 ${
                        isActive ? 'text-[#D4AF37]' : 'text-zinc-500'
                      }`}
                    >
                      {isActive ? 'Active' : calc.categoryLabel.split(' · ')[0]}
                    </span>
                  </div>

                  <h2 className="title-4 text-white group-hover:text-[#E5C158]">
                    {calc.title}
                  </h2>
                  <p className="caption-5 mt-1.5 text-zinc-400">
                    {calc.summary}
                  </p>
                </div>

                <div className="font-mono-num caption-5 mt-3 border-t border-[#272727] pt-2.5 text-zinc-500 truncate">
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
