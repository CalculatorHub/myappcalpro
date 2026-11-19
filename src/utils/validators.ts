export interface ValidationResult {
  value: number | null;
  error: string | null;
}

export function parseNumericInput(
  raw: string,
  fieldLabel: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    exclusiveMin?: number;
    nonZero?: boolean;
  } = {}
): ValidationResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    if (options.required) {
      return { value: null, error: null };
    }
    return { value: 0, error: null };
  }

  const num = Number(trimmed.replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return { value: null, error: `${fieldLabel} must be a valid number.` };
  }

  if (options.exclusiveMin !== undefined && num <= options.exclusiveMin) {
    return {
      value: null,
      error: `${fieldLabel} must be greater than ${options.exclusiveMin}.`,
    };
  }

  if (options.min !== undefined && num < options.min) {
    return {
      value: null,
      error: `${fieldLabel} cannot be less than ${options.min}.`,
    };
  }

  if (options.max !== undefined && num > options.max) {
    return {
      value: null,
      error: `${fieldLabel} cannot exceed ${options.max}.`,
    };
  }

  if (options.nonZero && num === 0) {
    return {
      value: null,
      error: `${fieldLabel} cannot be zero.`,
    };
  }

  return { value: num, error: null };
}
