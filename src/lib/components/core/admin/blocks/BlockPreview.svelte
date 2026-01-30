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
  let iframeHeight = $state<number | null>(null)
  let isReady = $state(false)

  /**
   * Listen for height updates from the iframe content
   */
  $effect(() => {
    function handleMessage(event: MessageEvent) {
      // Verify the message is from our iframe
      if (event.data?.type === 'preview-height' && typeof event.data.height === 'number') {
        const contentHeight = event.data.height
        if (contentHeight > 0) {
          iframeHeight = Math.max(contentHeight + 32, 200)
          isReady = true
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  })
</script>

<div class:invisible={!isReady}>
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-foreground/30">Preview</Card.Title>
    </Card.Header>
    <Card.Content>
      <iframe
        bind:this={iframeElement}
        src={previewUrl}
        title="Component Preview"
        class="w-full transition-opacity duration-200"
        class:opacity-0={!isReady}
        style="height: {iframeHeight ?? 200}px; min-height: 200px;"
        sandbox="allow-scripts allow-same-origin"></iframe>
    </Card.Content>
  </Card.Root>
</div>
