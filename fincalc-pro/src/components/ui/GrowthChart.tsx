import React, { useId, useState } from 'react';
import { formatINR, formatINRCompact } from '../../utils/formatters';

export interface GrowthChartDatum {
  label: string;
  principal: number;
  interestEarned: number;
  totalAmount: number;
}

interface GrowthChartProps {
  title: string;
  xAxisLabel?: string;
  data: GrowthChartDatum[];
  heightClass?: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  title,
  xAxisLabel = 'Time Horizon',
  data,
  heightClass = 'h-56 sm:h-64',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const areaGradId = `gold-area-${uid}`;

  if (!data || data.length === 0) {
    return null;
  }

  const svgWidth = 640;
  const svgHeight = 260;
  const pad = { top: 20, right: 20, bottom: 38, left: 74 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const maxTotal = Math.max(...data.map((d) => d.totalAmount), 1);
  const yMax = maxTotal * 1.08;

  const getX = (index: number) => {
    if (data.length === 1) return pad.left + plotW / 2;
    return pad.left + (index / (data.length - 1)) * plotW;
  };

  const getY = (val: number) => pad.top + plotH - (Math.max(0, val) / yMax) * plotH;

  const totalPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.totalAmount).toFixed(1)}`)
    .join(' ');

  const principalPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.principal).toFixed(1)}`)
    .join(' ');

  const areaBetweenPath = [
    ...data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.totalAmount).toFixed(1)}`),
    ...data
      .slice()
      .reverse()
      .map((d, revIdx) => {
        const origIdx = data.length - 1 - revIdx;
        return `L ${getX(origIdx).toFixed(1)} ${getY(d.principal).toFixed(1)}`;
      }),
    'Z',
  ].join(' ');

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: yMax * ratio,
    y: getY(yMax * ratio),
  }));

  const maxXLabels = 5;
  const step = Math.max(1, Math.ceil((data.length - 1) / (maxXLabels - 1)));
  const selectedDatum = activeIndex !== null ? data[activeIndex] : data[data.length - 1];

  return (
    <div className="luxury-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-[#A1A1AA]">{xAxisLabel} vs Amount (₹)</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-500" />
            Principal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF37]/30 border border-[#D4AF37]" />
            Interest Earned
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 bg-[#F5D76E]" />
            Total Amount
          </span>
        </div>
      </div>

      <div className="luxury-subcard flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs tabular-nums">
        <span className="font-mono font-semibold text-[#F5D76E]">{selectedDatum.label}</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="text-[#A1A1AA]">
            Principal:{' '}
            <strong className="font-mono text-white">
              {formatINR(selectedDatum.principal, 0)}
            </strong>
          </span>
          <span className="text-[#A1A1AA]">
            Interest:{' '}
            <strong className="font-mono text-[#F5D76E]">
              {formatINR(selectedDatum.interestEarned, 0)}
            </strong>
          </span>
          <span className="text-[#A1A1AA]">
            Total:{' '}
            <strong className="font-mono text-white">
              {formatINR(selectedDatum.totalAmount, 0)}
            </strong>
          </span>
        </div>
      </div>

      <div className={`relative w-full ${heightClass}`}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`${title} showing Principal, Interest Earned, and Total Amount in Indian Rupees`}
        >
          <defs>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={pad.left}
                y1={tick.y}
                x2={svgWidth - pad.right}
                y2={tick.y}
                stroke="rgba(212, 175, 55, 0.14)"
                strokeDasharray={idx === 0 ? undefined : '3 4'}
              />
              <text
                x={pad.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#A1A1AA"
                fontSize="11"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {formatINRCompact(tick.value)}
              </text>
            </g>
          ))}

          <path d={areaBetweenPath} fill={`url(#${areaGradId})`} />

          <path
            d={principalPath}
            fill="none"
            stroke="#71717A"
            strokeWidth="2"
            strokeDasharray="5 4"
          />

          <path
            d={totalPath}
            fill="none"
            stroke="#F5D76E"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => {
            const showLabel = i === 0 || i === data.length - 1 || i % step === 0;
            if (!showLabel) return null;
            return (
              <text
                key={`x-${d.label}-${i}`}
                x={getX(i)}
                y={svgHeight - 10}
                textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                fill="#A1A1AA"
                fontSize="11"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {d.label}
              </text>
            );
          })}

          {activeIndex !== null && (
            <line
              x1={getX(activeIndex)}
              y1={pad.top}
              x2={getX(activeIndex)}
              y2={pad.top + plotH}
              stroke="rgba(245, 215, 110, 0.5)"
              strokeWidth="1"
            />
          )}

          {data.map((d, i) => {
            const cx = getX(i);
            const cyTotal = getY(d.totalAmount);
            const isSelected = activeIndex === i;
            return (
              <g key={`pt-${i}`}>
                <circle
                  cx={cx}
                  cy={cyTotal}
                  r={isSelected ? 5.5 : 3.5}
                  fill={isSelected ? '#F5D76E' : '#050505'}
                  stroke={isSelected ? '#FFFFFF' : '#D4AF37'}
                  strokeWidth="2"
                />
                <rect
                  x={cx - Math.max(10, plotW / Math.max(data.length, 4) / 2)}
                  y={pad.top}
                  width={Math.max(20, plotW / Math.max(data.length, 4))}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  tabIndex={0}
                  aria-label={`${d.label}: Principal ${formatINR(d.principal)}, Interest ${formatINR(d.interestEarned)}, Total ${formatINR(d.totalAmount)}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
