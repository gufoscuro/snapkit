import type { CountKpiResponse } from '../../_shared/types'

/** Mock for ToCollectKpi — used until the endpoint ships. */
export const mockToCollect: CountKpiResponse = {
  period: { type: 'week', start: '2026-07-06', end: '2026-07-12' },
  count: 8,
  currency: 'EUR',
  amount: { net: 38959.02, tax: 8570.98, total: 47530.0 },
}
