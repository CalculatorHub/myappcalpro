import { useState } from 'react';
import { ArrowCounterClockwise, Check, Copy } from '@phosphor-icons/react';
import { copyTextToClipboard } from '../../utils/formatters';

interface ResultActionsProps {
  onReset: () => void;
  summaryText: string | null;
  disableCopy?: boolean;
}

export function ResultActions({
  onReset,
  summaryText,
  disableCopy = false,
}: ResultActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summaryText || disableCopy) return;
    const ok = await copyTextToClipboard(summaryText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={onReset}
        className="button-xsm inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#272727] bg-[#1F1F1F] px-3 py-2 text-zinc-200 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#313131] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] whitespace-nowrap shrink-0"
      >
        <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
        <span>Reset</span>
      </button>

      <button
        type="button"
        disabled={!summaryText || disableCopy}
        onClick={handleCopy}
        className="button-xsm inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#D4AF37] bg-[#D4AF37] px-3 py-2 text-[#000000] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E5C158] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#272727] disabled:bg-[#1F1F1F] disabled:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] whitespace-nowrap shrink-0"
      >
        {copied ? (
          <>
            <Check size={14} weight="bold" aria-hidden="true" />
            <span>Results copied</span>
          </>
        ) : (
          <>
            <Copy size={14} weight="bold" aria-hidden="true" />
            <span>Copy results</span>
          </>
        )}
      </button>
    </div>
  );
}
