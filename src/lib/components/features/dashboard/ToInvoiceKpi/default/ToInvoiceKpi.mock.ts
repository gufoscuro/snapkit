import type { CountKpiResponse } from '../../_shared/types'

/** Mock for ToInvoiceKpi — used until the endpoint ships. */
export const mockToInvoice: CountKpiResponse = {
  period: { type: 'week', start: '2026-07-06', end: '2026-07-12' },
  count: 5,
  currency: 'EUR',
  amount: { net: 26377.05, tax: 5802.95, total: 32180.0 },
}
