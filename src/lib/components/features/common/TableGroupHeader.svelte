<!--
  @component TableGroupHeader
  @description Full-width group header row content for the actionable lists (Da spedire /
  Da incassare / Da fatturare), where several rows belong to the same parent document.
  Shows the parent's code (optionally linked) and customer on one line, with room for
  parent-level metadata and actions on the right. The parent identity lives here instead
  of being repeated on every child row.
  Deliberately renders no row count: pagination stays row-level, so a group only shows the
  rows loaded so far and any count would read as a total the table cannot know.
  @keywords group, header, table, grouping, parent, document, customer, actionables
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    code,
    customerName,
    href,
    meta,
    actions,
  }: {
    code?: string | null
    customerName?: string | null
    href?: string
    /** Parent-level metadata (dates, badges) shown next to the identity */
    meta?: Snippet
    /** Parent-level actions, right-aligned */
    actions?: Snippet
  } = $props()

  const display = $derived(code || '-')
</script>

<div class="flex items-center justify-between gap-3">
  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
    {#if href}
      <a {href} class="text-sm font-semibold text-foreground hover:text-brand hover:underline">{display}</a>
    {:else}
      <span class="text-sm font-semibold text-foreground">{display}</span>
    {/if}
    <span class="text-xs text-muted-foreground">{customerName || '-'}</span>
    {#if meta}
      <span class="flex items-center gap-2 text-xs text-muted-foreground">{@render meta()}</span>
    {/if}
  </div>
  {#if actions}
    <div class="flex shrink-0 items-center gap-1">{@render actions()}</div>
  {/if}
</div>
