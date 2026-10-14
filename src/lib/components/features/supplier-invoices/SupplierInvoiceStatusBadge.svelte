<!--
  @component SupplierInvoiceStatusBadge
  @description Outline badge for a received invoice's status: "Da agganciare"
  (no supplier linked yet — warning icon), "Nuova" (linked, never opened — dot)
  or "Vista". Reads its label from `enum-labels`.
  @keywords supplier invoice, received invoice, fattura ricevuta, status, badge, to link, new, viewed
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import type { SupplierInvoiceStatus } from '$lib/types/api-types'
  import { getSupplierInvoiceStatusLabel } from '$lib/utils/enum-labels'
  import IconCircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'
  import IconLinkOff from '@tabler/icons-svelte/icons/link-off'
  import IconPointFilled from '@tabler/icons-svelte/icons/point-filled'

  let { status }: { status: SupplierInvoiceStatus | null | undefined } = $props()
</script>

{#if status}
  <Badge variant="outline" class="px-1.5">
    {#if status === 'to_link'}
      <IconLinkOff class="size-3 text-amber-500 dark:text-amber-400" />
    {:else if status === 'new'}
      <IconPointFilled class="size-3 text-brand" />
    {:else}
      <IconCircleCheckFilled class="size-3 fill-muted-foreground" />
    {/if}
    {getSupplierInvoiceStatusLabel(status)}
  </Badge>
{/if}
