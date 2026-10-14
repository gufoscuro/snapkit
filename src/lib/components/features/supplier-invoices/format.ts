import { calendarDayParts } from '$lib/utils/date'

/**
 * Formats a serialized calendar day (`YYYY-MM-DD` or ISO datetime) in UTC built
 * from its local parts, so the shown day matches the stored one in any timezone
 * (see blueprint components/date-handling.md).
 */
export function formatCalendarDay(value: string | null | undefined): string {
  const parts = calendarDayParts(value ?? undefined)
  if (!parts) return value || '-'
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeZone: 'UTC' }).format(date)
}

/**
 * Flattens a free-form FatturaPA object (address, REA, contacts, an order/DDT
 * reference) to a single line of its non-empty scalar values. These snapshots
 * mirror the XML as received, so their keys aren't a stable contract.
 */
export function flattenValues(value: unknown): string {
  if (value == null) return ''
  if (typeof value !== 'object') return String(value)
  return Object.values(value as Record<string, unknown>)
    .flatMap(v => (v != null && typeof v === 'object' ? [flattenValues(v)] : [v]))
    .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
    .map(String)
    .join(' · ')
}
