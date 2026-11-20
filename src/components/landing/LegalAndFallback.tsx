import { ArrowLeft, Cookie } from '@phosphor-icons/react';
import { AppRoute } from './FloatingNav';

interface LegalViewProps {
  route: 'privacy' | 'terms' | 'not-found';
  onBackHome: () => void;
  onNavigate: (route: AppRoute) => void;
}

export function LegalOrFallbackView({
  route,
  onBackHome,
  onNavigate,
}: LegalViewProps) {
  if (route === 'not-found') {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-start px-4 py-32 sm:px-6 lg:px-8">
        <span className="font-mono-num caption-1 text-gold">404</span>
        <h1 className="heading-2 mt-2 text-text-0">Page not found</h1>
        <p className="body-3 mt-3 max-w-[680px] text-text-4">
          The page you requested does not exist on FinCalc Pro. Return to the main overview or jump straight into the calculators.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="button-md inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 text-bg-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-gold-hover active:scale-[0.98]"
          >
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            <span>Back to FinCalc Pro</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('calculators')}
            className="button-md rounded-lg border border-border-2 bg-bg-2 px-3 py-2 text-text-0 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-border-3"
          >
            Open calculators
          </button>
        </div>
      </section>
    );
  }

  const isPrivacy = route === 'privacy';

  return (
    <article className="mx-auto max-w-3xl px-4 py-28 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBackHome}
        className="button-sm mb-6 inline-flex items-center gap-2 rounded-lg border border-border-2 bg-bg-2 px-3 py-2 text-text-2 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold hover:text-gold"
      >
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        <span>Back to overview</span>
      </button>

      <h1 className="heading-2 text-text-0">
        {isPrivacy ? 'Privacy policy' : 'Terms of educational use'}
      </h1>
      <p className="caption-2 mt-2 text-text-4">
        FinCalc Pro · Effective November 2026
      </p>

      <div className="mt-8 space-y-6 rounded-2xl border border-border-2 bg-bg-2 p-6 sm:p-8">
        {isPrivacy ? (
          <>
            <section className="space-y-2">
              <h2 className="title-2 text-text-0">Local browser processing</h2>
              <p className="body-6 text-text-4">
                All interest, loan amortization, percentage ratio, and income tax calculations execute locally inside your browser. FinCalc Pro does not require user registration and does not transmit financial figures to external servers.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="title-2 text-text-0">Storage and preferences</h2>
              <p className="body-6 text-text-4">
                FinCalc Pro stores only minimal browser state such as your cookie notice dismissal preference. No advertising trackers or third party behavioral profiles are active on this site.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="title-2 text-text-0">Educational purpose only</h2>
              <p className="body-6 text-text-4">
                FinCalc Pro and the downloadable CA formula kit are provided solely as educational and illustrative study aids for Indian finance learners. Outputs do not constitute professional tax, audit, investment, or legal advice.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="title-2 text-text-0">Statutory verification</h2>
              <p className="body-6 text-text-4">
                Users must verify statutory deductions, exemptions, surcharge rules, and return filing requirements against official notifications published by the Income Tax Department of India.
              </p>
            </section>
          </>
        )}
      </div>
    </article>
  );
}

interface CookieBannerProps {
  visible: boolean;
  onAccept: () => void;
  onOpenPrivacy: () => void;
}

export function CookieNotice({
  visible,
  onAccept,
  onOpenPrivacy,
}: CookieBannerProps) {
  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie notice"
      className="fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-xl rounded-2xl border border-border-2 bg-bg-2 p-4 shadow-2xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie size={20} weight="regular" className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          <p className="caption-2 text-text-2">
            FinCalc Pro runs locally in your browser and stores only essential notice preferences.{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="font-medium text-gold underline underline-offset-4 hover:text-gold-hover"
            >
              Read privacy policy
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={onAccept}
          className="button-sm shrink-0 rounded-lg bg-gold px-3 py-2 text-bg-0 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-gold-hover"
        >
          Acknowledge
        </button>
      </div>
    </aside>
  );
}
