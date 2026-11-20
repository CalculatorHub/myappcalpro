import { Calculator, Sparkle } from '@phosphor-icons/react';

export interface ExamplePreset {
  label: string;
  description: string;
  onSelect: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  presets: ExamplePreset[];
}

export function EmptyState({ title, description, presets }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-start justify-center p-6 sm:p-8">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-raised gold-accent">
        <Calculator size={20} weight="regular" aria-hidden="true" />
      </div>
      <h3 className="heading-6 text-primary">{title}</h3>
      <p className="body-6 mt-2 max-w-xl text-secondary">{description}</p>

      {presets.length > 0 && (
        <div className="mt-6 w-full border-t border-border-subtle pt-5">
          <p className="caption-4 mb-3 flex items-center gap-1.5 text-secondary">
            <Sparkle size={14} weight="fill" className="gold-accent" aria-hidden="true" />
            <span>Load a worked example to explore results immediately:</span>
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={preset.onSelect}
                className="group flex flex-col items-start rounded-lg border border-border-subtle bg-bg-raised px-4 py-3 text-left transition-colors hover:border-accent-gold hover:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <span className="body-5 text-primary group-hover:text-accent-gold-hover">
                  {preset.label}
                </span>
                <span className="caption-5 mt-0.5 text-secondary">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
