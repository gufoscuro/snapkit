<!--
  @component ImportRecordPreview
  @description Hover-card preview body for an upstream document inside ImportMenu.
  Renders header (document_number + optional date + optional subtitle), an
  optional amount + items count line, and an optional truncated list of items
  via the `itemRow` snippet. Designed to be source-shape agnostic so it can be
  reused across Quotation/SO/WO previews in different Details components.
  @keywords import, preview, hover, dropdown
-->
<script lang="ts" generics="T">
  import * as m from '$lib/paraglide/messages'
  import type { Snippet } from 'svelte'

  type Props = {
    /** Document number (e.g. "Q-001234"). */
    documentNumber: string
    /** Document date — accepts ISO string or Date. Rendered with `toLocaleDateString`. */
    documentDate?: string | Date
    /** Single optional subtitle line (typically the customer name). */
    subtitle?: string
    /** Pre-formatted amount string (e.g. `floatToPriceString(net_value, currency)`). */
    amount?: string
    /** Items used for the count and the (optional) row list. */
    items?: T[]
    /** Max items rendered in the list before showing the "+N more" indicator. */
    maxItems?: number
    /** Snippet that renders one item row. If omitted, the items list is not rendered (only the count line). */
    itemRow?: Snippet<[T]>
    /** Override label for items count (defaults to `m.items()`). */
    itemsLabel?: string
  }

  let {
    documentNumber,
    documentDate,
    subtitle,
    amount,
    items,
    maxItems = 10,
    itemRow,
    itemsLabel,
  }: Props = $props()

  const formattedDate = $derived(documentDate ? new Date(documentDate).toLocaleDateString() : undefined)
  const itemsToShow = $derived(items?.slice(0, maxItems) ?? [])
  const remainingCount = $derived((items?.length ?? 0) - itemsToShow.length)
  const hasItems = $derived((items?.length ?? 0) > 0)
</script>

<div class="space-y-2">
  <div>
    <p class="text-sm font-semibold">{documentNumber}</p>
    {#if formattedDate}
      <p class="text-xs text-muted-foreground">{formattedDate}</p>
    {/if}
    {#if subtitle}
      <p class="text-xs text-muted-foreground">{subtitle}</p>
    {/if}
  </div>

  {#if hasItems || amount}
    <div class="flex items-baseline justify-between text-xs">
      {#if hasItems}
        <span class="text-muted-foreground">{items!.length} {itemsLabel ?? m.items()}</span>
      {:else}
        <span></span>
      {/if}
      {#if amount}
        <span class="font-medium">{amount}</span>
      {/if}
    </div>
  {/if}

  {#if itemRow && hasItems}
    <div class="space-y-1 border-t pt-2">
      {#each itemsToShow as item, idx (idx)}
        {@render itemRow(item)}
      {/each}
      {#if remainingCount > 0}
        <p class="text-xs text-muted-foreground">+{remainingCount} {itemsLabel ?? m.items()}…</p>
      {/if}
    </div>
  {/if}
</div>
