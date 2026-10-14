<!--
  @component InvoicePaymentStatusBadge
  @description Outline badge showing the tri-state payment status of an invoice
  or a single scadenza (unpaid / partially paid / paid) with a matching icon.
  Renders nothing when `status` is null/undefined (schedule-less invoices, e.g.
  TD04 credit notes), so callers can pass the value straight through. Reads its
  label from `enum-labels`; `payable` switches to the supplier-side wording
  (Pagata instead of Incassato).
  @keywords invoice, payment, status, badge, paid, unpaid, receivable, scadenza
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import type { InvoicePaymentStatus } from '$lib/types/api-types'
  import { getInvoicePaymentStatusLabel, getSupplierPaymentStatusLabel } from '$lib/utils/enum-labels'
  import IconCircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import IconProgress from '@tabler/icons-svelte/icons/progress'

  let { status, payable = false }: { status: InvoicePaymentStatus | null | undefined; payable?: boolean } = $props()

  const label = $derived(
    status ? (payable ? getSupplierPaymentStatusLabel(status) : getInvoicePaymentStatusLabel(status)) : '',
  )
</script>

{#if status}
  <Badge variant="outline" class="px-1.5">
    {#if status === 'paid'}
      <IconCircleCheckFilled class="size-3 fill-green-500 dark:fill-green-400" />
    {:else if status === 'partially_paid'}
      <IconProgress class="size-3 text-amber-500 dark:text-amber-400" />
    {:else}
      <IconCircleDashed class="size-3 text-muted-foreground" />
    {/if}
    {label}
  </Badge>
{/if}
