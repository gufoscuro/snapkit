<!--
  @component HomeDashboard
  @description The "given" home dashboard: a responsive grid of self-enclosed
  KPI widgets (revenue, to-ship, to-invoice, to-collect) above a full-width
  monthly-revenue bar chart. Each widget fetches its own data independently, so
  this container only lays them out and forwards SnippetProps. A future
  per-tenant custom dashboard can swap this for a slot-based configurable grid.
  @keywords dashboard, home, homepage, grid, kpi, overview, panoramica
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import type { SnippetProps } from '$utils/runtime'
  import MonthlyRevenueChart from '../../MonthlyRevenueChart/default/MonthlyRevenueChart.svelte'
  import RevenueKpi from '../../RevenueKpi/default/RevenueKpi.svelte'
  import ToCollectKpi from '../../ToCollectKpi/default/ToCollectKpi.svelte'
  import ToInvoiceKpi from '../../ToInvoiceKpi/default/ToInvoiceKpi.svelte'
  import ToShipKpi from '../../ToShipKpi/default/ToShipKpi.svelte'

  const snippetProps: SnippetProps = $props()
</script>

<div class="flex flex-col gap-4">
  <div>
    <h1 class="text-xl font-semibold">{m.dashboard_title()}</h1>
    <p class="text-sm text-muted-foreground">{m.dashboard_subtitle()}</p>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <RevenueKpi {...snippetProps} />
    <ToShipKpi {...snippetProps} />
    <ToInvoiceKpi {...snippetProps} />
    <ToCollectKpi {...snippetProps} />
  </div>

  <MonthlyRevenueChart {...snippetProps} />
</div>
