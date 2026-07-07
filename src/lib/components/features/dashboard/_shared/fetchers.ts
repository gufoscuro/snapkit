import type { DataWrapper } from '$lib/types/api-types'
import { apiRequest } from '$lib/utils/request'
import type { CountKpiResponse, DashboardPeriodParam } from './types'
import { withMockFallback, type Sourced } from './with-mock-fallback'

export type CountKpiSlug = 'to-ship' | 'to-invoice' | 'to-collect'

/** Shared fetcher for the operational count KPIs (to-ship / to-invoice /
 * to-collect). Generic over the response shape so to-ship can carry its extra
 * behind-schedule fields. Falls back to the given mock until the endpoint ships. */
export function fetchCountKpi<T extends CountKpiResponse>(
  leId: string | undefined,
  slug: CountKpiSlug,
  mock: T,
  period: DashboardPeriodParam = 'current_week'
): Promise<Sourced<T>> {
  return withMockFallback(
    () =>
      apiRequest<DataWrapper<T>>({
        url: `/legal-entities/${leId}/dashboard/kpis/${slug}`,
        queryParams: { period },
      }).then((r) => r.data),
    mock
  )
}
