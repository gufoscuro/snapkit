<!--
  @component QuotationTagBadges
  @description Renders quotation tags (expired, sent) as status badges.
  Uses "blocked" variant for expired and "active" variant for sent.
  @keywords quotation, tags, badges, status, expired, sent
  @uses StatusBadge
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { QuotationTag } from '$lib/types/api-types'
  import { getQuotationTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: QuotationTag[]
  }

  let { tags }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-1">
  {#each tags as tag (tag)}
    {#if tag === 'expired'}
      <StatusBadge variant="blocked" label={getQuotationTagLabel(tag)} />
    {:else}
      <StatusBadge variant="active" label={getQuotationTagLabel(tag)} />
    {/if}
  {/each}
</div>
