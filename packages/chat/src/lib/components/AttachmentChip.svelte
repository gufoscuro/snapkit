<script lang="ts">
  import FileTextIcon from '@lucide/svelte/icons/file-text'
  import ImageIcon from '@lucide/svelte/icons/image'
  import XIcon from '@lucide/svelte/icons/x'
  import { formatBytes } from '../internal/attachments'
  import type { AttachmentRef } from '../types'

  type Props = {
    attachment: AttachmentRef
    onRemove?: () => void
  }

  let { attachment, onRemove }: Props = $props()
</script>

<div
  class="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs">
  {#if attachment.kind === 'image'}
    <ImageIcon class="size-3.5 shrink-0 text-muted-foreground" />
  {:else}
    <FileTextIcon class="size-3.5 shrink-0 text-muted-foreground" />
  {/if}
  <span class="truncate font-medium">{attachment.name}</span>
  <span class="shrink-0 text-muted-foreground">{formatBytes(attachment.size)}</span>
  {#if onRemove}
    <button
      type="button"
      onclick={onRemove}
      aria-label="Remove attachment {attachment.name}"
      class="ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      <XIcon class="size-3" />
    </button>
  {/if}
</div>
