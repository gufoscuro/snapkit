<!--
  @component KpiWidget
  @description Generic, config-driven KPI card. Given a `WidgetConfig`, it fetches
  its own stat endpoint (slug → stats namespace), maps the frozen `KpiPayload`
  onto the presentational StatCard, and wires primary + secondary deep-links
  declaratively. One renderer displays any KPI — new KPIs are added by authoring
  a config object, not a component. Falls back to a mock until the endpoint ships.
  @keywords dashboard, kpi, widget, generic, config-driven, stat
  @api GET /api/legal-entities/{legalEntity}/stats/kpis/{slug} (proposed) -> KpiPayload
-->
<script lang="ts">
  import { StatCard } from '$lib/components/core/StatCard'
  import type { StatCardSentiment } from '$lib/components/core/StatCard/types'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
  import { fetchKpiWidget } from '../../_shared/fetchers'
  import { formatTrend, formatValue } from '../../_shared/format'
  import { getWidgetIcon } from '../../_shared/widget-icons'
  import {
    resolveActionQuery,
    resolveLabel,
    type SecondaryMetricConfig,
    type Trend,
    type WidgetConfig,
  } from '../../_shared/widget-contracts'

  let { config, legalEntity }: SnippetProps & { config: WidgetConfig } = $props()

  const resource = new Resource(() => fetchKpiWidget(legalEntity?.id, config))
  const kpi = $derived(resource.data?.value)

  const title = $derived(resolveLabel(config.title))
  const IconComp = $derived(getWidgetIcon(config.icon))
  const subtext = $derived(config.display?.subtext ? resolveLabel(config.display.subtext) : undefined)
  const zeroSubtext = $derived(
    config.display?.zeroSubtext ? resolveLabel(config.display.zeroSubtext) : subtext
  )

  const isZero = $derived(kpi?.value === 0)
  const zeroPositive = $derived(!!config.display?.zeroIsPositive && isZero)

  const value = $derived(kpi ? formatValue(kpi.value, kpi.format, kpi.currency) : undefined)

  const trend = $derived(
    kpi?.trend
      ? { direction: kpi.trend.direction, label: formatTrend(kpi.trend), sentiment: trendSentiment(kpi.trend) }
      : undefined
  )

  const href = $derived.by(() => {
    if (!config.action) return undefined
    return createRoute({ $id: config.action.pageId, query: resolveActionQuery(config.action, kpi) })
  })

  // Secondary metrics resolved against the payload; zero-valued ones can opt out.
  const secondaries = $derived(
    (config.secondary ?? [])
      .map((cfg) => ({ cfg, n: kpi?.metrics?.[cfg.metricKey] ?? 0 }))
      .filter(({ cfg, n }) => !(cfg.hideWhenZero && n === 0))
  )

  function trendSentiment(t: Trend): StatCardSentiment {
    if (t.direction === 'flat') return 'neutral'
    const goodOutcome = (t.direction === 'up') === (t.positive_is_good ?? true)
    return goodOutcome ? 'positive' : 'negative'
  }

  function emphasisClass(emphasis: SecondaryMetricConfig['emphasis']): string {
    if (emphasis === 'danger') return 'text-red-600 dark:text-red-400'
    if (emphasis === 'warning') return 'text-amber-600 dark:text-amber-400'
    return 'font-medium'
  }

  function secondaryHref(cfg: SecondaryMetricConfig): string | undefined {
    if (!cfg.action) return undefined
    return createRoute({ $id: cfg.action.pageId, query: resolveActionQuery(cfg.action, kpi) })
  }

  function secondaryLabel(cfg: SecondaryMetricConfig, n: number): string {
    return resolveLabel(cfg.label, { value: n, count: n })
  }
</script>

<StatCard
  {title}
  loading={resource.loading}
  error={resource.error}
  onRetry={resource.reload}
  {value}
  {trend}
  tone={zeroPositive ? 'positive' : 'default'}
  href={href ?? undefined}
  demo={resource.data?.demo}
  icon={IconComp ? iconSnippet : undefined}>
  {#snippet footer()}
    {#if zeroPositive}
      {#if config.display?.zeroLabel}
        <div class="font-medium text-emerald-600 dark:text-emerald-400">
          {resolveLabel(config.display.zeroLabel)}
        </div>
      {/if}
      {#if zeroSubtext}<div class="text-muted-foreground">{zeroSubtext}</div>{/if}
    {:else}
      {#each secondaries as { cfg, n } (cfg.metricKey)}
        {#if secondaryHref(cfg)}
          <a
            href={secondaryHref(cfg)}
            class={'relative z-10 inline-flex w-fit items-center gap-1.5 font-medium hover:underline ' +
              emphasisClass(cfg.emphasis)}>
            {#if cfg.emphasis === 'warning' || cfg.emphasis === 'danger'}
              <TriangleAlertIcon class="size-4" />
            {/if}
            {secondaryLabel(cfg, n)}
          </a>
        {:else}
          <div class={'flex items-center gap-1.5 font-medium ' + emphasisClass(cfg.emphasis)}>
            {secondaryLabel(cfg, n)}
          </div>
        {/if}
      {/each}
      {#if subtext}<div class="text-muted-foreground">{subtext}</div>{/if}
    {/if}
  {/snippet}
</StatCard>

{#snippet iconSnippet()}
  {#if IconComp}<IconComp class="size-4" />{/if}
{/snippet}
