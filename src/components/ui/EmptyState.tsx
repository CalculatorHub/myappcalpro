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
    <div className="flex flex-col items-start justify-center rounded-xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#131209] text-[#D4AF37]">
        <Calculator size={20} weight="regular" aria-hidden="true" />
      </div>
      <h3 className="heading-6 text-white">{title}</h3>
      <p className="body-6 mt-2 max-w-xl text-zinc-400">{description}</p>

      {presets.length > 0 && (
        <div className="mt-6 w-full border-t border-[#272727] pt-5">
          <p className="caption-4 mb-3 flex items-center gap-1.5 text-zinc-400">
            <Sparkle size={14} weight="fill" className="text-[#D4AF37]" aria-hidden="true" />
            <span>Load a worked example to explore results immediately:</span>
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={preset.onSelect}
                className="group flex flex-col items-start rounded-lg border border-[#272727] bg-[#1F1F1F] px-4 py-3 text-left transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#D4AF37] hover:bg-[#272727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <span className="body-5 text-white group-hover:text-[#E5C158]">
                  {preset.label}
                </span>
                <span className="caption-5 mt-0.5 text-zinc-400">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
