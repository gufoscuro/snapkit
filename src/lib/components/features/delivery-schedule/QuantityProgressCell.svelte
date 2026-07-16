<!--
  @component QuantityProgressCell
  @description Compact table cell condensing a delivery-schedule line's three
  quantities (ordered / shipped / remaining) into two lines: the residual to ship
  is emphasised (with its unit of measure), shipped-of-ordered is shown muted
  underneath. Lets one column replace three on the wide delivery-schedule tables.
  @keywords delivery, schedule, quantity, shipped, remaining, ordered, cell, table
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import type { UnitOfMeasure } from '$lib/types/api-types'

  let {
    ordered,
    shipped,
    remaining,
    uom,
  }: { ordered: number; shipped: number; remaining: number; uom?: UnitOfMeasure | null } = $props()
</script>

<div class="flex flex-col leading-tight">
  <span class="text-sm">
    <span class="text-muted-foreground">{m.quantity_remaining()}:</span>
    <span class="font-medium">{remaining}</span>
    {#if uom}<span class="text-xs text-muted-foreground">{uom}</span>{/if}
  </span>
  <span class="text-xs text-muted-foreground">
    {m.quantity_shipped()}
    {shipped} / {ordered}
  </span>
</div>
