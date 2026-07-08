<!--
  @component MonthlyRevenueChart
  @description Self-enclosed bar chart: revenue (€) by month over the last 12
  months. Lazily fetches its own data and handles loading / error / empty
  states. Falls back to a mock until the endpoint ships. The current month is
  still open (partial) and flagged with a caption.
  @keywords dashboard, chart, bar, histogram, revenue, sales, monthly, venduto
  @uses ui/chart, layerchart
  @api GET /api/legal-entities/{legalEntity}/dashboard/charts/monthly-revenue (proposed) -> MonthlyRevenueResponse
-->
<script lang="ts">
  import { BarChart } from 'layerchart'
  import * as Card from '$lib/components/ui/card'
  import * as Chart from '$lib/components/ui/chart'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { IsMobile } from '$lib/hooks/is-mobile.svelte'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import type { DataWrapper } from '$lib/types/api-types'
  import * as m from '$lib/paraglide/messages.js'
  import { renderPrice } from '$lib/utils/prices'
  import { apiRequest } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/circle-alert'
  import RotateCwIcon from '@lucide/svelte/icons/rotate-cw'
  import ChartColumnIcon from '@lucide/svelte/icons/chart-column'
  import type { MonthlyRevenueResponse } from '../../_shared/types'
  import { withMockFallback, type Sourced } from '../../_shared/with-mock-fallback'
  import { mockMonthlyRevenue } from './MonthlyRevenueChart.mock'

  let { legalEntity }: SnippetProps = $props()
  const leId = $derived(legalEntity?.id)

  const resource = new Resource<Sourced<MonthlyRevenueResponse>>(() =>
    withMockFallback(
      () =>
        apiRequest<DataWrapper<MonthlyRevenueResponse>>({
          url: `/legal-entities/${leId}/dashboard/charts/monthly-revenue`,
          queryParams: { months: 12 },
        }).then((r) => r.data),
      mockMonthlyRevenue
    )
  )

  const payload = $derived(resource.data?.value)
  const series = $derived(payload?.series ?? [])
  const currency = $derived(payload?.currency ?? 'EUR')
  const isEmpty = $derived(!!payload && series.length === 0)

  // On narrow viewports the 12 month labels clash, so show only the last 6.
  const isMobile = new IsMobile()
  const displaySeries = $derived(isMobile.current ? series.slice(-6) : series)

  const chartConfig = {
    total: { label: m.dashboard_chart_series_label(), color: 'var(--primary)' },
  } satisfies Chart.ChartConfig
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <ChartColumnIcon class="size-4 text-muted-foreground" />
      {m.dashboard_chart_title()}
    </Card.Title>
    <Card.Description>{m.dashboard_chart_subtitle()}</Card.Description>
    {#if resource.data?.demo && !resource.loading}
      <Card.Action>
        <Badge variant="outline" class="text-[10px] font-normal text-muted-foreground">demo</Badge>
      </Card.Action>
    {/if}
  </Card.Header>

  <Card.Content>
    {#if resource.loading}
      <Skeleton class="h-70 w-full" />
    {:else if resource.error}
      <div class="flex h-70 flex-col items-center justify-center gap-3 text-center">
        <AlertCircleIcon class="size-6 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          {resource.error === 'error' ? m.dashboard_load_error() : resource.error}
        </p>
        <Button variant="outline" size="sm" onclick={resource.reload}>
          <RotateCwIcon class="size-3.5" />
          {m.retry()}
        </Button>
      </div>
    {:else if isEmpty}
      <div class="flex h-70 flex-col items-center justify-center gap-2 text-center">
        <ChartColumnIcon class="size-6 text-muted-foreground/60" />
        <p class="text-sm text-muted-foreground">{m.dashboard_chart_empty()}</p>
      </div>
    {:else}
      <Chart.Container config={chartConfig} class="aspect-auto h-70 w-full">
        <BarChart
          data={displaySeries}
          x="label"
          series={[
            { key: 'total', label: m.dashboard_chart_series_label(), color: 'var(--color-total)' },
          ]}
          axis="x"
          grid={false}
          props={{
            bars: { stroke: 'none', rounded: 'top', radius: 4, initialHeight: 0 },
            highlight: { area: { fill: 'none' } },
            xAxis: { format: (v: string) => v },
          }}>
          {#snippet tooltip()}
            <Chart.Tooltip labelKey="label" nameKey="total" indicator="dot" formatter={priceRow} />
          {/snippet}
        </BarChart>
      </Chart.Container>

      {#if payload?.partial_from}
        <p class="mt-3 text-xs text-muted-foreground">{m.dashboard_chart_partial_note()}</p>
      {/if}
    {/if}
  </Card.Content>
</Card.Root>

{#snippet priceRow({ value }: { value: unknown })}
  <span class="text-muted-foreground">{m.dashboard_chart_series_label()}</span>
  <span class="ml-auto font-medium tabular-nums">{renderPrice(Number(value), currency)}</span>
{/snippet}
