<!--
  @component SupplierInvoiceFlagBadges
  @description Row of warning badges for a received invoice's anomalies:
  quarantined (A-Cube), possible duplicate, due dates to review (schedule
  generated automatically) and due-dates mismatch (Σ scadenze ≠ netto a
  pagare). Renders nothing when the invoice is clean. Each flag is a warning,
  never a block.
  @keywords supplier invoice, received invoice, quarantine, duplicate, due dates, review, mismatch, badge, warning
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import * as m from '$lib/paraglide/messages'
  import IconAlertTriangle from '@tabler/icons-svelte/icons/alert-triangle'
  import IconCalendarQuestion from '@tabler/icons-svelte/icons/calendar-question'
  import IconCopy from '@tabler/icons-svelte/icons/copy'
  import IconScale from '@tabler/icons-svelte/icons/scale'

  let {
    quarantined = false,
    possibleDuplicate = false,
    dueDatesNeedReview = false,
    dueDatesMismatch = false,
  }: {
    quarantined?: boolean | null
    possibleDuplicate?: boolean | null
    dueDatesNeedReview?: boolean | null
    dueDatesMismatch?: boolean | null
  } = $props()
</script>

{#if quarantined || possibleDuplicate || dueDatesNeedReview || dueDatesMismatch}
  <div class="flex flex-wrap items-center gap-1">
    {#if quarantined}
      <Badge variant="outline" class="px-1.5">
        <IconAlertTriangle class="size-3 text-red-500 dark:text-red-400" />
        {m.supplier_invoice_flag_quarantined()}
      </Badge>
    {/if}
    {#if possibleDuplicate}
      <Badge variant="outline" class="px-1.5">
        <IconCopy class="size-3 text-amber-500 dark:text-amber-400" />
        {m.supplier_invoice_flag_possible_duplicate()}
      </Badge>
    {/if}
    {#if dueDatesNeedReview}
      <Badge variant="outline" class="px-1.5">
        <IconCalendarQuestion class="size-3 text-amber-500 dark:text-amber-400" />
        {m.supplier_invoice_flag_due_dates_need_review()}
      </Badge>
    {/if}
    {#if dueDatesMismatch}
      <Badge variant="outline" class="px-1.5">
        <IconScale class="size-3 text-amber-500 dark:text-amber-400" />
        {m.supplier_invoice_flag_due_dates_mismatch()}
      </Badge>
    {/if}
  </div>
{/if}
