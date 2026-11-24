import React, { useState } from 'react';
import {
  AlertCircle,
  Calculator,
  Check,
  Copy,
  Download,
  Printer,
  Share2,
} from 'lucide-react';
import { shareCalculationResult, triggerPrintPdf } from '../../utils/exportUtils';

interface ResultActionsBarProps {
  shareTitle: string;
  summaryText: string;
  onExportCsv?: () => void;
  csvLabel?: string;
  disabled?: boolean;
}

export const ResultActionsBar: React.FC<ResultActionsBarProps> = ({
  shareTitle,
  summaryText,
  onExportCsv,
  csvLabel = 'CSV',
  disabled = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [sharedState, setSharedState] = useState<'idle' | 'shared' | 'copied'>('idle');

  const handleCopy = async () => {
    if (disabled || !summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const el = document.createElement('textarea');
      el.value = summaryText;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const handleShare = async () => {
    if (disabled || !summaryText) return;
    const outcome = await shareCalculationResult({ title: shareTitle, text: summaryText });
    if (outcome === 'shared' || outcome === 'copied') {
      setSharedState(outcome);
      window.setTimeout(() => setSharedState('idle'), 2200);
    }
  };

  const btnClass =
    'inline-flex items-center gap-1.5 rounded-xl border border-[#6366F1]/28 bg-[#0B1020]/90 px-3 py-1.5 text-xs font-medium text-[#E2E8F0] transition-colors hover:border-[#06B6D4]/70 hover:text-[#38BDF8] disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]';

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <button type="button" onClick={handleCopy} disabled={disabled} className={btnClass}>
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
            <span className="text-[#10B981]">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[#06B6D4]" aria-hidden="true" />
            <span>Copy Result</span>
          </>
        )}
      </button>

      {onExportCsv && (
        <button type="button" onClick={onExportCsv} disabled={disabled} className={btnClass}>
          <Download className="h-3.5 w-3.5 text-[#6366F1]" aria-hidden="true" />
          <span>{csvLabel}</span>
        </button>
      )}

      <button type="button" onClick={triggerPrintPdf} disabled={disabled} className={btnClass}>
        <Printer className="h-3.5 w-3.5 text-[#8B5CF6]" aria-hidden="true" />
        <span>PDF</span>
      </button>

      <button type="button" onClick={handleShare} disabled={disabled} className={btnClass}>
        {sharedState !== 'idle' ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
            <span className="text-[#10B981]">
              {sharedState === 'shared' ? 'Shared' : 'Link & Summary Copied'}
            </span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5 text-[#A855F7]" aria-hidden="true" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
};

interface ResultEmptyStateProps {
  hasErrors: boolean;
  message?: string;
  onLoadExample?: () => void;
}

export const ResultEmptyState: React.FC<ResultEmptyStateProps> = ({
  hasErrors,
  message,
  onLoadExample,
}) => {
  return (
    <div className="aurora-card p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px] space-y-3.5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
          hasErrors
            ? 'border-rose-500/40 bg-rose-950/35 text-rose-400'
            : 'border-[#06B6D4]/40 bg-gradient-to-br from-[#2563EB]/20 via-[#6366F1]/20 to-[#8B5CF6]/20 text-[#38BDF8]'
        }`}
      >
        {hasErrors ? (
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Calculator className="h-5 w-5" aria-hidden="true" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-base font-semibold text-[#F8FAFC]">
          {hasErrors ? 'Check highlighted input fields' : 'Ready to calculate'}
        </h4>
        <p className="text-xs sm:text-sm leading-relaxed text-[#94A3B8]">
          {message ??
            (hasErrors
              ? 'Correct the invalid fields on the left to view your updated calculation and breakdown.'
              : 'Enter your values in the input panel and click Calculate to view your breakdown and step-by-step working.')}
        </p>
      </div>

      {onLoadExample && (
        <button
          type="button"
          onClick={onLoadExample}
          className="rounded-xl border border-[#06B6D4]/40 bg-gradient-to-r from-[#2563EB]/20 via-[#6366F1]/20 to-[#8B5CF6]/20 px-4 py-2 text-xs font-semibold text-[#38BDF8] transition-all hover:border-[#06B6D4] hover:text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#06B6D4]"
        >
          Load Example Scenario
        </button>
      )}
    </div>
  );
};
