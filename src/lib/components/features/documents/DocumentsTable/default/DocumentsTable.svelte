<!--
  @component DocumentsTable
  @description Generic document listing table with upload and delete capabilities.
  Accepts callbacks for data fetching, uploading, and deleting documents.
  Shows filename, type, size, description, uploader, date. Includes an Upload button
  that opens a dialog with a file drop zone and tag selector.
  @keywords documents, table, upload, delete, files, listing
  @uses ResourceTable, UploadDocumentDialog
-->
<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import CategoryBadges from '$lib/components/features/supply/CategoryBadges.svelte'
  import { Button } from '$lib/components/ui/button'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  import { displaySize } from '$lib/components/ui/file-drop-zone'
  import * as m from '$lib/paraglide/messages.js'
  import type { Document } from '$lib/types/api-types'
  import type { FilterQuery, PaginatedResponse } from '$lib/utils/filters'
  import { Trash2, Upload } from 'lucide-svelte'
  import UploadDocumentDialog from '../../UploadDocumentDialog/default/UploadDocumentDialog.svelte'
  import DownloadLink from './DownloadLink.svelte'

  type Props = {
    legalEntityId: string
    fetchDocuments: (page: number, filters?: FilterQuery) => Promise<PaginatedResponse<Document>>
    uploadDocument: (file: File, description: string, tags: string[]) => Promise<Document>
    deleteDocument: (doc: Document) => Promise<void>
    fetchDocument?: (doc: Document) => Promise<Document>
  }

  let { legalEntityId, fetchDocuments, uploadDocument, deleteDocument, fetchDocument }: Props = $props()

  let uploadDialogOpen = $state(false)
  let tableKey = $state(0)

  const columns: ColumnConfig<Document>[] = [
    ...(fetchDocument
      ? [
          {
            accessorKey: 'original_filename',
            header: m.document_file(),
            renderer: 'component' as const,
            rendererConfig: {
              component: DownloadLink,
              propsMapper: (doc: Document) => ({
                label: doc.original_filename,
                onDownload: () => fetchDocument!(doc),
              }),
            },
          },
        ]
      : [
          {
            accessorKey: 'original_filename',
            header: m.document_file(),
            renderer: 'text' as const,
          },
        ]),
    {
      accessorKey: 'description',
      header: m.document_description(),
      renderer: 'text',
      meta: { cellClassName: 'text-xs line-clamp-2 max-w-xs' },
    },
    {
      accessorKey: 'mime_type',
      header: m.document_mime_type(),
      renderer: 'text',
    },
    {
      accessorKey: 'size',
      header: m.document_size(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: doc => displaySize(doc.size),
      },
    },
    {
      accessorKey: 'created_at',
      header: m.document_uploaded_at(),
      renderer: 'date',
    },
    {
      header: m.document_tags(),
      renderer: 'component',
      rendererConfig: {
        component: CategoryBadges,
        propsMapper: doc => ({ categories: doc.tags?.map(t => t.name) ?? [] }),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          {
            icon: Trash2,
            variant: 'ghost',
            onClick: async (doc, helpers) => {
              await confirmArchive({
                title: m.confirm_action(),
                description: m.delete_document_confirmation({ filename: doc.original_filename }),
                confirmText: m.common_delete(),
                cancelText: m.common_cancel(),
                onArchive: async () => {
                  await deleteDocument(doc)
                },
                successMessage: m.document_deleted_success(),
                errorMessage: m.document_delete_error(),
                onSuccess: () => helpers.removeRow(doc.id),
              })
            },
          },
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-24' },
    },
  ]

  async function handleUpload(file: File, description: string, tags: string[]) {
    await uploadDocument(file, description, tags)
    tableKey++
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex justify-end">
    <Button onclick={() => (uploadDialogOpen = true)}>
      <Upload class="mr-2 size-4" />
      {m.upload_document()}
    </Button>
  </div>

  {#key tableKey}
    <ResourceTable {columns} fetchFunction={fetchDocuments} emptyState={emptyDocuments} />
  {/key}
</div>

{#snippet emptyDocuments()}
  <div class="py-8 text-center text-sm text-muted-foreground">
    {m.no_documents()}
  </div>
{/snippet}

<UploadDocumentDialog
  bind:open={uploadDialogOpen}
  {legalEntityId}
  onUpload={handleUpload}
  onClose={() => (uploadDialogOpen = false)} />
