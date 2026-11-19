import { useState } from 'react';
import { CompoundGrowthRow } from '../../logic/compoundInterest';
import { YearlyAmortizationSummary } from '../../logic/loanEmi';
import { SlabBreakdownRow } from '../../logic/incomeTax';
import { formatINR, formatINRCompact, formatPercent } from '../../utils/formatters';

interface CompoundChartProps {
  principal: number;
  rows: CompoundGrowthRow[];
}

export function CompoundGrowthChart({ principal, rows }: CompoundChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  if (rows.length === 0) return null;

  const maxBalance = Math.max(...rows.map((r) => r.closingBalance), principal, 1);
  const width = 640;
  const height = 260;
  const padLeft = 64;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const displayRows = rows.length > 30 ? rows.filter((_, i) => i % Math.ceil(rows.length / 25) === 0 || i === rows.length - 1) : rows;
  const step = plotW / displayRows.length;
  const barW = Math.max(8, Math.min(34, step * 0.62));

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const activeRow = hoveredIdx !== null ? displayRows[hoveredIdx] : null;

  return (
    <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-sm font-semibold text-white">
            Year-by-Year Compounding Growth
          </h4>
          <p className="text-xs text-zinc-400">
            Principal base vs. cumulative interest earned over tenure
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-zinc-600" />
            <span>Principal</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#D4AF37]" />
            <span>Cumulative Interest</span>
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Compound interest year-by-year growth stacked bar chart"
        >
          {yTicks.map((t) => {
            const val = maxBalance * t;
            const y = padTop + plotH - t * plotH;
            const compact = formatINRCompact(val) ?? formatINR(val, 0);
            return (
              <g key={t}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {compact.replace(' Crore', 'Cr').replace(' Lakh', 'L')}
                </text>
              </g>
            );
          })}

          {displayRows.map((row, idx) => {
            const totalH = (row.closingBalance / maxBalance) * plotH;
            const principalH = (row.principalShare / maxBalance) * plotH;
            const interestH = Math.max(0, totalH - principalH);
            const x = padLeft + idx * step + (step - barW) / 2;
            const principalY = padTop + plotH - principalH;
            const interestY = padTop + plotH - totalH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={row.periodLabel}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={principalY}
                  width={barW}
                  height={principalH}
                  rx={2}
                  fill={isHovered ? '#71717A' : '#52525B'}
                />
                <rect
                  x={x}
                  y={interestY}
                  width={barW}
                  height={interestH}
                  rx={2}
                  fill={isHovered ? '#F0CE66' : '#D4AF37'}
                />
                {(displayRows.length <= 12 || idx % Math.ceil(displayRows.length / 8) === 0 || idx === displayRows.length - 1) && (
                  <text
                    x={x + barW / 2}
                    y={height - 14}
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    Y{row.yearNumber}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {activeRow && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#16161D] px-3.5 py-2 text-xs">
            <span className="font-semibold text-[#E5C158]">{activeRow.periodLabel}</span>
            <div className="font-mono-num flex flex-wrap items-center gap-4 text-zinc-200">
              <span>Closing: {formatINR(activeRow.closingBalance)}</span>
              <span>Interest (Yr): {formatINR(activeRow.interestEarned)}</span>
              <span>Cum. Interest: {formatINR(activeRow.cumulativeInterest)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LoanChartProps {
  principal: number;
  totalInterest: number;
  principalPercent: number;
  interestPercent: number;
  yearlySummary: YearlyAmortizationSummary[];
}

export function LoanBreakdownChart({
  principal,
  totalInterest,
  principalPercent,
  interestPercent,
  yearlySummary,
}: LoanChartProps) {
  const [hoveredYr, setHoveredYr] = useState<number | null>(null);
  const total = principal + totalInterest;
  if (total <= 0) return null;

  // Donut math
  const radius = 52;
  const strokeW = 18;
  const circumference = 2 * Math.PI * radius;
  const principalDash = (principal / total) * circumference;
  const interestDash = circumference - principalDash;

  // Yearly bar chart math
  const width = 460;
  const height = 220;
  const padLeft = 56;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxAnnualOutflow = Math.max(
    ...yearlySummary.map((y) => y.principalPaid + y.interestPaid),
    1
  );
  const step = plotW / Math.max(1, yearlySummary.length);
  const barW = Math.max(6, Math.min(26, step * 0.65));

  const activeYear = hoveredYr !== null ? yearlySummary[hoveredYr] : null;

  return (
    <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-sm font-semibold text-white">
            Principal vs. Interest Breakdown
          </h4>
          <p className="text-xs text-zinc-400">
            Total repayment split and year-wise amortization composition
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#D4AF37]" />
            <span>Principal ({formatPercent(principalPercent, 1)})</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-zinc-500" />
            <span>Interest ({formatPercent(interestPercent, 1)})</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        {/* Donut chart */}
        <div className="flex flex-col items-center justify-center md:col-span-5">
          <svg
            viewBox="0 0 150 150"
            className="h-40 w-40"
            role="img"
            aria-label="Donut chart of Principal versus Interest"
          >
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#52525B"
              strokeWidth={strokeW}
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#D4AF37"
              strokeWidth={strokeW}
              strokeDasharray={`${principalDash} ${interestDash}`}
              strokeLinecap="butt"
              transform="rotate(-90 75 75)"
            />
            <text
              x="75"
              y="71"
              textAnchor="middle"
              fill="#A1A1AA"
              fontSize="10"
            >
              Principal Share
            </text>
            <text
              x="75"
              y="88"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatPercent(principalPercent, 1)}
            </text>
          </svg>
          <div className="mt-2 grid w-full grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg border border-white/[0.06] bg-[#16161D] p-2">
              <div className="text-zinc-400">Principal</div>
              <div className="font-mono-num mt-0.5 font-semibold text-[#E5C158]">
                {formatINRCompact(principal) ?? formatINR(principal, 0)}
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-[#16161D] p-2">
              <div className="text-zinc-400">Total Interest</div>
              <div className="font-mono-num mt-0.5 font-semibold text-zinc-200">
                {formatINRCompact(totalInterest) ?? formatINR(totalInterest, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Amortization Stacked Bars */}
        <div className="md:col-span-7">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label="Annual principal versus interest repayment bar chart"
          >
            {[0, 0.5, 1].map((t) => {
              const val = maxAnnualOutflow * t;
              const y = padTop + plotH - t * plotH;
              return (
                <g key={t}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 4}
                    textAnchor="end"
                    fill="#9CA3AF"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {(formatINRCompact(val) ?? formatINR(val, 0))
                      .replace(' Crore', 'Cr')
                      .replace(' Lakh', 'L')}
                  </text>
                </g>
              );
            })}

            {yearlySummary.map((item, idx) => {
              const pH = (item.principalPaid / maxAnnualOutflow) * plotH;
              const iH = (item.interestPaid / maxAnnualOutflow) * plotH;
              const x = padLeft + idx * step + (step - barW) / 2;
              const pY = padTop + plotH - pH;
              const iY = pY - iH;
              const isHov = hoveredYr === idx;

              return (
                <g
                  key={item.year}
                  onMouseEnter={() => setHoveredYr(idx)}
                  onMouseLeave={() => setHoveredYr(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x}
                    y={pY}
                    width={barW}
                    height={pH}
                    rx={1.5}
                    fill={isHov ? '#F0CE66' : '#D4AF37'}
                  />
                  <rect
                    x={x}
                    y={iY}
                    width={barW}
                    height={iH}
                    rx={1.5}
                    fill={isHov ? '#A1A1AA' : '#52525B'}
                  />
                  {(yearlySummary.length <= 10 ||
                    idx % Math.ceil(yearlySummary.length / 8) === 0 ||
                    idx === yearlySummary.length - 1) && (
                    <text
                      x={x + barW / 2}
                      y={height - 10}
                      textAnchor="middle"
                      fill="#9CA3AF"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      Y{item.year}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {activeYear && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#D4AF37]/30 bg-[#16161D] px-3 py-1.5 text-xs">
              <span className="font-semibold text-[#E5C158]">Year {activeYear.year}</span>
              <span className="font-mono-num text-zinc-200">
                Principal: {formatINR(activeYear.principalPaid, 0)} · Interest:{' '}
                {formatINR(activeYear.interestPaid, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaxSlabChartProps {
  slabBreakdown: SlabBreakdownRow[];
  selectedTotalTax: number;
  selectedLabel: string;
  alternateTotalTax: number;
  alternateLabel: string;
}

export function TaxVisualBreakdown({
  slabBreakdown,
  selectedTotalTax,
  selectedLabel,
  alternateTotalTax,
  alternateLabel,
}: TaxSlabChartProps) {
  const maxCompare = Math.max(selectedTotalTax, alternateTotalTax, 1);
  const maxSlabTax = Math.max(...slabBreakdown.map((s) => s.taxAmount), 1);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/[0.08] bg-[#111116] p-4 sm:p-5 lg:grid-cols-2">
      <div>
        <h4 className="font-display text-sm font-semibold text-white">
          Regime Tax Comparison
        </h4>
        <p className="mb-3 text-xs text-zinc-400">
          Estimated total tax liability (including surcharge & 4% cess)
        </p>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[#E5C158]">{selectedLabel} (Selected)</span>
              <span className="font-mono-num font-semibold text-white">
                {formatINR(selectedTotalTax, 0)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all duration-200"
                style={{ width: `${Math.max(2, (selectedTotalTax / maxCompare) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">{alternateLabel}</span>
              <span className="font-mono-num font-semibold text-zinc-200">
                {formatINR(alternateTotalTax, 0)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-500 transition-all duration-200"
                style={{ width: `${Math.max(2, (alternateTotalTax / maxCompare) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold text-white">
          Tax Distribution by Slab
        </h4>
        <p className="mb-3 text-xs text-zinc-400">
          Pre-rebate slab tax contribution across brackets
        </p>
        <div className="space-y-2">
          {slabBreakdown
            .filter((s) => s.taxableInSlab > 0)
            .map((slab) => (
              <div key={slab.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">
                    {slab.label} ({slab.rate}%)
                  </span>
                  <span className="font-mono-num text-zinc-200">
                    {formatINR(slab.taxAmount, 0)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#D4AF37]/80"
                    style={{
                      width: `${slab.taxAmount > 0 ? Math.max(3, (slab.taxAmount / maxSlabTax) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          {slabBreakdown.every((s) => s.taxableInSlab === 0) && (
            <p className="text-xs text-zinc-400">Zero taxable income across all slabs.</p>
          )}
        </div>
      </div>
    </div>
  );
}
