<!--
	@component JsonEditor
	@description Simple JSON editor with validation
	@keywords admin, json, editor, props
-->
<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea'
	import AlertCircle from '@lucide/svelte/icons/alert-circle'

	interface Props {
		value: Record<string, unknown>
		onChange: (value: Record<string, unknown>) => void
		placeholder?: string
	}

	const { value, onChange, placeholder = 'Enter JSON...' }: Props = $props()

	let textValue = $state(JSON.stringify(value, null, 2))
	let error = $state<string | null>(null)

	function handleInput(e: Event) {
		const text = (e.target as HTMLTextAreaElement).value
		textValue = text

		try {
			const parsed = JSON.parse(text || '{}')
			error = null
			onChange(parsed)
		} catch (e) {
			error = 'Invalid JSON'
		}
	}

	// Sync external value changes
	$effect(() => {
		const newText = JSON.stringify(value, null, 2)
		if (newText !== textValue && !error) {
			textValue = newText
		}
	})
</script>

<div class="space-y-2">
	<Textarea
		value={textValue}
		oninput={handleInput}
		{placeholder}
		class="font-mono text-sm {error ? 'border-red-500' : ''}"
		rows={6}
	/>
	{#if error}
		<div class="flex items-center gap-2 text-sm text-red-500">
			<AlertCircle class="size-4" />
			{error}
		</div>
	{/if}
</div>
