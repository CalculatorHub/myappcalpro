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
        className="button-xsm inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-border-subtle bg-bg-raised px-3 py-2 text-secondary transition-colors hover:border-border-default hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold whitespace-nowrap shrink-0"
      >
        <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
        <span>Reset</span>
      </button>

      <button
        type="button"
        disabled={!summaryText || disableCopy}
        onClick={handleCopy}
        className="button-xsm inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-accent-gold px-4 py-2 text-bg-main transition-colors hover:bg-accent-gold-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-bg-raised disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold whitespace-nowrap shrink-0"
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
