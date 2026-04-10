<!--
  @component SalesOrderTagBadges
  @description Renders sales order tags (sent) as status badges.
  Uses "active" variant for sent tag.
  @keywords sales-order, tags, badges, status, sent
  @uses DocumentTagBadges
-->
<script lang="ts">
  import DocumentTagBadges from '$lib/components/core/DocumentTagBadges.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { SalesOrderTag } from '$lib/types/api-types'
  import { getSalesOrderTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: SalesOrderTag[]
  }

  let { tags }: Props = $props()

  function getVariant(_tag: string): StatusVariant {
    return 'active'
  }
</script>

<DocumentTagBadges {tags} getLabel={tag => getSalesOrderTagLabel(tag as SalesOrderTag)} {getVariant} />
