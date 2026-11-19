import { WarningCircle } from '@phosphor-icons/react';
import { Tooltip } from './Tooltip';
import { formatINRCompact, formatNumberIN } from '../../utils/formatters';

export interface QuickPresetChip {
  label: string;
  value: string;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  error?: string | null;
  helperText?: string;
  showIndianScale?: boolean;
  disabled?: boolean;
  step?: string;
  quickChips?: QuickPresetChip[];
  slider?: {
    min: number;
    max: number;
    step: number;
  };
}

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  prefix,
  suffix,
  tooltip,
  error,
  helperText,
  showIndianScale = false,
  disabled = false,
  step = 'any',
  quickChips,
  slider,
}: InputFieldProps) {
  const numericVal = Number(value.replace(/,/g, ''));
  const hasValidNum = value.trim() !== '' && Number.isFinite(numericVal);
  const compactScale =
    showIndianScale && hasValidNum && numericVal >= 100000
      ? formatINRCompact(numericVal)
      : hasValidNum && showIndianScale && numericVal > 0
      ? `₹${formatNumberIN(numericVal, 0)}`
      : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-200"
        >
          <span>{label}</span>
          {tooltip && <Tooltip text={tooltip} label={`About ${label}`} />}
        </label>
        {compactScale && (
          <span className="font-mono-num text-xs font-medium text-[#E5C158]">
            {compactScale}
          </span>
        )}
      </div>

      <div
        className={`flex min-h-[44px] items-center rounded-lg border bg-[#000000] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          error
            ? 'border-red-500/70 focus-within:border-red-400'
            : 'border-[#272727] hover:border-[#313131] focus-within:border-[#D4AF37]'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        {prefix && (
          <span className="select-none border-r border-[#272727] px-3 py-2 font-mono-num text-sm text-[#D4AF37]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          className="font-mono-num w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
        />
        {suffix && (
          <span className="select-none border-l border-[#272727] px-3 py-2 text-xs font-medium text-zinc-400 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>

      {slider && (
        <div className="pt-1">
          <input
            type="range"
            aria-label={`${label} slider`}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={
              hasValidNum
                ? Math.min(slider.max, Math.max(slider.min, numericVal))
                : slider.min
            }
            onChange={(e) => onChange(e.target.value)}
            className="gold-slider w-full"
          />
          <div className="font-mono-num mt-0.5 flex justify-between text-xs text-zinc-500">
            <span>
              {prefix ?? ''}
              {formatNumberIN(slider.min, 0)}
              {suffix ? ` ${suffix}` : ''}
            </span>
            <span>
              {prefix ?? ''}
              {formatNumberIN(slider.max, 0)}
              {suffix ? ` ${suffix}` : ''}
            </span>
          </div>
        </div>
      )}

      {quickChips && quickChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {quickChips.map((chip) => {
            const isSelected = value.trim() === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChange(chip.value)}
                className={`rounded-md border px-2 py-1 font-mono-num text-xs transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#131209] text-[#E5C158]'
                    : 'border-[#272727] bg-[#1F1F1F] text-zinc-400 hover:border-[#313131] hover:text-zinc-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-400"
        >
          <WarningCircle size={14} weight="fill" className="shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="text-xs text-zinc-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
