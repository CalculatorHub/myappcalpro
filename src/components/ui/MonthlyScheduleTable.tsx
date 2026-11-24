import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import type { MonthlyInterestRow } from '../../logic/calculators';
import { formatINR } from '../../utils/formatters';

interface MonthlyScheduleTableProps {
  title?: string;
  subtitle?: string;
  rows: MonthlyInterestRow[];
}

const PAGE_SIZE = 12;

export const MonthlyScheduleTable: React.FC<MonthlyScheduleTableProps> = ({
  title = 'Month-by-Month Breakdown',
  subtitle,
  rows,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [showAll, setShowAll] = useState<boolean>(false);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
    setShowAll(rows.length <= PAGE_SIZE);
  }, [rows.length]);

  if (rows.length === 0) {
    return null;
  }

  const displayedRows = showAll
    ? rows
    : rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rangeStart = showAll ? 1 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = showAll ? rows.length : Math.min(rows.length, page * PAGE_SIZE);

  return (
    <div className="aurora-card overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between border-b border-[#6366F1]/20 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
      >
        <div>
          <span className="text-sm font-semibold text-[#F8FAFC]">
            {title} ({rows.length} {rows.length === 1 ? 'month' : 'months'})
          </span>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div>
          <div className="max-h-96 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#0B1020] text-[#94A3B8]">
                <tr>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium text-right">Opening Balance</th>
                  <th className="px-4 py-3 font-medium text-right">Monthly Interest</th>
                  <th className="px-4 py-3 font-medium text-right">Accumulated Interest</th>
                  <th className="px-4 py-3 font-medium text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6366F1]/14 font-mono tabular-nums">
                {displayedRows.map((row) => (
                  <tr key={row.month} className="hover:bg-[#6366F1]/[0.06] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#38BDF8]">{row.label}</td>
                    <td className="px-4 py-3 text-right text-[#E2E8F0]">
                      {formatINR(row.openingBalance, 2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#10B981]">
                      +{formatINR(row.monthlyInterest, 2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#06B6D4]">
                      {formatINR(row.accumulatedInterest, 2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#F8FAFC]">
                      {formatINR(row.closingBalance, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#6366F1]/20 bg-[#080D1B]/65 px-4 py-3 text-xs">
              <span className="text-[#94A3B8] tabular-nums">
                Showing months <strong className="text-[#F8FAFC]">{rangeStart}–{rangeEnd}</strong> of{' '}
                <strong className="text-[#F8FAFC]">{rows.length}</strong>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {!showAll && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#6366F1]/30 px-2.5 py-1.5 font-medium text-[#F8FAFC] transition-colors hover:border-[#06B6D4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Prev
                    </button>
                    <span className="px-1.5 font-mono text-[#E2E8F0] tabular-nums">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#6366F1]/30 px-2.5 py-1.5 font-medium text-[#F8FAFC] transition-colors hover:border-[#06B6D4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="rounded-lg border border-[#06B6D4]/35 bg-[#06B6D4]/12 px-2.5 py-1.5 font-medium text-[#38BDF8] transition-colors hover:bg-[#06B6D4]/22 cursor-pointer"
                >
                  {showAll ? 'Paginate (12/page)' : `Show all ${rows.length}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
