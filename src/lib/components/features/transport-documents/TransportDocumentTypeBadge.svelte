<!--
  @component TransportDocumentTypeBadge
  @description Badge showing the transport document type (sale, export, intra_eu, ...).
  Type is derived server-side from the sales_transaction_type.
  Renders nothing when type is null.
  @keywords transport-document, ddt, type, badge
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import type { TransportDocumentType } from '$lib/types/api-types'
  import { getTransportDocumentTypeLabel } from '$lib/utils/enum-labels'

  let { type }: { type: TransportDocumentType | null } = $props()
</script>

{#if type}
  <Badge variant="outline" class="px-1.5 font-normal">
    {getTransportDocumentTypeLabel(type)}
  </Badge>
{/if}
