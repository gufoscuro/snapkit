<!--
  @component InvoiceableDocumentStatusBadge
  @description Badge showing the relevant status of an invoiceable document.
  Uses fulfillment_status when the source is a sales order, invoicing_status when
  the source is a transport document. Renders nothing when both are null.
  @keywords invoiceable-document, status, badge, fulfillment, invoicing
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.types'
  import type { InvoiceableDocument, SalesOrderFulfillmentStatus, TransportDocumentInvoicingStatus } from '$lib/types/api-types'
  import {
    getSalesOrderFulfillmentStatusLabel,
    getTransportDocumentInvoicingStatusLabel,
  } from '$lib/utils/enum-labels'

  let { row }: { row: InvoiceableDocument } = $props()

  function fulfillmentVariant(status: SalesOrderFulfillmentStatus): StatusVariant {
    if (status === 'fully_shipped') return 'active'
    if (status === 'partially_shipped') return 'in-progress'
    if (status === 'picked') return 'paused'
    return 'neutral'
  }

  function invoicingVariant(status: TransportDocumentInvoicingStatus): StatusVariant {
    if (status === 'full') return 'active'
    if (status === 'partial') return 'in-progress'
    return 'neutral'
  }
</script>

{#if row.source.type === 'sales_order' && row.fulfillment_status}
  <StatusBadge
    variant={fulfillmentVariant(row.fulfillment_status)}
    label={getSalesOrderFulfillmentStatusLabel(row.fulfillment_status)} />
{:else if row.source.type === 'transport_document' && row.invoicing_status}
  <StatusBadge
    variant={invoicingVariant(row.invoicing_status)}
    label={getTransportDocumentInvoicingStatusLabel(row.invoicing_status)} />
{/if}
