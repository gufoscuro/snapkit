<script lang="ts">
	import Settings2 from '@lucide/svelte/icons/settings-2'

	type Props = {
		originalHeader: string
		onclick: () => void
	}

	let { originalHeader, onclick }: Props = $props()
</script>

<div class="flex items-center justify-end">
	{#if originalHeader}
		<span class="flex-1">{originalHeader}</span>
	{/if}
	<button
		type="button"
		class="inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
		title="Customize columns"
		{onclick}>
		<Settings2 class="size-4" />
	</button>
</div>
