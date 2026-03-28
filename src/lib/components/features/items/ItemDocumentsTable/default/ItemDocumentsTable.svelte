<!--
  @component ItemDocumentsTable
  @description Displays and manages documents associated with an item.
  Wraps the generic DocumentsTable with item-specific API callbacks.
  Fetches, uploads, and deletes documents for a given item entity.
  Also provides item data to page state so ItemSidebar is populated.
  @keywords item, documents, table, upload, delete, files
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/items/{item} (Moddo API) -> Item
  @api GET /api/legal-entities/{legalEntity}/items/{item}/documents (Moddo API) -> Document[]
  @api POST /api/legal-entities/{legalEntity}/items/{item}/documents (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/items/{item}/documents/{document} (Moddo API)
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { ItemDocumentsTableContract as contract } from './ItemDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Document, Item } from '$lib/types/api-types'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$utils/breadcrumb-title.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { ItemDocumentsTableContract } from './ItemDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const itemId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const itemHandle = useProvides(ItemDocumentsTableContract, 'item')

  onMount(async () => {
    if (legalEntityId && itemId) {
      const item = await apiRequest<Item>({
        url: `/legal-entities/${legalEntityId}/items/${itemId}`,
      })
      itemHandle.set(item)
      breadcrumbTitle.setLabel('item-details', item.name)
    }
  })

  onDestroy(() => {
    itemHandle.unset()
  })

  const fetchDocuments = $derived(
    legalEntityId && itemId
      ? createApiFetcher<Document>(`/legal-entities/${legalEntityId}/items/${itemId}/documents`)
      : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({
      url: `/legal-entities/${legalEntityId}/items/${itemId}/documents`,
      body: formData,
    })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({
      url: `/legal-entities/${legalEntityId}/items/${itemId}/documents/${doc.id}`,
      method: 'DELETE',
    })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({
      url: `/legal-entities/${legalEntityId}/items/${itemId}/documents/${doc.id}`,
    })
  }
</script>

{#if legalEntityId && itemId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
