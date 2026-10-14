import { describe, expect, it, vi } from 'vitest'

vi.mock('$lib/utils/request', () => ({ apiRequest: vi.fn() }))

import { normalizeKpiNumbers } from './fetchers'

describe('normalizeKpiNumbers', () => {
  it('coerces decimal strings on the headline and additional figures', () => {
    expect(
      normalizeKpiNumbers({
        value: '1234.50',
        format: 'currency',
        additional_kpis: [{ value: '10.00', format: 'currency' }],
      }),
    ).toEqual({
      value: 1234.5,
      format: 'currency',
      additional_kpis: [{ value: 10, format: 'currency' }],
    })
  })

  it('leaves numbers and non-numeric strings alone', () => {
    expect(normalizeKpiNumbers({ value: 3, format: 'number' })).toEqual({ value: 3, format: 'number' })
    expect(normalizeKpiNumbers({ value: 'n/a' })).toEqual({ value: 'n/a' })
  })
})
