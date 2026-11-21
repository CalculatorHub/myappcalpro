/**
 * Neutralizes spreadsheet formula injection (leading =, +, -, @, tab, CR)
 * and safely quotes CSV values per RFC 4180.
 */
export function escapeCsvCell(value: string | number): string {
  const raw = String(value ?? '');
  const formulaSafe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const escaped = formulaSafe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  // Prepend UTF-8 BOM so ₹ symbols open cleanly in Excel
  const csvContent = `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function triggerPrintPdf(): void {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}

export async function shareCalculationResult(params: {
  title: string;
  text: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const shareUrl =
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const combinedText = shareUrl ? `${params.text}\n\nComputed on CalHub FinCalc Pro: ${shareUrl}` : params.text;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: params.title,
        text: combinedText,
        url: shareUrl || undefined,
      });
      return 'shared';
    } catch {
      // User cancelled native share or platform rejected; fall back to clipboard copy
    }
  }

  try {
    await navigator.clipboard.writeText(combinedText);
    return 'copied';
  } catch {
    const el = document.createElement('textarea');
    el.value = combinedText;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      return 'copied';
    } catch {
      return 'failed';
    } finally {
      document.body.removeChild(el);
    }
  }
}
