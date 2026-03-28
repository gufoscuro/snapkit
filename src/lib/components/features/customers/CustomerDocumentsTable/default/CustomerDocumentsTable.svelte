<!--
  @component CustomerDocumentsTable
  @description Displays and manages documents associated with a customer.
  Wraps the generic DocumentsTable with customer-specific API callbacks.
  Fetches, uploads, and deletes documents for a given customer entity.
  Also provides customer data to page state so CustomerSidebar is populated.
  @keywords customer, documents, table, upload, delete, files
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/customers/{customer} (Moddo API) -> Customer
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/documents (Moddo API) -> Document[]
  @api POST /api/legal-entities/{legalEntity}/customers/{customer}/documents (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer}/documents/{document} (Moddo API)
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { CustomerDocumentsTableContract as contract } from './CustomerDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Customer, Document } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { CustomerDocumentsTableContract } from './CustomerDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const customerId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const customerHandle = useProvides(CustomerDocumentsTableContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && customerId) {
      const customer = await apiRequest<Customer>({
        url: `/legal-entities/${legalEntityId}/customers/${customerId}`,
      })
      customerHandle.set(customer)
      breadcrumbTitle.setLabel('customer-details', customer.name)
    }
  })

  onDestroy(() => {
    customerHandle.unset()
    breadcrumbTitle.clearLabel('customer-details')
  })

  const fetchDocuments = $derived(
    legalEntityId && customerId
      ? createApiFetcher<Document>(`/legal-entities/${legalEntityId}/customers/${customerId}/documents`)
      : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({
      url: `/legal-entities/${legalEntityId}/customers/${customerId}/documents`,
      body: formData,
    })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({
      url: `/legal-entities/${legalEntityId}/customers/${customerId}/documents/${doc.id}`,
      method: 'DELETE',
    })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({
      url: `/legal-entities/${legalEntityId}/customers/${customerId}/documents/${doc.id}`,
    })
  }
</script>

{#if legalEntityId && customerId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
