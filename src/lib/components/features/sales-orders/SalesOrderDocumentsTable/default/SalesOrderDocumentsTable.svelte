<!--
  @component SalesOrderDocumentsTable
  @description Displays and manages documents (file attachments) associated with a sales order.
  Wraps the generic DocumentsTable with sales-order-specific API callbacks.
  Fetches, uploads, and deletes documents for a given sales order entity.
  Also provides sales order data to page state so SalesOrderSidebar is populated.
  @keywords sales-order, documents, table, upload, delete, files, attachments
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/sales-orders/{salesOrder} (Moddo API) -> SalesOrder
  @api GET /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}/documents (Moddo API) -> Document[]
  @api POST /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}/documents (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}/documents/{document} (Moddo API)
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { SalesOrderDocumentsTableContract as contract } from './SalesOrderDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Document, SalesOrder } from '$lib/types/api-types'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$utils/breadcrumb-title.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { SalesOrderDocumentsTableContract } from './SalesOrderDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const salesOrderId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const salesOrderHandle = useProvides(SalesOrderDocumentsTableContract, 'salesOrder')

  onMount(async () => {
    if (legalEntityId && salesOrderId) {
      const salesOrder = await apiRequest<SalesOrder>({
        url: `/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}`,
      })
      salesOrderHandle.set(salesOrder)
      breadcrumbTitle.setLabel('sales-order-details', salesOrder.document_number)
    }
  })

  onDestroy(() => {
    salesOrderHandle.unset()
    breadcrumbTitle.clearLabel('sales-order-details')
  })

  const fetchDocuments = $derived(
    legalEntityId && salesOrderId
      ? createApiFetcher<Document>(`/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}/documents`)
      : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({
      url: `/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}/documents`,
      body: formData,
    })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({
      url: `/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}/documents/${doc.id}`,
      method: 'DELETE',
    })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({
      url: `/legal-entities/${legalEntityId}/sales-orders/${salesOrderId}/documents/${doc.id}`,
    })
  }
</script>

{#if legalEntityId && salesOrderId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
