<script lang="ts">
	import type { PageState } from '$lib/contexts/page-state'

	type Props = {
		state: PageState
	}

	let { state }: Props = $props()

	// Access the _debug getter which returns the raw state object
	let debugState = $derived(state._debug)

	// Group state by namespace
	let namespaces = $derived.by(() => {
		const grouped = new Map<string, Record<string, unknown>>()

		for (const [key, value] of Object.entries(debugState)) {
			const parts = key.split('.')
			if (parts.length > 1) {
				const namespace = parts[0]
				const field = parts.slice(1).join('.')

				if (!grouped.has(namespace)) {
					grouped.set(namespace, {})
				}
				grouped.get(namespace)![field] = value
			} else {
				// Root-level keys
				if (!grouped.has('__root__')) {
					grouped.set('__root__', {})
				}
				grouped.get('__root__')![key] = value
			}
		}

		return grouped
	})
</script>

<div class="space-y-4 p-4 text-sm">
	{#if namespaces.size === 0}
		<div class="text-muted-foreground">
			No state registered. Components can share state using useProvides/useConsumes hooks.
		</div>
	{:else}
		{#each Array.from(namespaces) as [namespace, data]}
			<div>
				<h3 class="mb-2 font-semibold">
					{namespace === '__root__' ? 'Root State' : namespace}
				</h3>
				<pre class="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(data, null, 2)}</pre>
			</div>
		{/each}
	{/if}
</div>
