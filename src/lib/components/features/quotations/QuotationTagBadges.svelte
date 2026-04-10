<!--
  @component QuotationTagBadges
  @description Renders quotation tags (expired, sent) as status badges.
  Uses "blocked" variant for expired and "active" variant for sent.
  @keywords quotation, tags, badges, status, expired, sent
  @uses DocumentTagBadges
-->
<script lang="ts">
  import DocumentTagBadges from '$lib/components/core/DocumentTagBadges.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { QuotationTag } from '$lib/types/api-types'
  import { getQuotationTagLabel } from '$lib/utils/enum-labels'

  interface Props {
    tags: QuotationTag[]
  }

  let { tags }: Props = $props()

  function getVariant(tag: string): StatusVariant {
    if (tag === 'expired') return 'blocked'
    return 'active'
  }
</script>

<DocumentTagBadges {tags} getLabel={tag => getQuotationTagLabel(tag as QuotationTag)} {getVariant} />
