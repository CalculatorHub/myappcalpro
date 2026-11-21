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
    'inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#111111]/90 px-3 py-1.5 text-xs font-medium text-[#E4E4E7] transition-colors hover:border-[#F5D76E]/70 hover:text-[#F5D76E] disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]';

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <button type="button" onClick={handleCopy} disabled={disabled} className={btnClass}>
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-300">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
            <span>Copy Result</span>
          </>
        )}
      </button>

      {onExportCsv && (
        <button type="button" onClick={onExportCsv} disabled={disabled} className={btnClass}>
          <Download className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
          <span>{csvLabel}</span>
        </button>
      )}

      <button type="button" onClick={triggerPrintPdf} disabled={disabled} className={btnClass}>
        <Printer className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
        <span>PDF</span>
      </button>

      <button type="button" onClick={handleShare} disabled={disabled} className={btnClass}>
        {sharedState !== 'idle' ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-300">
              {sharedState === 'shared' ? 'Shared' : 'Link & Summary Copied'}
            </span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
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
    <div className="luxury-card p-8 sm:p-10 flex flex-col items-center justify-center text-center min-h-[280px] space-y-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
          hasErrors
            ? 'border-red-500/40 bg-red-950/35 text-red-400'
            : 'border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F5D76E]'
        }`}
      >
        {hasErrors ? (
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Calculator className="h-6 w-6" aria-hidden="true" />
        )}
      </div>

      <div className="max-w-sm space-y-1.5">
        <h4 className="text-base font-semibold text-white">
          {hasErrors ? 'Check highlighted input fields' : 'Ready to calculate'}
        </h4>
        <p className="text-sm leading-relaxed text-[#A1A1AA]">
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
          className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/12 px-4 py-2 text-xs font-semibold text-[#F5D76E] transition-colors hover:bg-[#D4AF37]/20 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
        >
          Load Example Scenario
        </button>
      )}
    </div>
  );
};
