<!--
  @component QuotationDocumentsTable
  @description Displays and manages documents (file attachments) associated with a quotation.
  Wraps the generic DocumentsTable with quotation-specific API callbacks.
  Fetches, uploads, and deletes documents for a given quotation entity.
  Also provides quotation data to page state so QuotationSidebar is populated.
  @keywords quotation, documents, table, upload, delete, files, attachments
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/quotations/{quotation} (Moddo API) -> Quotation
  @api GET /api/legal-entities/{legalEntity}/quotations/{quotation}/documents (Moddo API) -> Document[]
  @api POST /api/legal-entities/{legalEntity}/quotations/{quotation}/documents (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/quotations/{quotation}/documents/{document} (Moddo API)
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { QuotationDocumentsTableContract as contract } from './QuotationDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Document, Quotation } from '$lib/types/api-types'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$utils/breadcrumb-title.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { QuotationDocumentsTableContract } from './QuotationDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const quotationId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const quotationHandle = useProvides(QuotationDocumentsTableContract, 'quotation')

  onMount(async () => {
    if (legalEntityId && quotationId) {
      const quotation = await apiRequest<Quotation>({
        url: `/legal-entities/${legalEntityId}/quotations/${quotationId}`,
      })
      quotationHandle.set(quotation)
      breadcrumbTitle.setLabel('quotation-details', quotation.document_number)
    }
  })

  onDestroy(() => {
    quotationHandle.unset()
    breadcrumbTitle.clearLabel('quotation-details')
  })

  const fetchDocuments = $derived(
    legalEntityId && quotationId
      ? createApiFetcher<Document>(`/legal-entities/${legalEntityId}/quotations/${quotationId}/documents`)
      : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({
      url: `/legal-entities/${legalEntityId}/quotations/${quotationId}/documents`,
      body: formData,
    })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({
      url: `/legal-entities/${legalEntityId}/quotations/${quotationId}/documents/${doc.id}`,
      method: 'DELETE',
    })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({
      url: `/legal-entities/${legalEntityId}/quotations/${quotationId}/documents/${doc.id}`,
    })
  }
</script>

{#if legalEntityId && quotationId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
