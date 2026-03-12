<!--
  @component SupplierDocumentsTable
  @description Displays and manages documents associated with a supplier.
  Wraps the generic DocumentsTable with supplier-specific API callbacks.
  Fetches, uploads, and deletes documents for a given supplier entity.
  Also provides supplier data to page state so SupplierSidebar is populated.
  @keywords supplier, documents, table, upload, delete, files
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier} (Moddo API) -> Supplier
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/documents (Moddo API) -> Document[]
  @api POST /api/legal-entities/{legalEntity}/suppliers/{supplier}/documents (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/suppliers/{supplier}/documents/{document} (Moddo API)
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { SupplierDocumentsTableContract as contract } from './SupplierDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Document, Supplier } from '$lib/types/api-types'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { SupplierDocumentsTableContract } from './SupplierDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const supplierId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const supplierHandle = useProvides(SupplierDocumentsTableContract, 'supplier')

  onMount(async () => {
    if (legalEntityId && supplierId) {
      const supplier = await apiRequest<Supplier>({
        url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}`,
      })
      supplierHandle.set(supplier)
    }
  })

  onDestroy(() => {
    supplierHandle.unset()
  })

  const fetchDocuments = $derived(
    legalEntityId && supplierId
      ? createApiFetcher<Document>(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/documents`)
      : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({
      url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}/documents`,
      body: formData,
    })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({
      url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}/documents/${doc.id}`,
      method: 'DELETE',
    })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({
      url: `/legal-entities/${legalEntityId}/suppliers/${supplierId}/documents/${doc.id}`,
    })
  }
</script>

{#if legalEntityId && supplierId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
