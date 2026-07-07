import type { ToShipKpiResponse } from '../../_shared/types'

/** Mock for ToShipKpi — used until the endpoint ships. */
export const mockToShip: ToShipKpiResponse = {
  period: { type: 'week', start: '2026-07-06', end: '2026-07-12' },
  count: 12,
  currency: 'EUR',
  amount: { net: 69024.59, tax: 15185.41, total: 84210.0 },
  behind_schedule_count: 3,
  behind_schedule_date: '2026-07-07',
}
