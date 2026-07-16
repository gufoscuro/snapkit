import { getLocale } from '$lib/paraglide/runtime'
import { formatNumber } from '$lib/utils/numbers'
import { renderPrice } from '$lib/utils/prices'
import type { Trend, ValueFormat } from './widget-contracts'

/** Paraglide locale → BCP-47 tag for `Intl`. Mirrors DateField's LOCALE_MAP. */
const LOCALE_MAP: Record<string, string> = { en: 'en-US', it: 'it-IT' }

/**
 * Format a raw payload number for display per its semantic `format`. The
 * backend sends numbers; the frontend owns presentation (currency symbol,
 * locale separators, percent). `percent` treats the value as a ratio
 * (`0.125` → `12,5%`).
 */
export function formatValue(value: number, format: ValueFormat, currency?: string): string {
  switch (format) {
    case 'currency':
      return renderPrice(value, currency)
    case 'percent':
      return `${formatNumber(value * 100, { decimals: 1 })}%`
    case 'number':
    default:
      return formatNumber(value, { decimals: 0 })
  }
}

/** Render a trend's magnitude with a leading sign, e.g. `+12,5%` / `−3,0%`. */
export function formatTrend(trend: Trend): string {
  const sign = trend.value > 0 ? '+' : trend.value < 0 ? '−' : ''
  return `${sign}${formatValue(Math.abs(trend.value), trend.format ?? 'percent')}`
}

/**
 * Localize a chart x-axis label that holds a raw date, per the payload's
 * `label_format`. `month` parses `YYYY-MM` → e.g. "lug 2026"; `date` parses
 * `YYYY-MM-DD` → e.g. "15 lug 2026". Values that aren't a parseable date are
 * returned verbatim, so non-date x labels keep working. The Date is built from
 * local components (no `toISOString` day-shift — this is display only).
 */
export function formatChartLabel(raw: string, labelFormat: 'month' | 'date'): string {
  const [y, mo, d] = raw.split('-').map(Number)
  if (!y || !mo) return raw
  const locale = LOCALE_MAP[getLocale()] ?? 'en-US'
  const date = new Date(y, mo - 1, labelFormat === 'date' ? (d || 1) : 1)
  const opts: Intl.DateTimeFormatOptions =
    labelFormat === 'date'
      ? { day: '2-digit', month: 'short', year: 'numeric' }
      : { month: 'short', year: 'numeric' }
  return new Intl.DateTimeFormat(locale, opts).format(date)
}
