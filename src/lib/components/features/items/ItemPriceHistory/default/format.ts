import { getLocale } from '$lib/paraglide/runtime'
import { calendarDayParts } from '$lib/utils/date'

/**
 * `document_date` arrives as a plain calendar day (`YYYY-MM-DD`). Parsing it
 * with `new Date()` and reading local components shifts the day in negative-UTC
 * zones, so build an explicit UTC date and read it back in UTC.
 * See `calendarDayParts` for the full rationale.
 */
export function toUtcDate(value: string | undefined | null): Date | undefined {
  const parts = calendarDayParts(value ?? undefined)
  if (!parts) return undefined
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
}

function render(date: Date): string {
  return date.toLocaleDateString(getLocale(), {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Localized `dd/mm/yyyy` for a plain calendar day. */
export function formatCalendarDay(value: string | undefined | null): string | undefined {
  const date = toUtcDate(value)
  return date ? render(date) : undefined
}

/**
 * Same rendering, for an axis tick. The chart library hands ticks over as
 * whatever its scale produced — a `Date` on a time scale, but a millisecond
 * number or a stringified date otherwise — so this normalizes instead of
 * assuming (`v.toISOString()` throws the moment the scale isn't temporal).
 */
export function formatAxisDay(value: unknown): string {
  if (value instanceof Date) return isNaN(value.getTime()) ? '' : render(value)

  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? '' : render(date)
  }

  if (typeof value === 'string') return formatCalendarDay(value) ?? ''

  return ''
}
