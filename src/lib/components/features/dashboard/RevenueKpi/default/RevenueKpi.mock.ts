import type { RevenueKpiResponse } from '../../_shared/types'

/** Mock for RevenueKpi — used until the endpoint ships. */
export const mockRevenue: RevenueKpiResponse = {
  period: { type: 'month', start: '2026-07-01', end: '2026-07-31' },
  currency: 'EUR',
  current: { net: 128450.0, tax: 28259.0, total: 156709.0 },
  previous: { net: 114200.0, tax: 25124.0, total: 139324.0 },
  delta: { ratio: 0.1248, direction: 'up' },
}
