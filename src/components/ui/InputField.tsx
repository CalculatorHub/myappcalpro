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
          className="inline-flex items-center gap-1.5 title-3 text-primary"
        >
          <span>{label}</span>
          {tooltip && <Tooltip text={tooltip} label={`About ${label}`} />}
        </label>
        {compactScale && (
          <span className="font-mono-num caption-4 gold-accent">
            {compactScale}
          </span>
        )}
      </div>

      <div
        className={`flex min-h-[44px] items-center rounded-lg border bg-bg-card transition-colors ${
          error
            ? 'border-error bg-error-bg/20 focus-within:border-error'
            : 'border-border-subtle hover:border-border-default focus-within:border-accent-gold'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        {prefix && (
          <span className="select-none border-r border-border-subtle px-3 py-2 font-mono-num caption-2 gold-accent">
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
          className="font-mono-num w-full bg-transparent px-3 py-2.5 caption-2 text-primary placeholder:text-muted focus:outline-none"
        />
        {suffix && (
          <span className="select-none border-l border-border-subtle px-3 py-2 caption-5 font-medium text-secondary whitespace-nowrap">
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
          <div className="font-mono-num mt-0.5 flex justify-between caption-5 text-muted">
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
                className={`rounded-md border px-2 py-1 font-mono-num caption-5 transition-colors ${
                  isSelected
                    ? 'border-accent-gold bg-bg-raised gold-accent'
                    : 'card text-secondary hover:text-primary'
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
          className="flex items-center gap-1.5 caption-5 text-error"
        >
          <WarningCircle size={14} weight="fill" className="shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="caption-5 text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
