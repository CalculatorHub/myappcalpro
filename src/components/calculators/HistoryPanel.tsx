import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Eye,
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
  const [selectedItem, setSelectedItem] = useState<CalculationHistoryItem | null>(null);

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem]);

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
    const detailsText = item.details?.length ? `\n${item.details.join('\n')}` : '';
    const payload = `${item.calculatorTitle} — ${item.primaryMetricLabel}: ${item.primaryMetricValue}\n${item.summaryLine}${detailsText}`;
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
      className="scroll-mt-24 border-t border-[#D4AF37]/15 bg-[#101010]"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#141414] px-3.5 py-2 text-xs font-semibold text-[#F5D76E] transition-colors hover:border-[#F5D76E] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export All CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  onClearHistory();
                }}
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
              <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {filteredHistory.map((item) => {
                  const formattedTimestamp = new Date(item.timestamp).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <TiltCard3D key={item.id} className="luxury-card h-full p-4" maxTiltDeg={4}>
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-[#F5D76E]">
                            {item.calculatorTitle}
                          </span>
                          <span className="text-[11px] text-[#A1A1AA] tabular-nums shrink-0">
                            {formattedTimestamp}
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
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-[#F5D76E] transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                            <span>View details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenCalculator(item.calculatorId)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5D76E] hover:underline cursor-pointer"
                          >
                            <span>Open tool</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

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
                            onClick={() => {
                              if (selectedItem?.id === item.id) setSelectedItem(null);
                              onRemoveItem(item.id);
                            }}
                            aria-label={`Delete ${item.calculatorTitle} entry`}
                            className="rounded-lg border border-[#D4AF37]/25 p-1.5 text-[#A1A1AA] hover:border-red-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </TiltCard3D>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Computation Details Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="luxury-card w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#D4AF37]/18 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#D4AF37]">
                  {selectedItem.calculatorTitle}
                </p>
                <h3 id="history-detail-title" className="mt-1 text-lg font-bold text-white">
                  {selectedItem.primaryMetricLabel}
                </h3>
                <p className="mt-0.5 text-xs text-[#A1A1AA] tabular-nums">
                  Saved {new Date(selectedItem.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close computation details"
                className="rounded-lg border border-[#D4AF37]/25 p-1.5 text-[#A1A1AA] hover:border-[#F5D76E] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="luxury-subcard p-4 space-y-1">
              <p className="text-xs text-[#A1A1AA]">Primary Output</p>
              <p className="font-mono text-2xl font-bold text-[#F5D76E] tabular-nums">
                {selectedItem.primaryMetricValue}
              </p>
              <p className="text-xs text-[#E4E4E7] pt-1">{selectedItem.summaryLine}</p>
            </div>

            {selectedItem.details && selectedItem.details.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white">Saved Breakdown</p>
                <ul className="space-y-1.5 text-xs text-[#A1A1AA] font-mono tabular-nums">
                  {selectedItem.details.map((line, i) => (
                    <li key={i} className="rounded-xl bg-white/[0.03] px-3 py-2 text-[#E4E4E7]">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#D4AF37]/15 pt-4">
              <button
                type="button"
                onClick={() => handleCopyEntry(selectedItem)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#141414] px-3.5 py-2 text-xs font-semibold text-[#E4E4E7] hover:border-[#F5D76E] hover:text-[#F5D76E] cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copiedId === selectedItem.id ? 'Copied' : 'Copy Summary'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedItem.calculatorId;
                  setSelectedItem(null);
                  onOpenCalculator(id);
                }}
                className="gold-shimmer-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                <span>Open {selectedItem.calculatorTitle}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};
