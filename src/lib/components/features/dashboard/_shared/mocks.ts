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
    filters: { delivery_date_from: '2026-07-06', delivery_date_to: '2026-07-12' },
    additional_kpis: [{ value: 3, format: 'number', filters: { delivery_date_to: '2026-07-07' } }],
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
    label_format: 'month',
    series: [{ key: 'total' }],
    points: [
      { label: '2025-08', total: 98230.0 },
      { label: '2025-09', total: 121400.0 },
      { label: '2025-10', total: 134900.0 },
      { label: '2025-11', total: 142300.0 },
      { label: '2025-12', total: 168500.0 },
      { label: '2026-01', total: 96700.0 },
      { label: '2026-02', total: 112300.0 },
      { label: '2026-03', total: 129800.0 },
      { label: '2026-04', total: 138650.0 },
      { label: '2026-05', total: 151200.0 },
      { label: '2026-06', total: 147900.0 },
      { label: '2026-07', total: 156709.0 },
    ],
  },
}
