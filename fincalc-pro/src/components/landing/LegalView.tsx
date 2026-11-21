import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalViewProps {
  mode: 'privacy' | 'terms' | 'not-found';
  onBackHome: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ mode, onBackHome }) => {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <button
        type="button"
        onClick={onBackHome}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5D76E] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to CalHub FinCalc</span>
      </button>

      {mode === 'not-found' ? (
        <div className="luxury-card mt-8 p-8 space-y-4">
          <p className="font-mono text-xs font-semibold text-[#F5D76E]">404</p>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-sm leading-relaxed text-[#A1A1AA]">
            The requested view does not exist. Return to the main calculator suite to continue your
            computations.
          </p>
        </div>
      ) : mode === 'privacy' ? (
        <div className="luxury-card mt-8 p-8 space-y-5">
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm leading-relaxed text-[#A1A1AA]">
            CalHub FinCalc Pro processes all calculator inputs, loan schedules, ratio conversions,
            and educational tax estimates directly inside your browser. No salary figures, loan
            principals, or tax numbers are transmitted to external servers.
          </p>
          <p className="text-sm leading-relaxed text-[#A1A1AA]">
            Favorite pinned calculators, recently opened tools, and saved calculation summaries are
            stored exclusively in your browser&apos;s localStorage and can be cleared anytime from the
            Saved Computations panel.
          </p>
        </div>
      ) : (
        <div className="luxury-card mt-8 p-8 space-y-5">
          <h1 className="text-2xl font-bold text-white">Terms of Use</h1>
          <p className="text-sm leading-relaxed text-[#A1A1AA]">
            CalHub FinCalc Pro is provided strictly as an educational resource for Indian finance
            learners and CA students. Tax outputs reflect configurable slab estimates and are not
            professional chartered accountancy, audit, or legal tax advice.
          </p>
          <p className="text-sm leading-relaxed text-[#A1A1AA]">
            Before submitting statutory income tax returns or signing credit agreements, always
            confirm final liabilities against Income Tax Department rules and lender schedules.
          </p>
        </div>
      )}
    </section>
  );
};
