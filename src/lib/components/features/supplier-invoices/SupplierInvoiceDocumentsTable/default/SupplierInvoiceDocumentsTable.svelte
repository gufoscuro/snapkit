<!--
  @component SupplierInvoiceDocumentsTable
  @description User-uploaded documents attached to a received invoice. Wraps
  the generic DocumentsTable with supplier-invoice API callbacks (list, upload,
  download, delete). Distinct from the files embedded in the XML, which are
  listed read-only on the overview. Also provides the invoice to page state so
  SupplierInvoiceSidebar is populated on this subpage.
  @keywords supplier invoice, received invoice, documents, attachments, allegati, upload, delete, files
  @uses DocumentsTable
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice} -> SupplierInvoice
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/documents -> Document[]
  @api POST /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/documents
  @api DELETE /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/documents/{document}
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export { SupplierInvoiceDocumentsTableContract as contract } from './SupplierInvoiceDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { useProvides } from '$lib/contexts/page-state'
  import type { Document, SupplierInvoice } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { apiRequest, apiUploadRequest } from '$lib/utils/request'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import DocumentsTable from '../../../documents/DocumentsTable/default/DocumentsTable.svelte'
  import { SupplierInvoiceDocumentsTableContract } from './SupplierInvoiceDocumentsTable.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const invoiceId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)
  const baseUrl = $derived(`/legal-entities/${legalEntityId}/supplier-invoices/${invoiceId}`)

  const invoiceHandle = useProvides(SupplierInvoiceDocumentsTableContract, 'supplierInvoice')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && invoiceId) {
      const invoice = await apiRequest<SupplierInvoice>({ url: baseUrl })
      invoiceHandle.set(invoice)
      breadcrumbTitle.setLabel('supplier-invoice-details', invoice.document_number)
    }
  })

  onDestroy(() => {
    invoiceHandle.unset()
    breadcrumbTitle.clearLabel('supplier-invoice-details')
  })

  const fetchDocuments = $derived(
    legalEntityId && invoiceId ? createApiFetcher<Document>(`${baseUrl}/documents`) : null,
  )

  async function uploadDocument(file: File, description: string, tags: string[]): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    tags.forEach(tag => formData.append('tags[]', tag))

    return apiUploadRequest<Document>({ url: `${baseUrl}/documents`, body: formData })
  }

  async function deleteDocument(doc: Document): Promise<void> {
    await apiRequest({ url: `${baseUrl}/documents/${doc.id}`, method: 'DELETE' })
  }

  async function fetchDocument(doc: Document): Promise<Document> {
    return apiRequest<Document>({ url: `${baseUrl}/documents/${doc.id}` })
  }
</script>

{#if legalEntityId && invoiceId && fetchDocuments}
  <DocumentsTable {legalEntityId} {fetchDocuments} {uploadDocument} {deleteDocument} {fetchDocument} />
{/if}
