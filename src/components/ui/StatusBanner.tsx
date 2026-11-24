import React from 'react';

interface StatusBannerProps {
  feedback?: string | null;
  error?: string | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ feedback, error }) => {
  if (!feedback && !error) return null;

  return (
    <div className="space-y-2">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-950/35 px-3 py-2 text-xs text-rose-300"
        >
          {error}
        </p>
      )}
      {feedback && (
        <p className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-2 text-xs text-[#34D399]">
          {feedback}
        </p>
      )}
    </div>
  );
};
