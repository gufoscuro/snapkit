<script lang="ts">
	import MarkdownRenderer from '../markdown/MarkdownRenderer.svelte'
	import type { TextBlock } from '../types'

	let { block }: { block: TextBlock } = $props()
</script>

<MarkdownRenderer
	markdown={block.text}
	class="group-data-[variant='sent']/chat-bubble:[--tw-prose-body:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-headings:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-bold:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-links:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-quotes:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-code:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-bullets:currentColor] group-data-[variant='sent']/chat-bubble:[--tw-prose-counters:currentColor] break-words text-sm leading-relaxed"
/>
