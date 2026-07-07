<script lang="ts">
	import type { ToolUseBlock } from '../types'

	let { block }: { block: ToolUseBlock } = $props()

	const title = $derived(
		typeof block.input.title === 'string' ? block.input.title : null
	)
	const data = $derived('data' in block.input ? block.input.data : block.input)

	const formatted = $derived(JSON.stringify(data, null, 2))
</script>

<div class="rounded-md border bg-background/60 p-3 text-left">
	{#if title}
		<div class="mb-2 text-xs font-medium text-muted-foreground">{title}</div>
	{/if}
	<pre class="overflow-x-auto text-xs leading-relaxed"><code>{formatted}</code></pre>
</div>
