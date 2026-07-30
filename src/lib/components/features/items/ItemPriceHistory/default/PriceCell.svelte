<!--
  @component PriceCell
  @description Renders the price of a price-history line: the effective unit
  price (what we actually sold at) as the primary figure, with the pre-discount
  list price and the discount shown muted underneath when they differ.
  @keywords price, discount, cell, table, price-history
  @uses ResourceTable component renderer
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages'
  import type { ItemDocumentLine } from '$lib/types/api-types'
  import { renderPrice } from '$utils/prices.js'

  let { row }: { row: ItemDocumentLine } = $props()

  const effective = $derived(row.effective_unit_price)

  // The BE divides net_value by quantity, so a zero- or null-quantity line has
  // no effective price at all. Falling back to unit_price would silently show a
  // list price as if it were realised — show nothing instead.
  const primary = $derived(effective === null ? undefined : renderPrice(effective, row.currency))

  // Only worth showing the "listino" line when the discount actually moved the
  // price; on an undiscounted line the two figures are the same number twice.
  const isDiscounted = $derived(effective !== null && row.unit_price !== effective)

  const discountLabel = $derived.by(() => {
    if (row.discount_percent) return `−${row.discount_percent}%`
    if (row.discount_amount) return `−${renderPrice(row.discount_amount, row.currency)}`
    return undefined
  })
</script>

<div class="flex flex-col leading-tight">
  <span class="font-medium tabular-nums">{primary ?? '-'}</span>

  {#if isDiscounted}
    <span class="text-xs text-muted-foreground tabular-nums">
      <span class="line-through">{renderPrice(row.unit_price, row.currency)}</span>
      {#if discountLabel}
        <span class="ml-1">{discountLabel}</span>
      {/if}
    </span>
  {:else if primary === undefined}
    <span class="text-xs text-muted-foreground">{m.price_history_no_effective_price()}</span>
  {/if}
</div>
