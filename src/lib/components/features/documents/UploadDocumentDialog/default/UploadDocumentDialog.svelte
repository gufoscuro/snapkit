<script lang="ts">
  import TextField from '$lib/components/core/form/TextField.svelte'
  import TagsSelector from '$lib/components/features/form/TagsSelector.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as FileDropZone from '$lib/components/ui/file-drop-zone'
  import * as m from '$lib/paraglide/messages.js'
  import { toast } from 'svelte-sonner'

  type Props = {
    open: boolean
    legalEntityId: string
    onUpload: (file: File, description: string, tags: string[]) => Promise<void>
    onClose: () => void
  }

  let { open = $bindable(), legalEntityId, onUpload, onClose }: Props = $props()

  let selectedFile = $state<File | null>(null)
  let description = $state('')
  let tags = $state<string[]>([])
  let uploading = $state(false)

  function reset() {
    selectedFile = null
    description = ''
    tags = []
    uploading = false
  }

  async function handleFilePicked(files: File[]) {
    if (files.length > 0) selectedFile = files[0]
  }

  async function handleUpload() {
    if (!selectedFile) return

    uploading = true
    try {
      await onUpload(selectedFile, description, tags)
      toast.success(m.document_uploaded_success())
      reset()
      open = false
    } catch {
      toast.error(m.document_upload_error())
    } finally {
      uploading = false
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      reset()
      onClose()
    }
    open = value
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="max-w-lg">
    <Dialog.Header>
      <Dialog.Title>{m.upload_document()}</Dialog.Title>
    </Dialog.Header>

    <div class="flex flex-col gap-4 py-2">
      <FileDropZone.Root onUpload={handleFilePicked} maxFiles={1}>
        <FileDropZone.Trigger />
      </FileDropZone.Root>

      {#if selectedFile}
        <p class="text-sm text-muted-foreground">
          {m.document_file()}: <span class="font-medium text-foreground">{selectedFile.name}</span>
        </p>
      {/if}

      <TextField
        name="description"
        label={m.document_description()}
        value={description}
        oninput={e => (description = (e.target as HTMLInputElement).value)} />

      <TagsSelector {legalEntityId} value={tags} onChange={slugs => (tags = slugs)} />
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={onClose} disabled={uploading}>
        {m.common_cancel()}
      </Button>
      <Button onclick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? '...' : m.upload_document()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
