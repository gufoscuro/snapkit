<!--
  @component RecordCustomerCell
  @description Compact table cell stacking a record's identity: a document/record
  code as the primary (optionally linked) line, the customer name muted underneath.
  Shared across the actionable lists (Da spedire / Da incassare / Da fatturare) to
  fold a code column and a customer column into one. Falls back to plain text when
  no link is provided.
  @keywords record, document, code, customer, identity, cell, table, link, actionables
-->
<script lang="ts">
  let {
    code,
    customerName,
    href,
  }: { code?: string | null; customerName?: string | null; href?: string } = $props()

  const display = $derived(code || '-')
</script>

<div class="flex flex-col leading-tight">
  {#if href}
    <a {href} class="font-medium text-foreground hover:text-brand hover:underline">{display}</a>
  {:else}
    <span class="font-medium">{display}</span>
  {/if}
  <span class="text-xs text-muted-foreground">{customerName || '-'}</span>
</div>
