<!--
  @component ChartWidget
  @description Generic, config-driven chart card. Given a `WidgetConfig` (type
  'chart'), it fetches its own chart endpoint (slug → stats/charts namespace),
  maps the frozen `ChartPayload` onto a layerchart bar/line chart, and handles
  loading / error / empty states. One renderer displays any series-based chart —
  new charts are added by authoring a config object. Falls back to a mock until
  the endpoint ships.
  @keywords dashboard, chart, widget, generic, config-driven, bar, line, histogram
  @uses ui/chart, layerchart
  @api GET /api/legal-entities/{legalEntity}/stats/charts/{slug} (proposed) -> ChartPayload
-->
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import * as Chart from '$lib/components/ui/chart'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { IsMobile } from '$lib/hooks/is-mobile.svelte'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/circle-alert'
  import ChartColumnIcon from '@lucide/svelte/icons/chart-column'
  import RotateCwIcon from '@lucide/svelte/icons/rotate-cw'
  import { BarChart, LineChart } from 'layerchart'
  import { fetchChartWidget } from '../../_shared/fetchers'
  import { formatChartLabel, formatValue } from '../../_shared/format'
  import { getWidgetIcon } from '../../_shared/widget-icons'
  import { resolveLabel, type WidgetConfig } from '../../_shared/widget-contracts'

  let { config, legalEntity }: SnippetProps & { config: WidgetConfig } = $props()

  const resource = new Resource(() => fetchChartWidget(legalEntity?.id, config))
  const payload = $derived(resource.data?.value)
  const points = $derived(payload?.points ?? [])
  const isEmpty = $derived(!!payload && points.length === 0)

  const title = $derived(resolveLabel(config.title))
  const subtitle = $derived(config.display?.subtitle ? resolveLabel(config.display.subtitle) : undefined)
  const footnote = $derived(config.display?.footnote ? resolveLabel(config.display.footnote) : undefined)
  const IconComp = $derived(getWidgetIcon(config.icon) ?? ChartColumnIcon)
  const chartType = $derived(config.display?.chartType ?? 'bar')

  const xKey = $derived(payload?.x_key ?? 'x')
  const currency = $derived(payload?.currency)
  const fmt = $derived(payload?.format ?? 'number')
  const seriesDefs = $derived(payload?.series ?? [])

  const paletteColor = (i: number) =>
    seriesDefs.length === 1 ? 'var(--primary)' : `var(--chart-${(i % 5) + 1})`

  // Labels come from config (the backend can't localize them); a series with no
  // config label falls back to "Serie N". Colors: config → payload hint → palette.
  const seriesInfo = $derived(
    seriesDefs.map((s, i) => {
      const cfg = config.display?.series?.[s.key]
      return {
        key: s.key,
        label: cfg?.label ? resolveLabel(cfg.label) : m.dashboard_chart_series_fallback({ n: i + 1 }),
        color: cfg?.color ?? s.color ?? paletteColor(i),
      }
    })
  )
  const primaryLabel = $derived(seriesInfo[0]?.label ?? '')

  // On narrow viewports the labels clash, so show only the last 6 points.
  // When `label_format` is set, the x value is a raw date the frontend localizes.
  const isMobile = new IsMobile()
  const displayPoints = $derived.by(() => {
    const slice = isMobile.current ? points.slice(-6) : points
    const lf = payload?.label_format
    if (!lf) return slice
    return slice.map((p) => ({ ...p, [xKey]: formatChartLabel(String(p[xKey]), lf) }))
  })

  // Chart.Container config: ChartStyle turns this into `--color-<key>` CSS vars.
  const chartConfig = $derived(
    Object.fromEntries(
      seriesInfo.map((s) => [s.key, { label: s.label, color: s.color }])
    ) satisfies Chart.ChartConfig
  )

  const chartSeries = $derived(
    seriesInfo.map((s) => ({ key: s.key, label: s.label, color: `var(--color-${s.key})` }))
  )
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <IconComp class="size-4 text-muted-foreground" />
      {title}
    </Card.Title>
    {#if subtitle}<Card.Description>{subtitle}</Card.Description>{/if}
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
        {#if chartType === 'line' || chartType === 'area'}
          <LineChart data={displayPoints} x={xKey} series={chartSeries} axis="x" grid={false}>
            {#snippet tooltip()}
              <Chart.Tooltip labelKey={xKey} indicator="dot" formatter={valueRow} />
            {/snippet}
          </LineChart>
        {:else}
          <BarChart
            data={displayPoints}
            x={xKey}
            series={chartSeries}
            axis="x"
            grid={false}
            props={{
              bars: { stroke: 'none', rounded: 'top', radius: 4, initialHeight: 0 },
              highlight: { area: { fill: 'none' } },
              xAxis: { format: (v: string) => v },
            }}>
            {#snippet tooltip()}
              <Chart.Tooltip labelKey={xKey} indicator="dot" formatter={valueRow} />
            {/snippet}
          </BarChart>
        {/if}
      </Chart.Container>

      {#if footnote}
        <p class="mt-3 text-xs text-muted-foreground">{footnote}</p>
      {/if}
    {/if}
  </Card.Content>
</Card.Root>

{#snippet valueRow({ value }: { value: unknown })}
  <span class="text-muted-foreground">{primaryLabel}</span>
  <span class="ml-auto font-medium tabular-nums">{formatValue(Number(value), fmt, currency)}</span>
{/snippet}
