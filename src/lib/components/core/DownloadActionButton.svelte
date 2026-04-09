<!--
  @component DownloadActionButton
  @description ActionButton that handles a download operation with busy state.
  Shows a download icon by default, spins while the download is in progress.
  @keywords download, action, button, busy, pdf
  @uses ActionButton
-->
<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import * as m from '$lib/paraglide/messages'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import type { ComponentProps } from 'svelte'
  import { toast } from 'svelte-sonner'

  type ActionButtonProps = Omit<ComponentProps<typeof ActionButton>, 'busy' | 'onclick' | 'children'>

  type Props = ActionButtonProps & {
    /** Async callback that performs the download. */
    onDownload: () => Promise<void>
  }

  let { onDownload, tooltip = m.download_pdf(), variant = 'outline', size = 'icon', ...restProps }: Props = $props()

  let busy = $state(false)

  async function handleClick() {
    if (busy) return
    busy = true
    try {
      await onDownload()
    } catch {
      toast.error(m.download_pdf_error())
    } finally {
      busy = false
    }
  }
</script>

<ActionButton {tooltip} {variant} {size} {busy} busyLabel="" onclick={handleClick} {...restProps}>
  <DownloadIcon class="h-4 w-4" />
</ActionButton>
