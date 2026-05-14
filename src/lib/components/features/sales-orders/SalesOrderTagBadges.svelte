<!--
  @component SalesOrderTagBadges
  @description Renders sales order tags as status badges with per-tag variants.
  @keywords sales-order, tags, badges, status, sent, advance-pending, direct-invoicing
  @uses DocumentTagBadges
-->
<script lang="ts">
  import DocumentTagBadges from '$lib/components/core/DocumentTagBadges.svelte'
  import type { SalesOrderTag } from '$lib/types/api-types'
  import { getSalesOrderTagLabel, getSalesOrderTagStatusVariant } from '$lib/utils/enum-labels'

  interface Props {
    tags: SalesOrderTag[]
  }

  let { tags }: Props = $props()
</script>

<DocumentTagBadges
  {tags}
  getLabel={tag => getSalesOrderTagLabel(tag as SalesOrderTag)}
  getVariant={tag => getSalesOrderTagStatusVariant(tag as SalesOrderTag)}
/>
