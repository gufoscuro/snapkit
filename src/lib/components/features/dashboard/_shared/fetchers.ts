import { apiRequest } from '$lib/utils/request'
import { CHART_MOCKS, KPI_MOCKS } from './mocks'
import {
  assertChartPayload,
  assertKpiPayload,
  type ChartPayload,
  type KpiPayload,
  type WidgetConfig,
} from './widget-contracts'
import { withMockFallback, type Sourced } from './with-mock-fallback'

/**
 * Generic fetcher for a config-driven KPI widget. Expands the config's endpoint
 * *slug* to the stats namespace, validates the response against the frozen
 * `KpiPayload` contract, and — while the endpoint is still absent — falls back to
 * a colocated mock (see `KPI_MOCKS`). Endpoints without a mock surface a real
 * error on 404 instead of masking it.
 *
 * Stat endpoints are single resources, so the response is the bare payload — no
 * `{ data }` list envelope.
 */
/**
 * Decimal sums leave the backend as strings (`"1234.50"`, Laravel's decimal cast
 * — e.g. `to-pay`), counts as numbers. The contract wants a number, so coerce a
 * numeric string on the headline and on each additional figure before checking.
 */
export function normalizeKpiNumbers(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const toNumber = (v: unknown) => (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)) ? Number(v) : v)
  const payload = raw as Record<string, unknown>
  return {
    ...payload,
    value: toNumber(payload.value),
    ...(Array.isArray(payload.additional_kpis)
      ? {
          additional_kpis: payload.additional_kpis.map(kpi =>
            kpi && typeof kpi === 'object' ? { ...kpi, value: toNumber((kpi as Record<string, unknown>).value) } : kpi,
          ),
        }
      : {}),
  }
}

export function fetchKpiWidget(leId: string | undefined, config: WidgetConfig): Promise<Sourced<KpiPayload>> {
  const real = () =>
    apiRequest<KpiPayload>({
      url: `/legal-entities/${leId}/stats/kpis/${config.source.endpoint}`,
      queryParams: config.source.params,
    })
      .then(normalizeKpiNumbers)
      .then(assertKpiPayload)

  const mock = KPI_MOCKS[config.source.endpoint]
  if (!mock) return real().then(value => ({ value, demo: false }))
  return withMockFallback(real, mock)
}

/**
 * Generic fetcher for a config-driven chart widget. Mirrors {@link fetchKpiWidget}
 * against the `stats/charts` namespace and the frozen `ChartPayload` contract.
 */
export function fetchChartWidget(leId: string | undefined, config: WidgetConfig): Promise<Sourced<ChartPayload>> {
  const real = () =>
    apiRequest<ChartPayload>({
      url: `/legal-entities/${leId}/stats/charts/${config.source.endpoint}`,
      queryParams: config.source.params,
    }).then(assertChartPayload)

  const mock = CHART_MOCKS[config.source.endpoint]
  if (!mock) return real().then(value => ({ value, demo: false }))
  return withMockFallback(real, mock)
}
