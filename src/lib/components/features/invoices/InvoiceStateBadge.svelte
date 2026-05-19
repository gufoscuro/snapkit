<!--
  @component InvoiceStateBadge
  @description Outline badge showing the invoice's Acube/SDI state with a
  state icon (check / dashed / x / alert / archive). Pure presentational —
  reads label/variant from `enum-labels` so additions to the InvoiceState
  enum only require updating the labels map.
  @keywords invoice, state, badge, fatturapa, acube, sdi
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import type { InvoiceState } from '$lib/types/api-types'
  import { getInvoiceStateLabel } from '$lib/utils/enum-labels'
  import IconAlertCircle from '@tabler/icons-svelte/icons/alert-circle'
  import IconArchive from '@tabler/icons-svelte/icons/archive'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import IconCircleX from '@tabler/icons-svelte/icons/circle-x'

  let { state }: { state: InvoiceState } = $props()
</script>

<Badge variant="outline" class="px-1.5">
  {#if state === 'accepted'}
    <IconCircleCheck class="size-3 text-green-500 dark:text-green-400" />
  {:else if state === 'rejected'}
    <IconCircleX class="size-3 text-red-500 dark:text-red-400" />
  {:else if state === 'error'}
    <IconAlertCircle class="size-3 text-yellow-500 dark:text-yellow-400" />
  {:else if state === 'archived'}
    <IconArchive class="size-3 text-muted-foreground" />
  {:else}
    <IconCircleDashed class="size-3 text-muted-foreground" />
  {/if}
  {getInvoiceStateLabel(state)}
</Badge>
