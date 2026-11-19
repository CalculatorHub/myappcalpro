export function formatINR(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '₹0.00';
  const clean = Math.abs(value) < 1e-9 ? 0 : value;
  const isNegative = clean < 0;
  const absFormatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(clean));
  return `${isNegative ? '-' : ''}₹${absFormatted}`;
}

export function formatINRCompact(value: number): string | null {
  if (!Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e7) {
    return `${sign}₹${(abs / 1e7).toFixed(2)} Crore`;
  }
  if (abs >= 1e5) {
    return `${sign}₹${(abs / 1e5).toFixed(2)} Lakh`;
  }
  return null;
}

export function formatNumberIN(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return '0';
  const clean = Math.abs(value) < 1e-9 ? 0 : value;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(clean);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0%';
  const clean = Math.abs(value) < 1e-9 ? 0 : value;
  return `${clean.toFixed(decimals)}%`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

