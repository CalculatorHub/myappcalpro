import React, { useId, useRef, useState } from 'react';
import { formatINR, formatINRCompact } from '../../utils/formatters';

export interface GrowthChartDatum {
  label: string;
  period?: number;
  principal: number;
  monthlyInterest?: number;
  interestEarned: number;
  totalAmount: number;
}

interface GrowthChartProps {
  title: string;
  xAxisLabel?: string;
  data: GrowthChartDatum[];
}

function buildSmoothSvgPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 0.2;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = Math.min(points.length - 1, i + 2);
    const p3Pt = points[p3];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3Pt.x - p1.x) * tension;
    const cp2y = p2.y - (p3Pt.y - p1.y) * tension;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

function selectReadableMonthIndices(total: number, getX: (idx: number) => number): Set<number> {
  const chosen = new Set<number>();
  if (total <= 0) return chosen;
  if (total === 1) {
    chosen.add(0);
    return chosen;
  }

  chosen.add(0);
  chosen.add(total - 1);

  const candidates: number[] = [];
  if (total <= 6) {
    for (let i = 1; i < total - 1; i++) candidates.push(i);
  } else if (total <= 12) {
    for (let m = 3; m < total; m += 3) candidates.push(m - 1);
  } else {
    const interval =
      total <= 60 ? 12 : total <= 144 ? 24 : total <= 240 ? 36 : total <= 360 ? 60 : 120;
    for (let m = interval; m < total; m += interval) {
      candidates.push(m - 1);
    }
  }

  const minPixelGap = 72;
  const startX = getX(0);
  const endX = getX(total - 1);
  let lastAcceptedX = startX;

  for (const idx of candidates) {
    const x = getX(idx);
    if (x - lastAcceptedX >= minPixelGap && endX - x >= minPixelGap) {
      chosen.add(idx);
      lastAcceptedX = x;
    }
  }

  return chosen;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  title,
  xAxisLabel = 'Months',
  data,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const uid = useId().replace(/:/g, '');
  const totalStrokeGradId = `aurora-total-stroke-${uid}`;
  const interestStrokeGradId = `aurora-interest-stroke-${uid}`;
  const totalAreaGradId = `aurora-total-area-${uid}`;
  const interestAreaGradId = `aurora-interest-area-${uid}`;

  if (!data || data.length === 0) {
    return null;
  }

  const svgWidth = 680;
  const svgHeight = 290;
  const pad = { top: 22, right: 24, bottom: 40, left: 76 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const maxTotal = Math.max(...data.map((d) => d.totalAmount), 1);
  const yMax = maxTotal * 1.1;

  const getX = (index: number) => {
    if (data.length === 1) return pad.left + plotW / 2;
    return pad.left + (index / (data.length - 1)) * plotW;
  };

  const getY = (val: number) => pad.top + plotH - (Math.max(0, val) / yMax) * plotH;

  const totalPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.totalAmount) }));
  const interestPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.interestEarned) }));

  const totalPath = buildSmoothSvgPath(totalPoints);
  const interestPath = buildSmoothSvgPath(interestPoints);

  const principalPath =
    data.length === 1
      ? `M ${pad.left} ${getY(data[0].principal).toFixed(1)} L ${(svgWidth - pad.right).toFixed(1)} ${getY(data[0].principal).toFixed(1)}`
      : data
          .map(
            (d, i) =>
              `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.principal).toFixed(1)}`
          )
          .join(' ');

  const bottomY = getY(0);
  const totalAreaPath =
    data.length > 1
      ? `${totalPath} L ${totalPoints[totalPoints.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${totalPoints[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`
      : '';

  const interestAreaPath =
    data.length > 1
      ? `${interestPath} L ${interestPoints[interestPoints.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${interestPoints[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: yMax * ratio,
    y: getY(yMax * ratio),
  }));

  const visibleXIndices = selectReadableMonthIndices(data.length, getX);
  const selectedIdx = activeIndex !== null ? activeIndex : data.length - 1;
  const selectedDatum = data[selectedIdx];
  const monthlyGain = selectedDatum.monthlyInterest ?? 0;

  const updatePointerIndex = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || data.length <= 1) {
      setActiveIndex(0);
      return;
    }
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0) return;
    const svgX = ((clientX - rect.left) / rect.width) * svgWidth;
    const clampedRatio = Math.max(0, Math.min(1, (svgX - pad.left) / plotW));
    const nearest = Math.round(clampedRatio * (data.length - 1));
    setActiveIndex(nearest);
  };

  const tooltipW = 204;
  const tooltipH = 104;
  const activeX = activeIndex !== null ? getX(activeIndex) : 0;
  const activeY = activeIndex !== null ? getY(data[activeIndex].totalAmount) : 0;
  const tooltipX =
    activeX + tooltipW + 16 <= svgWidth - pad.right
      ? activeX + 12
      : Math.max(pad.left + 4, activeX - tooltipW - 12);
  const tooltipY = Math.max(
    pad.top + 4,
    Math.min(pad.top + plotH - tooltipH - 4, activeY - tooltipH / 2)
  );

  return (
    <div className="aurora-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[#F8FAFC]">{title}</h4>
          <p className="text-xs text-[#94A3B8]">
            {xAxisLabel} ({data.length} {data.length === 1 ? 'month' : 'months'}) vs Amount (₹)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 border-t border-dashed border-slate-400" />
            Principal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 bg-gradient-to-r from-[#10B981] to-[#06B6D4]" />
            Accumulated Interest
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#D946EF]" />
            Total Amount
          </span>
        </div>
      </div>

      <div className="aurora-subcard flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs tabular-nums">
        <span className="font-mono font-semibold text-[#38BDF8]">{selectedDatum.label}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[#94A3B8]">
            Principal:{' '}
            <strong className="font-mono text-[#F8FAFC]">
              {formatINR(selectedDatum.principal, 0)}
            </strong>
          </span>
          <span className="text-[#94A3B8]">
            Monthly Interest:{' '}
            <strong className="font-mono text-[#10B981]">
              +{formatINR(monthlyGain, 2)}
            </strong>
          </span>
          <span className="text-[#94A3B8]">
            Accumulated:{' '}
            <strong className="font-mono text-[#06B6D4]">
              {formatINR(selectedDatum.interestEarned, 2)}
            </strong>
          </span>
          <span className="text-[#94A3B8]">
            Total:{' '}
            <strong className="font-mono text-[#F8FAFC]">
              {formatINR(selectedDatum.totalAmount, 2)}
            </strong>
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-auto w-full select-none overflow-visible"
          role="img"
          aria-label={`${title} showing Principal, Monthly Interest, Accumulated Interest, and Total Amount across ${data.length} months`}
        >
          <defs>
            <linearGradient id={totalStrokeGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="48%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
            <linearGradient id={interestStrokeGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id={totalAreaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#080D1B" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={interestAreaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={pad.left}
                y1={tick.y}
                x2={svgWidth - pad.right}
                y2={tick.y}
                stroke="rgba(99, 102, 241, 0.16)"
                strokeDasharray={idx === 0 ? undefined : '3 4'}
              />
              <text
                x={pad.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#94A3B8"
                fontSize="11"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {formatINRCompact(tick.value)}
              </text>
            </g>
          ))}

          {totalAreaPath && <path d={totalAreaPath} fill={`url(#${totalAreaGradId})`} />}
          {interestAreaPath && <path d={interestAreaPath} fill={`url(#${interestAreaGradId})`} />}

          <path
            d={principalPath}
            fill="none"
            stroke="#64748B"
            strokeWidth="1.75"
            strokeDasharray="5 4"
          />

          {data.length > 1 && (
            <path
              d={interestPath}
              fill="none"
              stroke={`url(#${interestStrokeGradId})`}
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {data.length > 1 && (
            <path
              d={totalPath}
              fill="none"
              stroke={`url(#${totalStrokeGradId})`}
              strokeWidth="2.85"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {data.map((d, i) => {
            if (!visibleXIndices.has(i)) return null;
            return (
              <text
                key={`x-${d.label}-${i}`}
                x={getX(i)}
                y={svgHeight - 10}
                textAnchor={
                  data.length === 1
                    ? 'middle'
                    : i === 0
                    ? 'start'
                    : i === data.length - 1
                    ? 'end'
                    : 'middle'
                }
                fill="#94A3B8"
                fontSize="11"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {d.label}
              </text>
            );
          })}

          {data.map((d, i) => {
            const showDot = data.length <= 24 || visibleXIndices.has(i);
            if (!showDot) return null;
            const cx = getX(i);
            return (
              <circle
                key={`dot-${i}`}
                cx={cx}
                cy={getY(d.totalAmount)}
                r={data.length <= 12 ? 3.8 : 3}
                fill="#080D1B"
                stroke="#38BDF8"
                strokeWidth="1.75"
              />
            );
          })}

          {activeIndex !== null && (
            <g>
              <line
                x1={activeX}
                y1={pad.top}
                x2={activeX}
                y2={pad.top + plotH}
                stroke="rgba(56, 189, 248, 0.55)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activeX}
                cy={getY(data[activeIndex].interestEarned)}
                r={4.5}
                fill="#10B981"
                stroke="#F8FAFC"
                strokeWidth="1.5"
              />
              <circle
                cx={activeX}
                cy={activeY}
                r={5.5}
                fill="#6366F1"
                stroke="#F8FAFC"
                strokeWidth="2"
              />

              <g transform={`translate(${tooltipX.toFixed(1)}, ${tooltipY.toFixed(1)})`}>
                <rect
                  width={tooltipW}
                  height={tooltipH}
                  rx="12"
                  fill="rgba(8, 13, 27, 0.95)"
                  stroke="rgba(6, 182, 212, 0.55)"
                  strokeWidth="1"
                />
                <text
                  x="12"
                  y="20"
                  fill="#38BDF8"
                  fontSize="11.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  {data[activeIndex].label}
                </text>
                <text x="12" y="39" fill="#94A3B8" fontSize="10.5">
                  Principal:
                </text>
                <text
                  x={tooltipW - 12}
                  y="39"
                  textAnchor="end"
                  fill="#F8FAFC"
                  fontSize="10.5"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  {formatINR(data[activeIndex].principal, 0)}
                </text>

                <text x="12" y="56" fill="#94A3B8" fontSize="10.5">
                  Monthly Int.:
                </text>
                <text
                  x={tooltipW - 12}
                  y="56"
                  textAnchor="end"
                  fill="#10B981"
                  fontSize="10.5"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  +{formatINR(data[activeIndex].monthlyInterest ?? 0, 2)}
                </text>

                <text x="12" y="73" fill="#94A3B8" fontSize="10.5">
                  Accumulated:
                </text>
                <text
                  x={tooltipW - 12}
                  y="73"
                  textAnchor="end"
                  fill="#06B6D4"
                  fontSize="10.5"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  {formatINR(data[activeIndex].interestEarned, 2)}
                </text>

                <text x="12" y="91" fill="#E2E8F0" fontSize="10.5" fontWeight="600">
                  Total:
                </text>
                <text
                  x={tooltipW - 12}
                  y="91"
                  textAnchor="end"
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                >
                  {formatINR(data[activeIndex].totalAmount, 2)}
                </text>
              </g>
            </g>
          )}

          <rect
            x={pad.left}
            y={pad.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            className="cursor-crosshair"
            tabIndex={0}
            aria-label={`Interactive monthly chart overlay for ${title}. Use arrow keys or hover to inspect monthly values.`}
            onMouseMove={(e) => updatePointerIndex(e.clientX)}
            onMouseLeave={() => setActiveIndex(null)}
            onTouchStart={(e) => {
              if (e.touches[0]) updatePointerIndex(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) updatePointerIndex(e.touches[0].clientX);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev === null ? 0 : Math.min(data.length - 1, prev + 1)
                );
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setActiveIndex((prev) =>
                  prev === null ? data.length - 1 : Math.max(0, prev - 1)
                );
              }
            }}
            onBlur={() => setActiveIndex(null)}
          />
        </svg>
      </div>
    </div>
  );
};
