<!--
  @component PriceHistorySummary
  @description Stat tiles answering "what have we been charging for this
  article" over the whole filtered set (not the current page). When the set
  spans multiple units of measure or currencies the backend suppresses the
  numbers and this renders the reason plus a one-click fix instead.
  @keywords price, history, summary, stats, kpi, item
  @uses StatCard, Alert
-->
<script lang="ts">
  import * as Alert from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import { StatCard } from '$lib/components/core/StatCard'
  import * as m from '$lib/paraglide/messages'
  import { getLocale } from '$lib/paraglide/runtime'
  import type { ItemPriceHistoryAggregates } from '$lib/types/api-types'
  import { renderPrice } from '$utils/prices.js'
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
  import { formatCalendarDay } from './format.js'

  let {
    aggregates,
    currency,
    uom,
    loading = false,
    onFilterByUom,
  }: {
    aggregates: ItemPriceHistoryAggregates | null
    /** Currency of the set — meaningless (and unused) when `mixed_currency`. */
    currency: string | undefined
    /** UoM to offer as the disambiguating filter when `mixed_uom`. */
    uom: string | undefined
    loading?: boolean
    onFilterByUom?: (uom: string) => void
  } = $props()

  const summary = $derived(aggregates?.summary ?? null)

  const price = (value: number) => renderPrice(value, currency)

  const lastDate = $derived(formatCalendarDay(summary?.last_date))

  const quantityLabel = $derived(
    summary ? `${summary.total_quantity.toLocaleString(getLocale())}${uom ? ` ${uom}` : ''}` : undefined,
  )
</script>

{#if loading}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
      <StatCard title="" loading />
    {/each}
  </div>
{:else if summary}
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      title={m.price_history_last_price()}
      value={price(summary.last_price)}
      footerSubtext={lastDate} />

    <StatCard
      title={m.price_history_weighted_average()}
      value={price(summary.weighted_average_price)}
      footerSubtext={m.price_history_weighted_average_hint()} />

    <StatCard
      title={m.price_history_price_range()}
      value={`${price(summary.min_price)} – ${price(summary.max_price)}`}
      footerSubtext={m.price_history_price_range_hint()} />

    <StatCard
      title={m.price_history_total_quantity()}
      value={quantityLabel}
      footerSubtext={m.price_history_line_count({ count: summary.line_count })} />
  </div>
{:else if aggregates?.mixed_uom || aggregates?.mixed_currency}
  <!--
    A min/max across PZ and BOX (or EUR and USD) isn't a statistic, it's a
    category error: €48/BOX reads 10x dearer than €5/PZ even when it's cheaper
    per piece. The backend returns nothing rather than a misleading number.
  -->
  <Alert.Root>
    <TriangleAlertIcon class="size-4" />
    <Alert.Title>{m.price_history_summary_unavailable()}</Alert.Title>
    <Alert.Description class="flex flex-col items-start gap-2">
      {aggregates.mixed_uom ? m.price_history_mixed_uom() : m.price_history_mixed_currency()}

      {#if aggregates.mixed_uom && uom && onFilterByUom}
        <Button variant="outline" size="sm" onclick={() => onFilterByUom(uom)}>
          {m.price_history_filter_by_uom({ uom })}
        </Button>
      {/if}
    </Alert.Description>
  </Alert.Root>
{/if}
