<!--
  @component QuotationStatusBadge
  @description Badge showing quotation status with a colored state icon.
  Combines the outline Badge with the same icon indicators used in the QuotationsTable state column.
  @keywords quotation, status, badge, state
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import IconCircleX from '@tabler/icons-svelte/icons/circle-x'
  import type { Quotation } from '$lib/types/api-types'
  import { getQuotationStatusLabel } from '$lib/utils/enum-labels'

  let { state }: { state: Quotation['state'] } = $props()
</script>

<Badge variant="outline" class="px-1.5">
  {#if state === 'approved'}
    <IconCircleCheck class="size-3 text-green-500 dark:text-green-400" />
  {:else if state === 'rejected'}
    <IconCircleX class="size-3 text-red-500 dark:text-red-400" />
  {:else}
    <IconCircleDashed class="size-3 text-muted-foreground" />
  {/if}
  {getQuotationStatusLabel(state)}
</Badge>
