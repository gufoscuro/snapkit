<!--
  @component ToShipKpi
  @description Self-enclosed KPI: number of orders to ship this week. A count of
  zero is treated as a positive "all clear" state, not an empty one. Lazily
  fetches its own data; falls back to a mock until the endpoint ships.
  @keywords dashboard, kpi, to-ship, spedire, delivery, orders
  @api GET /api/legal-entities/{legalEntity}/dashboard/kpis/to-ship (proposed) -> CountKpiResponse
-->
<script lang="ts">
  import { StatCard } from '$lib/components/core/StatCard'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import { renderPrice } from '$lib/utils/prices'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import TruckIcon from '@lucide/svelte/icons/truck'
  import { fetchCountKpi } from '../../_shared/fetchers'
  import { mockToShip } from './ToShipKpi.mock'

  let { legalEntity }: SnippetProps = $props()

  const resource = new Resource(() => fetchCountKpi(legalEntity?.id, 'to-ship', mockToShip))
  const kpi = $derived(resource.data?.value)
  const isZero = $derived(kpi?.count === 0)
  const amount = $derived(kpi?.amount ? renderPrice(kpi.amount.total, kpi.currency) : undefined)
</script>

<StatCard
  title={m.dashboard_to_ship_title()}
  loading={resource.loading}
  error={resource.error}
  onRetry={resource.reload}
  value={kpi ? String(kpi.count) : undefined}
  tone={isZero ? 'positive' : 'default'}
  footerTitle={isZero ? m.dashboard_all_clear() : amount}
  footerSubtext={isZero ? m.dashboard_to_ship_zero() : m.dashboard_to_ship_subtext()}
  href={createRoute({ $id: 'to-ship' })}
  demo={resource.data?.demo}>
  {#snippet icon()}<TruckIcon class="size-4" />{/snippet}
</StatCard>
