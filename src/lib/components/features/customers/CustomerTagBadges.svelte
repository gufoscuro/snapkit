<!--
  @component CustomerTagBadges
  @description Renders customer tags (suspended, ceased) as status badges with blocked variant.
  @keywords customer, tags, badges, status, blocked
  @uses StatusBadge
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { CustomerTag } from '$lib/types/api-types'
  import { getCustomerTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: CustomerTag[]
  }

  let { tags }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-1">
  {#each tags as tag (tag)}
    <StatusBadge variant="blocked" label={getCustomerTagLabel(tag)} />
  {/each}
</div>
