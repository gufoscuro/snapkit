<!--
  @component TransportDocumentInvoicingBadge
  @description Badge showing the invoicing status of a transport document.
  Renders nothing when invoicing_status is null.
  @keywords transport-document, ddt, invoicing, badge, status
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { TransportDocumentInvoicingStatus } from '$lib/types/api-types'
  import { getTransportDocumentInvoicingStatusLabel } from '$lib/utils/enum-labels'

  let { invoicingStatus }: { invoicingStatus: TransportDocumentInvoicingStatus | null } = $props()

  function getVariant(status: TransportDocumentInvoicingStatus): StatusVariant {
    if (status === 'full') return 'active'
    if (status === 'partial') return 'in-progress'
    return 'neutral'
  }
</script>

{#if invoicingStatus}
  <StatusBadge
    variant={getVariant(invoicingStatus)}
    label={getTransportDocumentInvoicingStatusLabel(invoicingStatus)} />
{/if}
