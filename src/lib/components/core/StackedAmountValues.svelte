<!--
  @component StackedAmountValues
  @description Displays a vertical stack of labeled currency amounts, right-aligned.
  Useful for showing computed values like net value, tax, total in compact card layouts.
  @keywords amount, values, currency, stacked, summary
-->
<script lang="ts">
  import * as m from '$lib/paraglide/messages'
  import { fade } from 'svelte/transition'

  type AmountRow = {
    label: string
    value: number | undefined | null
    currencySymbol?: string
    hidden?: boolean
  }

  type Props = {
    /** Title above the values (default: m.values()) */
    title?: string
    /** Array of amount rows to display */
    rows: AmountRow[]
    /** Additional CSS classes */
    class?: string
  }

  let { title = m.values(), rows, class: className = '' }: Props = $props()

  const visibleRows = $derived(rows.filter(r => !r.hidden))
</script>

{#if visibleRows.length > 0}
  <div class="flex flex-col justify-end {className}">
    <!-- <div class="mb-1 border-b text-right text-sm leading-6 font-medium">{title}</div> -->
    {#key JSON.stringify(visibleRows)}
      <div in:fade={{ duration: 200, delay: 100 }}>
        {#each visibleRows as row, index (row.label + index)}
          <div class="flex items-center justify-end gap-2 text-sm">
            <div class="text-muted-foreground">{row.label}</div>
            <div class="min-w-24 text-right font-medium tabular-nums">
              {row.value
                ? row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '-'}
              {row.value && row.currencySymbol ? row.currencySymbol : ''}
            </div>
          </div>
        {/each}
      </div>
    {/key}
  </div>
{/if}
