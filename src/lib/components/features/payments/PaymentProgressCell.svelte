<!--
  @component PaymentProgressCell
  @description Compact table cell condensing a scadenza's collection progress
  into two lines: the residual left to collect is emphasised, "paid / total" is
  shown muted underneath. Mirrors QuantityProgressCell so the wide payments
  tables read consistently. Amounts are formatted with the invoice currency.
  @keywords payment, scadenza, residual, paid, collected, progress, cell, table
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import type { Currency } from '$lib/types/api-types'
  import { floatToPriceString } from '$lib/utils/prices'

  let {
    residual,
    paid,
    total,
    currency,
  }: { residual: number; paid: number; total: number; currency?: Currency | string | null } = $props()
</script>

<div class="flex flex-col leading-tight">
  <span class="text-sm">
    <span class="text-muted-foreground">{m.amount_residual()}:</span>
    <span class="font-medium">{floatToPriceString(residual, currency ?? undefined)}</span>
  </span>
  <span class="text-xs text-muted-foreground">
    {m.amount_paid()}
    {floatToPriceString(paid, currency ?? undefined)} / {floatToPriceString(total, currency ?? undefined)}
  </span>
</div>
