import type { DataWrapper } from '$lib/types/api-types'
import { apiRequest } from '$lib/utils/request'
import type { CountKpiResponse, DashboardPeriodParam } from './types'
import { withMockFallback, type Sourced } from './with-mock-fallback'

export type CountKpiSlug = 'to-ship' | 'to-invoice' | 'to-collect'

/** Shared fetcher for the operational count KPIs (to-ship / to-invoice /
 * to-collect). Falls back to the given mock until the endpoint ships. */
export function fetchCountKpi(
  leId: string | undefined,
  slug: CountKpiSlug,
  mock: CountKpiResponse,
  period: DashboardPeriodParam = 'current_week'
): Promise<Sourced<CountKpiResponse>> {
  return withMockFallback(
    () =>
      apiRequest<DataWrapper<CountKpiResponse>>({
        url: `/legal-entities/${leId}/dashboard/kpis/${slug}`,
        queryParams: { period },
      }).then((r) => r.data),
    mock
  )
}
