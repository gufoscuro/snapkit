<!--
  @component WarehouseOrderTagBadges
  @description Renders warehouse order tags (transport_document_generated) as status badges.
  @keywords warehouse-order, tags, badges, status
  @uses DocumentTagBadges
-->
<script lang="ts">
  import DocumentTagBadges from '$lib/components/core/DocumentTagBadges.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { WarehouseOrderTag } from '$lib/types/api-types'
  import { getWarehouseOrderTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: WarehouseOrderTag[]
  }

  let { tags }: Props = $props()

  function getVariant(_tag: string): StatusVariant {
    return 'active'
  }
</script>

<DocumentTagBadges {tags} getLabel={tag => getWarehouseOrderTagLabel(tag as WarehouseOrderTag)} {getVariant} />
