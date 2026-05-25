import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names safely. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a large number with K/M suffixes.
 * e.g. 1234567 → "1.2M"
 *
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format seconds as "Xm Ys" or "Xh Ym".
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  if (s >= 3600) {
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  }
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/**
 * Convert an array of objects to a CSV string and trigger a download.
 *
 * @param {object[]} rows
 * @param {string}   filename
 */
export function downloadCSV(rows, filename = 'empirika-export.csv') {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str;
      }).join(','),
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
