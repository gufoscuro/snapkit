import type { MonthlyRevenueResponse } from '../../_shared/types'

/** Mock for MonthlyRevenueChart — used until the endpoint ships. The last point
 * is the current, still-open month (see `partial_from`). */
export const mockMonthlyRevenue: MonthlyRevenueResponse = {
  currency: 'EUR',
  series: [
    { month: '2025-08', label: "ago '25", total: 98230.0 },
    { month: '2025-09', label: "set '25", total: 121400.0 },
    { month: '2025-10', label: "ott '25", total: 134900.0 },
    { month: '2025-11', label: "nov '25", total: 142300.0 },
    { month: '2025-12', label: "dic '25", total: 168500.0 },
    { month: '2026-01', label: "gen '26", total: 96700.0 },
    { month: '2026-02', label: "feb '26", total: 112300.0 },
    { month: '2026-03', label: "mar '26", total: 129800.0 },
    { month: '2026-04', label: "apr '26", total: 138650.0 },
    { month: '2026-05', label: "mag '26", total: 151200.0 },
    { month: '2026-06', label: "giu '26", total: 147900.0 },
    { month: '2026-07', label: "lug '26", total: 156709.0 },
  ],
  partial_from: '2026-07',
}
