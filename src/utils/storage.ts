export type ThemePreference = 'light' | 'dark';

export type CalculatorSlug =
  | 'simple-interest'
  | 'compound-interest'
  | 'loan-emi'
  | 'income-tax';

export interface CalculationHistoryItem {
  id: string;
  calculatorId: CalculatorSlug;
  calculatorTitle: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  summaryLine: string;
  details?: string[];
  timestamp: string;
}

const VALID_CALCULATORS = new Set<string>([
  'simple-interest',
  'compound-interest',
  'loan-emi',
  'income-tax',
]);

const KEYS = {
  theme: 'calhub_theme_v1',
  favorites: 'calhub_favorites_v1',
  recent: 'calhub_recent_v1',
  history: 'calhub_history_v1',
} as const;

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or private-mode restriction errors gracefully
  }
}

export function getSavedTheme(): ThemePreference {
  const raw = safeGetItem(KEYS.theme);
  return raw === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: ThemePreference): void {
  safeSetItem(KEYS.theme, theme);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

export function getFavorites(): CalculatorSlug[] {
  const raw = safeGetItem(KEYS.favorites);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CalculatorSlug => typeof item === 'string' && VALID_CALCULATORS.has(item)
    );
  } catch {
    return [];
  }
}

export function saveFavorites(ids: CalculatorSlug[]): void {
  const clean = Array.from(new Set(ids.filter((id) => VALID_CALCULATORS.has(id))));
  safeSetItem(KEYS.favorites, JSON.stringify(clean));
}

export function getRecentCalculators(): CalculatorSlug[] {
  const raw = safeGetItem(KEYS.recent);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is CalculatorSlug => typeof item === 'string' && VALID_CALCULATORS.has(item)
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

export function recordRecentCalculator(id: CalculatorSlug): CalculatorSlug[] {
  if (!VALID_CALCULATORS.has(id)) return getRecentCalculators();
  const prev = getRecentCalculators().filter((item) => item !== id);
  const next = [id, ...prev].slice(0, 5);
  safeSetItem(KEYS.recent, JSON.stringify(next));
  return next;
}

export function getCalculationHistory(): CalculationHistoryItem[] {
  const raw = safeGetItem(KEYS.history);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is CalculationHistoryItem => {
        if (!entry || typeof entry !== 'object') return false;
        const e = entry as Record<string, unknown>;
        return (
          typeof e.id === 'string' &&
          typeof e.calculatorId === 'string' &&
          VALID_CALCULATORS.has(e.calculatorId) &&
          typeof e.calculatorTitle === 'string' &&
          typeof e.primaryMetricLabel === 'string' &&
          typeof e.primaryMetricValue === 'string' &&
          typeof e.summaryLine === 'string' &&
          (e.details === undefined ||
            (Array.isArray(e.details) && e.details.every((d) => typeof d === 'string'))) &&
          typeof e.timestamp === 'string'
        );
      })
      .slice(0, 25);
  } catch {
    return [];
  }
}

export function appendCalculationHistory(
  item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>
): CalculationHistoryItem[] {
  const existing = getCalculationHistory();
  // Deduplicate identical calculations across history while refreshing timestamp at top
  const deduplicated = existing.filter(
    (entry) =>
      !(
        entry.calculatorId === item.calculatorId &&
        entry.primaryMetricValue === item.primaryMetricValue &&
        entry.summaryLine === item.summaryLine
      )
  );

  const entry: CalculationHistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const next = [entry, ...deduplicated].slice(0, 25);
  safeSetItem(KEYS.history, JSON.stringify(next));
  return next;
}

export function removeCalculationHistoryItem(id: string): CalculationHistoryItem[] {
  const next = getCalculationHistory().filter((entry) => entry.id !== id);
  safeSetItem(KEYS.history, JSON.stringify(next));
  return next;
}

export function clearCalculationHistory(): CalculationHistoryItem[] {
  safeSetItem(KEYS.history, JSON.stringify([]));
  return [];
}
