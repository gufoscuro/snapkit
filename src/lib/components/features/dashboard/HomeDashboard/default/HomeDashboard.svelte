<!--
  @component HomeDashboard
  @description The "given" home dashboard: a responsive grid of config-driven
  KPI widgets (revenue, to-ship, to-invoice, to-collect) above a full-width
  monthly-revenue bar chart. Each KPI is a generic `KpiWidget` cabled by a
  `WidgetConfig` (see `_shared/example-configs`); this container only lays them
  out and forwards SnippetProps. The configs currently live in code — the end
  state is the same objects persisted in the page config's `widgets` array.
  @keywords dashboard, home, homepage, grid, kpi, overview, panoramica
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import type { SnippetProps } from '$utils/runtime'
  import {
    monthlyRevenueWidgetConfig,
    revenueWidgetConfig,
    toCollectWidgetConfig,
    toInvoiceWidgetConfig,
    toShipWidgetConfig,
  } from '../../_shared/example-configs'
  import ChartWidget from '../../ChartWidget/default/ChartWidget.svelte'
  import KpiWidget from '../../KpiWidget/default/KpiWidget.svelte'

  const snippetProps: SnippetProps = $props()
</script>

<div class="flex flex-col gap-4">
  <div>
    <h1 class="text-xl font-semibold">{m.dashboard_title()}</h1>
    <p class="text-sm text-muted-foreground">{m.dashboard_subtitle()}</p>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiWidget config={revenueWidgetConfig} {...snippetProps} />
    <KpiWidget config={toShipWidgetConfig} {...snippetProps} />
    <KpiWidget config={toInvoiceWidgetConfig} {...snippetProps} />
    <KpiWidget config={toCollectWidgetConfig} {...snippetProps} />
  </div>

  <ChartWidget config={monthlyRevenueWidgetConfig} {...snippetProps} />
</div>
