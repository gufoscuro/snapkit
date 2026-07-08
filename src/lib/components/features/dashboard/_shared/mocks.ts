import type { ChartPayload, KpiPayload } from './widget-contracts'

/**
 * Dev-only mock payloads keyed by endpoint slug, in the generic `KpiPayload`
 * shape. The generic fetcher falls back to these while a stat endpoint returns
 * 404 (see `fetchKpiWidget`). Removal path: delete an entry once its endpoint
 * ships — the widget then renders live data with no code change.
 */
export const KPI_MOCKS: Record<string, KpiPayload> = {
  revenue: {
    value: 48250.75,
    format: 'currency',
    currency: 'EUR',
    trend: { direction: 'up', value: 0.125, format: 'percent', positive_is_good: true },
    period: { from: '2026-07-01', to: '2026-07-31' },
  },
  'to-ship': {
    value: 12,
    format: 'number',
    metrics: { behind_schedule_count: 3 },
    meta: { behind_schedule_date: '2026-07-07' },
    period: { from: '2026-07-06', to: '2026-07-12' },
  },
  'to-invoice': {
    value: 5,
    format: 'number',
    period: { from: '2026-07-06', to: '2026-07-12' },
  },
  'to-collect': {
    value: 8,
    format: 'number',
    period: { from: '2026-07-06', to: '2026-07-12' },
  },
}

/**
 * Dev-only chart mocks keyed by endpoint slug, in the generic `ChartPayload`
 * shape. The payload carries only series keys — labels come from the widget
 * config (the backend can't localize them). Same removal path as {@link KPI_MOCKS}.
 */
export const CHART_MOCKS: Record<string, ChartPayload> = {
  'monthly-revenue': {
    format: 'currency',
    currency: 'EUR',
    x_key: 'label',
    x_type: 'category',
    series: [{ key: 'total' }],
    points: [
      { label: "ago '25", total: 98230.0 },
      { label: "set '25", total: 121400.0 },
      { label: "ott '25", total: 134900.0 },
      { label: "nov '25", total: 142300.0 },
      { label: "dic '25", total: 168500.0 },
      { label: "gen '26", total: 96700.0 },
      { label: "feb '26", total: 112300.0 },
      { label: "mar '26", total: 129800.0 },
      { label: "apr '26", total: 138650.0 },
      { label: "mag '26", total: 151200.0 },
      { label: "giu '26", total: 147900.0 },
      { label: "lug '26", total: 156709.0 },
    ],
  },
}
