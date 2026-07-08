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
export function fetchKpiWidget(
  leId: string | undefined,
  config: WidgetConfig
): Promise<Sourced<KpiPayload>> {
  const real = () =>
    apiRequest<KpiPayload>({
      url: `/legal-entities/${leId}/stats/kpis/${config.source.endpoint}`,
      queryParams: config.source.params,
    }).then(assertKpiPayload)

  const mock = KPI_MOCKS[config.source.endpoint]
  if (!mock) return real().then((value) => ({ value, demo: false }))
  return withMockFallback(real, mock)
}

/**
 * Generic fetcher for a config-driven chart widget. Mirrors {@link fetchKpiWidget}
 * against the `stats/charts` namespace and the frozen `ChartPayload` contract.
 */
export function fetchChartWidget(
  leId: string | undefined,
  config: WidgetConfig
): Promise<Sourced<ChartPayload>> {
  const real = () =>
    apiRequest<ChartPayload>({
      url: `/legal-entities/${leId}/stats/charts/${config.source.endpoint}`,
      queryParams: config.source.params,
    }).then(assertChartPayload)

  const mock = CHART_MOCKS[config.source.endpoint]
  if (!mock) return real().then((value) => ({ value, demo: false }))
  return withMockFallback(real, mock)
}
