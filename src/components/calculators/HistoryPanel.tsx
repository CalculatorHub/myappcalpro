import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  History,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { CalculationHistoryItem, CalculatorSlug } from '../../utils/storage';
import { downloadCsvFile } from '../../utils/exportUtils';
import { TiltCard3D } from '../ui/TiltCard3D';

interface HistoryPanelProps {
  history: CalculationHistoryItem[];
  onOpenCalculator: (id: CalculatorSlug) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onOpenCalculator,
  onRemoveItem,
  onClearHistory,
}) => {
  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.calculatorTitle.toLowerCase().includes(q) ||
        item.primaryMetricLabel.toLowerCase().includes(q) ||
        item.primaryMetricValue.toLowerCase().includes(q) ||
        item.summaryLine.toLowerCase().includes(q)
    );
  }, [history, filterText]);

  const handleCopyEntry = async (item: CalculationHistoryItem) => {
    const payload = `${item.calculatorTitle} — ${item.primaryMetricLabel}: ${item.primaryMetricValue}\n${item.summaryLine}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard permission errors cleanly
    }
  };

  const handleExportAll = () => {
    if (history.length === 0) return;
    downloadCsvFile(
      'calhub-calculation-history.csv',
      ['Timestamp', 'Calculator', 'Metric', 'Value', 'Summary'],
      history.map((item) => [
        new Date(item.timestamp).toLocaleString('en-IN'),
        item.calculatorTitle,
        item.primaryMetricLabel,
        item.primaryMetricValue,
        item.summaryLine,
      ])
    );
  };

  return (
    <motion.section
      id="history"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-[#D4AF37]/15 bg-[#0A0A0C]"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
              <History className="h-4 w-4" aria-hidden="true" />
              <span>Local Calculation History</span>
            </div>
            <h2 className="heading-3 mt-1.5 text-white">Saved Computations</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Click Calculate inside any tool to save a snapshot locally in your browser (up to 25 entries).
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#111111] px-3.5 py-2 text-xs font-semibold text-[#F5D76E] transition-colors hover:border-[#F5D76E] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export All CSV</span>
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/35 bg-red-950/35 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-900/45 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="luxury-card p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-white">No saved calculations yet</p>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
              Whenever you press Calculate in Simple Interest, Compound Interest, Home Loan EMI,
              or Income Tax, your result summary will appear here for quick recall or CSV export.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="luxury-input flex items-center gap-2 px-3.5 py-2 max-w-sm">
              <Search className="h-4 w-4 text-[#D4AF37] shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter saved history..."
                aria-label="Filter saved calculations"
                className="w-full bg-transparent text-sm text-white placeholder:text-[#A1A1AA]/65 focus:outline-none"
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText('')}
                  aria-label="Clear filter"
                  className="text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {filteredHistory.length === 0 ? (
              <div className="luxury-card p-6 text-center text-sm text-[#A1A1AA]">
                No history entries match &ldquo;{filterText}&rdquo;.
              </div>
            ) : (
              <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                {filteredHistory.map((item) => (
                  <TiltCard3D key={item.id} className="luxury-card p-4" maxTiltDeg={4}>
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#F5D76E]">
                          {item.calculatorTitle}
                        </span>
                        <span className="text-[11px] text-[#A1A1AA] tabular-nums shrink-0">
                          {new Date(item.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-[#A1A1AA]">{item.primaryMetricLabel}</p>
                      <p className="font-mono text-xl font-bold text-white tabular-nums">
                        {item.primaryMetricValue}
                      </p>
                      <p className="text-xs leading-relaxed text-[#A1A1AA]">
                        {item.summaryLine}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#D4AF37]/15 pt-3">
                      <button
                        type="button"
                        onClick={() => onOpenCalculator(item.calculatorId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5D76E] hover:underline cursor-pointer"
                      >
                        <span>Open tool</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyEntry(item)}
                          aria-label={`Copy ${item.calculatorTitle} summary`}
                          className="rounded-lg border border-[#D4AF37]/25 p-1.5 text-[#A1A1AA] hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Delete ${item.calculatorTitle} entry`}
                          className="rounded-lg border border-[#D4AF37]/25 p-1.5 text-[#A1A1AA] hover:border-red-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};
