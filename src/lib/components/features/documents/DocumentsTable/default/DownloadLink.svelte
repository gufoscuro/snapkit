<script lang="ts">
  import Spinner from '$components/ui/spinner/spinner.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import { toast } from 'svelte-sonner'

  type Props = {
    label: string
    onDownload: () => Promise<{ download_url?: string; original_filename: string }>
  }

  let { label, onDownload }: Props = $props()
  let loading = $state(false)

  async function handleClick() {
    if (loading) return
    loading = true
    try {
      const record = await onDownload()
      if (!record.download_url) return

      const proxyUrl = `/api/download?url=${encodeURIComponent(record.download_url)}&filename=${encodeURIComponent(record.original_filename)}`
      const a = document.createElement('a')
      a.href = proxyUrl
      a.download = record.original_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error(m.document_download_error())
    } finally {
      loading = false
    }
  }
</script>

<button
  type="button"
  class="line-clamp-1 flex cursor-pointer items-center gap-1 text-left underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
  disabled={loading}
  onclick={handleClick}>
  {#if loading}
    <Spinner class="size-4 text-foreground" />
  {/if}

  {label}
</button>
