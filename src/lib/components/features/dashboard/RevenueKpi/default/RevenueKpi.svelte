<!--
  @component RevenueKpi
  @description Self-enclosed KPI: revenue for the current month vs the previous
  one, with a trend pill. Lazily fetches its own data and handles loading /
  error states. Falls back to a mock until the endpoint ships.
  @keywords dashboard, kpi, revenue, sales, venduto, trend
  @api GET /api/legal-entities/{legalEntity}/dashboard/kpis/revenue (proposed) -> RevenueKpiResponse
-->
<script lang="ts">
  import { StatCard } from '$lib/components/core/StatCard'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import type { DataWrapper } from '$lib/types/api-types'
  import * as m from '$lib/paraglide/messages.js'
  import { renderPrice } from '$lib/utils/prices'
  import { apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import EuroIcon from '@lucide/svelte/icons/euro'
  import type { RevenueKpiResponse } from '../../_shared/types'
  import { withMockFallback, type Sourced } from '../../_shared/with-mock-fallback'
  import { mockRevenue } from './RevenueKpi.mock'

  let { legalEntity }: SnippetProps = $props()
  const leId = $derived(legalEntity?.id)

  const resource = new Resource<Sourced<RevenueKpiResponse>>(() =>
    withMockFallback(
      () =>
        apiRequest<DataWrapper<RevenueKpiResponse>>({
          url: `/legal-entities/${leId}/dashboard/kpis/revenue`,
          queryParams: { period: 'current_month' },
        }).then((r) => r.data),
      mockRevenue
    )
  )

  const kpi = $derived(resource.data?.value)
  const trendLabel = $derived(
    kpi ? `${kpi.delta.ratio >= 0 ? '+' : ''}${(kpi.delta.ratio * 100).toFixed(1)}%` : ''
  )
  const footerTitle = $derived(
    kpi?.delta.direction === 'down'
      ? m.dashboard_revenue_trend_down()
      : kpi?.delta.direction === 'flat'
        ? m.dashboard_revenue_trend_flat()
        : m.dashboard_revenue_trend_up()
  )
</script>

<StatCard
  title={m.dashboard_revenue_title()}
  loading={resource.loading}
  error={resource.error}
  onRetry={resource.reload}
  value={kpi ? renderPrice(kpi.current.total, kpi.currency) : undefined}
  trend={kpi ? { direction: kpi.delta.direction, label: trendLabel } : undefined}
  footerTitle={kpi ? footerTitle : undefined}
  footerSubtext={m.dashboard_revenue_subtext()}
  href={createRoute({ $id: 'invoices' })}
  demo={resource.data?.demo}>
  {#snippet icon()}<EuroIcon class="size-4" />{/snippet}
</StatCard>
