<!--
  @component QuantityCell
  @description Table cell for a line quantity with its unit of measure: the quantity is
  emphasised, the unit shown small and muted — the same treatment QuantityProgressCell
  gives the residual quantity. Renders nothing without a quantity (e.g. descriptive lines).
  @keywords quantity, uom, unit of measure, cell, table, line
-->
<script lang="ts">
  let { quantity, uom }: { quantity?: number | null; uom?: string | null } = $props()
</script>

{#if quantity !== null && quantity !== undefined}
  <span class="text-sm">
    <span class="font-medium tabular-nums">{quantity}</span>
    {#if uom}<span class="text-xs text-muted-foreground">{uom}</span>{/if}
  </span>
{/if}
