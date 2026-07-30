<!--
  @component PriceHistoryChart
  @description Scatter of effective unit price over document date for the loaded
  price-history lines. Makes volume pricing readable at a glance: a column of
  points at €5 with one outlier at €10 says more in half a second than the same
  two rows in a table do.

  NOT CURRENTLY RENDERED — ItemPriceHistory doesn't mount it. Parked on
  2026-07-30 after the axis/scale wiring kept fighting back: layerchart's
  ScatterChart hands axis ticks over in a form that depends on the inferred
  scale, and getting a proportional time axis without pulling d3-scale in as a
  direct dependency needs more care than the summary + table were worth
  delaying. The component is left intact and self-contained; re-enable by
  rendering it again from ItemPriceHistory.
  @keywords price, history, chart, scatter, item, layerchart
  @uses ui/chart, layerchart
-->
<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Chart from '$lib/components/ui/chart'
  import * as m from '$lib/paraglide/messages'
  import type { ItemDocumentLine } from '$lib/types/api-types'
  import { renderPrice } from '$utils/prices.js'
  import { ScatterChart } from 'layerchart'
  import { formatAxisDay, toUtcDate } from './format.js'

  let {
    rows,
    currency,
    /** Rows in the whole filtered set, from `meta.total`. */
    total,
  }: {
    rows: ItemDocumentLine[]
    currency: string | undefined
    total: number | undefined
  } = $props()

  type Point = {
    /**
     * Epoch milliseconds, not a Date. The chart puts a numeric scale on this,
     * which keeps the gaps between sales proportional to the time between them
     * — a categorical axis would place two sales a year apart as close as two
     * on consecutive days, which is the one thing this chart must not do.
     * Ticks come back out as numbers, hence `formatAxisDay` rather than a
     * Date-only formatter.
     */
    date: number
    price: number
    label: string
    customer: string
    quantity: string
  }

  // Lines with no effective price (zero/null quantity) have nothing to plot.
  const points = $derived.by<Point[]>(() =>
    rows.flatMap(row => {
      const date = toUtcDate(row.document_date)
      if (!date || row.effective_unit_price === null) return []
      return [
        {
          date: date.getTime(),
          price: row.effective_unit_price,
          label: row.document_number,
          customer: row.customer_name ?? '-',
          quantity: `${row.quantity.toLocaleString()} ${row.uom}`,
        },
      ]
    }),
  )

  // The chart can only draw what the table has fetched. Saying so is the honest
  // alternative to silently presenting page 1 as the whole price history.
  const isPartial = $derived(total !== undefined && rows.length < total)

  const chartConfig = {
    price: { label: m.price(), color: 'var(--primary)' },
  } satisfies Chart.ChartConfig
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{m.price_history_chart_title()}</Card.Title>
    <Card.Description>
      {#if isPartial}
        {m.price_history_chart_partial({ loaded: points.length, total: total ?? 0 })}
      {:else}
        {m.price_history_chart_subtitle()}
      {/if}
    </Card.Description>
  </Card.Header>

  <Card.Content>
    <Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
      <ScatterChart
        data={points}
        x="date"
        y="price"
        series={[{ key: 'price', label: m.price(), color: 'var(--color-price)' }]}
        props={{
          points: { r: 4, class: 'opacity-70' },
          xAxis: { format: formatAxisDay, ticks: 5 },
          yAxis: { format: (v: number) => renderPrice(v, currency) },
        }}>
        {#snippet tooltip()}
          <Chart.Tooltip hideLabel indicator="dot" formatter={pointRow} />
        {/snippet}
      </ScatterChart>
    </Chart.Container>
  </Card.Content>
</Card.Root>

{#snippet pointRow({ item }: { item: { payload?: Point } })}
  {@const point = item.payload}
  {#if point}
    <div class="flex flex-col gap-0.5">
      <span class="font-medium">{point.label}</span>
      <span class="text-muted-foreground">{point.customer}</span>
      <span class="tabular-nums">{point.quantity} · {renderPrice(point.price, currency)}</span>
    </div>
  {/if}
{/snippet}
