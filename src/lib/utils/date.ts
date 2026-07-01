/**
 * Serialize a Date using its LOCAL components (YYYY-MM-DDTHH:mm:ss.sss),
 * NOT UTC — avoids the day-shift that `toISOString()` causes near midnight
 * in positive-offset timezones (e.g. Apr 30 CET → Apr 29 22:00 UTC).
 */
export function toLocalISOString(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

/** Today's date as a local ISO string — the correct default for calendar-day fields. */
export function todayLocalISO(): string {
  return toLocalISOString(new Date())
}

/**
 * The LOCAL calendar day (year/month/day, month 1-based) that a serialized value
 * represents — used to populate a day-granularity date picker.
 *
 * Strings are trusted by their literal leading date part (`YYYY-MM-DD`): that IS
 * the calendar day. Re-projecting a *local* datetime through UTC (`getUTCDate()`)
 * would shift the day near midnight — e.g. the `2026-07-02T00:30` default reads
 * back as Jul 1 in UTC. Date objects, on the other hand, carry the picker's own
 * convention (UTC midnight per calendar day, see how picks are emitted), so their
 * day is read via UTC components.
 *
 * Returns `undefined` for empty or unparseable input.
 */
export function calendarDayParts(
  value: Date | string | undefined,
): { year: number; month: number; day: number } | undefined {
  if (!value) return undefined

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
    }
  }

  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return undefined
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}
