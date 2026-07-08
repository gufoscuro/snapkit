import { formatNumber } from '$lib/utils/numbers'
import { renderPrice } from '$lib/utils/prices'
import type { Trend, ValueFormat } from './widget-contracts'

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
