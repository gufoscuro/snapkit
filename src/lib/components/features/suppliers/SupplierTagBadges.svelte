<!--
  @component SupplierTagBadges
  @description Renders supplier tags (suspended, ceased) as status badges with blocked variant.
  @keywords supplier, tags, badges, status, blocked
  @uses StatusBadge
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { SupplierTag } from '$lib/types/api-types'
  import { getSupplierTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: SupplierTag[]
  }

  let { tags }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-1">
  {#each tags as tag (tag)}
    <StatusBadge variant="blocked" label={getSupplierTagLabel(tag)} />
  {/each}
</div>
