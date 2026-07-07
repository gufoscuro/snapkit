<!--
  @component ToShipKpi
  @description Self-enclosed KPI: number of orders to ship this week. A count of
  zero is treated as a positive "all clear" state, not an empty one. When some
  orders are past their delivery date, the footer shows a clickable "N overdue"
  link that deep-links the delivery schedule filtered to overdue rows
  (?delivery_date_to={behind_schedule_date}). Falls back to a mock until the
  endpoint ships.
  @keywords dashboard, kpi, to-ship, spedire, delivery, orders, overdue, ritardo
  @api GET /api/legal-entities/{legalEntity}/dashboard/kpis/to-ship (proposed) -> ToShipKpiResponse
-->
<script lang="ts">
  import { StatCard } from '$lib/components/core/StatCard'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
  import TruckIcon from '@lucide/svelte/icons/truck'
  import { fetchCountKpi } from '../../_shared/fetchers'
  import { mockToShip } from './ToShipKpi.mock'

  let { legalEntity }: SnippetProps = $props()

  const resource = new Resource(() => fetchCountKpi(legalEntity?.id, 'to-ship', mockToShip))
  const kpi = $derived(resource.data?.value)
  const isZero = $derived(kpi?.count === 0)
  const overdueCount = $derived(kpi?.behind_schedule_count ?? 0)
  const overdueHref = $derived(
    kpi ? createRoute({ $id: 'to-ship', query: { delivery_date_to: kpi.behind_schedule_date } }) : '#'
  )
</script>

<StatCard
  title={m.dashboard_to_ship_title()}
  loading={resource.loading}
  error={resource.error}
  onRetry={resource.reload}
  value={kpi ? String(kpi.count) : undefined}
  tone={isZero ? 'positive' : 'default'}
  href={createRoute({ $id: 'to-ship' })}
  demo={resource.data?.demo}>
  {#snippet icon()}<TruckIcon class="size-4" />{/snippet}

  {#snippet footer()}
    {#if isZero}
      <div class="font-medium text-emerald-600 dark:text-emerald-400">{m.dashboard_all_clear()}</div>
      <div class="text-muted-foreground">{m.dashboard_to_ship_zero()}</div>
    {:else if overdueCount > 0}
      <a
        href={overdueHref}
        class="relative z-10 inline-flex w-fit items-center gap-1.5 font-medium text-amber-600 hover:underline dark:text-amber-400">
        <TriangleAlertIcon class="size-4" />
        {m.dashboard_to_ship_overdue({ count: overdueCount })}
      </a>
      <div class="text-muted-foreground">{m.dashboard_to_ship_subtext()}</div>
    {:else}
      <div class="text-muted-foreground">{m.dashboard_to_ship_subtext()}</div>
    {/if}
  {/snippet}
</StatCard>
