import type { Currency } from '$lib/types/api-types'

/**
 * Proposed response contracts for the Home dashboard widgets.
 *
 * These endpoints do not exist on the backend yet — the widgets fall back to
 * colocated mocks (see `withMockFallback`) until they ship. Shapes mirror the
 * existing Moddo API conventions: list/object responses wrapped in
 * `DataWrapper<T>` (`{ data }`), money as `{ net, tax, total }` alongside a
 * sibling `currency` (ISO 4217).
 *
 * Period defaults are owned by the backend (`current_week` / `current_month`);
 * callers may override with explicit `from` / `to` (inclusive, `YYYY-MM-DD`).
 */

export type DashboardPeriodParam = 'current_week' | 'current_month'

export interface DashboardPeriod {
  type: 'week' | 'month' | 'custom'
  /** Inclusive start, `YYYY-MM-DD`. */
  start: string
  /** Inclusive end, `YYYY-MM-DD`. */
  end: string
}

export interface Money {
  net: number
  tax: number
  total: number
}

export type TrendDirection = 'up' | 'down' | 'flat'

/**
 * `GET /legal-entities/{legalEntity}/dashboard/kpis/revenue`
 * Default period: `current_month`.
 */
export interface RevenueKpiResponse {
  period: DashboardPeriod
  currency: Currency
  current: Money
  previous: Money
  /** Precomputed delta of `current.total` vs `previous.total`. */
  delta: { ratio: number; direction: TrendDirection }
}

/**
 * Shared shape for the operational count KPIs:
 * - `GET …/dashboard/kpis/to-ship`    (orders to ship)
 * - `GET …/dashboard/kpis/to-invoice` (documents to invoice)
 * - `GET …/dashboard/kpis/to-collect` (invoice due dates to collect)
 * Default period: `current_week`.
 */
export interface CountKpiResponse {
  period: DashboardPeriod
  count: number
  currency: Currency
  /** Aggregate monetary value of the pending items, when meaningful. */
  amount: Money | null
}

export interface MonthlyRevenuePoint {
  /** `YYYY-MM`. */
  month: string
  /** Short localized label, e.g. `lug '26`. */
  label: string
  total: number
}

/**
 * `GET /legal-entities/{legalEntity}/dashboard/charts/monthly-revenue?months=12`
 */
export interface MonthlyRevenueResponse {
  currency: Currency
  series: MonthlyRevenuePoint[]
  /** `YYYY-MM` of the first still-open (partial) month, if any. */
  partial_from: string | null
}
