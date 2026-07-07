// Pin the timezone so `toLocalISOString` (a pure function of a Date's LOCAL
// components) asserts deterministically regardless of the host machine. Must
// run before any Date is constructed below.
process.env.TZ = 'Europe/Rome'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarDayParts, toLocalISOString, todayLocalISO } from './date'

describe('toLocalISOString', () => {
  it('does not shift the calendar day across UTC (regression guard)', () => {
    // 2026-07-01T22:30:00Z === 2026-07-02T00:30 local (CEST, +02:00).
    // toISOString() would wrongly yield 2026-07-01T22:30:00.000Z.
    const d = new Date('2026-07-01T22:30:00.000Z')
    expect(toLocalISOString(d)).toBe('2026-07-02T00:30:00.000')
  })

  it('zero-pads month, day, time and milliseconds', () => {
    const d = new Date(2026, 0, 5, 9, 3, 7, 4) // local constructor
    expect(toLocalISOString(d)).toBe('2026-01-05T09:03:07.004')
  })

  it('serializes to the local wall-clock day on both sides of the DST boundary', () => {
    // Winter: CET (+01:00). A UTC instant at 23:30 on 14 Jan is 00:30 local, 15 Jan.
    const winter = new Date('2026-01-14T23:30:00.000Z')
    expect(toLocalISOString(winter)).toBe('2026-01-15T00:30:00.000')

    // Summer: CEST (+02:00). A UTC instant at 22:30 on 14 Jul is 00:30 local, 15 Jul.
    const summer = new Date('2026-07-14T22:30:00.000Z')
    expect(toLocalISOString(summer)).toBe('2026-07-15T00:30:00.000')
  })
})

describe('todayLocalISO', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches the local ISO shape', () => {
    expect(todayLocalISO()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/)
  })

  it('returns the local calendar day even near midnight (no UTC shift)', () => {
    // 2026-07-01T22:30:00Z is already 2 Jul locally (CEST).
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T22:30:00.000Z'))
    expect(todayLocalISO()).toBe('2026-07-02T00:30:00.000')
  })
})

describe('calendarDayParts', () => {
  it('reads a local-datetime string by its literal date part, not via UTC (regression guard)', () => {
    // The `todayLocalISO()` default near local midnight. getUTCDate() would read
    // this back as Jul 1 (it is 2026-07-01T22:30Z); the date part says Jul 2.
    expect(calendarDayParts('2026-07-02T00:30:00.000')).toEqual({ year: 2026, month: 7, day: 2 })
  })

  it('reads a bare YYYY-MM-DD (the API date shape) as that day', () => {
    expect(calendarDayParts('2026-07-02')).toEqual({ year: 2026, month: 7, day: 2 })
  })

  it('reads a UTC (Z) string by its date part — unchanged from the old behavior', () => {
    expect(calendarDayParts('2026-07-01T22:30:00.000Z')).toEqual({ year: 2026, month: 7, day: 1 })
  })

  it('reads a Date object (a calendar pick = UTC midnight) via its UTC day', () => {
    // How DateField emits picks: new Date(Date.UTC(y, m, d)).
    expect(calendarDayParts(new Date(Date.UTC(2026, 6, 2)))).toEqual({ year: 2026, month: 7, day: 2 })
  })

  it('returns undefined for empty and unparseable input', () => {
    expect(calendarDayParts(undefined)).toBeUndefined()
    expect(calendarDayParts('')).toBeUndefined()
    expect(calendarDayParts('not-a-date')).toBeUndefined()
    expect(calendarDayParts(new Date('nope'))).toBeUndefined()
  })
})
