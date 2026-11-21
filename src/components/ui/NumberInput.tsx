import React, { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface NumberInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number | string;
  tooltip?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 'any',
  tooltip,
  helperText,
  error,
  placeholder = '0',
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-white">
          {label}
        </label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTooltip((prev) => !prev)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              aria-label={`More information about ${label}`}
              className="rounded-lg p-1 text-[#A1A1AA] transition-colors hover:text-[#F5D76E] focus-visible:outline-2 focus-visible:outline-[#D4AF37] cursor-pointer"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
            {showTooltip && (
              <div
                role="tooltip"
                className="luxury-card absolute right-0 top-7 z-30 w-64 p-3 text-xs leading-relaxed text-[#A1A1AA]"
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex items-center px-3.5 py-2.5 ${
          error ? 'luxury-input luxury-input-error' : 'luxury-input'
        } ${disabled ? 'opacity-55' : ''}`}
      >
        {prefix && (
          <span className="mr-2 select-none font-mono text-sm font-semibold text-[#D4AF37]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onFocus={(e) => {
            if (e.currentTarget.value === '0') {
              e.currentTarget.select();
            }
          }}
          onChange={(e) => {
            const raw = e.target.value;
            const normalized =
              /^0+\d/.test(raw) && !raw.startsWith('0.')
                ? raw.replace(/^0+(?=\d)/, '')
                : raw;
            onChange(normalized);
          }}
          className="min-w-0 w-full bg-transparent font-mono text-base font-medium text-white tabular-nums placeholder:text-[#A1A1AA]/55 focus:outline-none disabled:cursor-not-allowed"
        />
        {suffix && (
          <span className="ml-2 shrink-0 select-none font-mono text-xs font-medium text-[#A1A1AA] whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-400"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {helperText && (
        <p id={helperId} className="text-xs text-[#A1A1AA]">
          {helperText}
        </p>
      )}
    </div>
  );
};
