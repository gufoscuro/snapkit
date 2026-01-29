<!--
	@component BlockPreview
	@description Live preview of a block component using iframe isolation
	@keywords admin, blocks, preview, component, iframe
-->
<script lang="ts">
  import type { BlockConfig } from '$lib/admin/types'
  import * as Card from '$lib/components/ui/card'

  interface Props {
    block: BlockConfig
  }

  const { block }: Props = $props()

  // Construct iframe URL
  const previewUrl = $derived(`/admin/preview/${block.snippet.componentKey}`)

  let iframeElement = $state<HTMLIFrameElement | null>(null)
  let iframeHeight = $state(400)

  /**
   * Try to auto-resize iframe based on content height
   * Note: This may not work due to same-origin policy
   */
  function handleIframeLoad() {
    if (iframeElement?.contentWindow) {
      try {
        const contentHeight = iframeElement.contentWindow.document.body.scrollHeight
        if (contentHeight > 0) {
          iframeHeight = Math.max(contentHeight + 32, 200)
        }
      } catch (error) {
        // Cannot access iframe content (expected for cross-origin)
        // Keep default height
      }
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-foreground/30">Preview</Card.Title>
  </Card.Header>
  <Card.Content>
    <iframe
      bind:this={iframeElement}
      src={previewUrl}
      title="Component Preview"
      class="w-full rounded-lg border"
      style="height: {iframeHeight}px; min-height: 200px;"
      sandbox="allow-scripts allow-same-origin"
      onload={handleIframeLoad}
    />
  </Card.Content>
</Card.Root>
