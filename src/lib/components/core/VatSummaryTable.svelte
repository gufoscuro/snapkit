<!--
  @component VatSummaryTable
  @description Displays a document's VAT breakdown ("riepilogo IVA") as a compact table:
  one row per VAT-rate bucket with code, description, rate, taxable (net) and tax amounts.
  Right-aligned numeric columns with tabular figures, styled to match the document totals.
  Pairs with StackedAmountValues on quotations, sales orders and invoices.
  @keywords vat, tax, summary, breakdown, riepilogo iva, document, totals
  @uses formatPriceDisplay, getCurrencySymbol, formatNumber
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages'
  import type { VatSummaryEntry } from '$lib/types/api-types'
  import { formatNumber } from '$lib/utils/numbers'
  import { formatPriceDisplay, getCurrencySymbol } from '$lib/utils/prices'
  import { fade } from 'svelte/transition'

  type Props = {
    /** VAT breakdown rows (one per rate bucket). */
    rows: VatSummaryEntry[] | undefined | null
    /** Currency code used to format the taxable/tax amounts. */
    currencyCode?: string
    /** Title above the table (default: m.vat_summary()). */
    title?: string
    /** Additional CSS classes. */
    class?: string
  }

  let { rows, currencyCode, title = m.vat_summary(), class: className = '' }: Props = $props()

  const visibleRows = $derived(rows ?? [])

  const symbol = $derived(currencyCode ? getCurrencySymbol(currencyCode) : '')

  function amount(value: number): string {
    return `${formatPriceDisplay(value, currencyCode)}${symbol ? ` ${symbol}` : ''}`
  }
</script>

{#if visibleRows.length > 0}
  <div class="flex flex-col {className}">
    <div class="mb-1 text-sm leading-6 font-medium">{title}</div>
    {#key JSON.stringify(visibleRows)}
      <div in:fade={{ duration: 200, delay: 100 }}>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th class="py-1 pr-3 text-left font-medium">{m.code()}</th>
              <th class="py-1 pr-3 text-left font-medium">{m.description()}</th>
              <th class="py-1 pr-3 text-right font-medium">{m.vat_rate()}</th>
              <th class="py-1 pr-3 text-right font-medium">{m.taxable_amount()}</th>
              <th class="py-1 text-right font-medium">{m.tax_amount()}</th>
            </tr>
          </thead>
          <tbody>
            {#each visibleRows as row, index (row.code + index)}
              <tr class="border-b last:border-b-0">
                <td class="py-1.5 pr-3 align-top font-medium">{row.code}</td>
                <td class="py-1.5 pr-3 align-top text-muted-foreground">{row.description}</td>
                <td class="py-1.5 pr-3 text-right align-top tabular-nums"
                  >{formatNumber(row.rate, { decimals: 2 })}%</td>
                <td class="py-1.5 pr-3 text-right align-top font-medium tabular-nums">{amount(row.net)}</td>
                <td class="py-1.5 text-right align-top font-medium tabular-nums">{amount(row.tax)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/key}
  </div>
{/if}
