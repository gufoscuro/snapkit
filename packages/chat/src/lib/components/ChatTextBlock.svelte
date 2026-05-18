<script lang="ts">
	import MarkdownRenderer from '../markdown/MarkdownRenderer.svelte'
	import type { TextBlock } from '../types'

	let { block }: { block: TextBlock } = $props()
</script>

<MarkdownRenderer markdown={block.text} class="break-words text-sm leading-relaxed" />
