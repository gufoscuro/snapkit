<script lang="ts">
	import type { PageDetailsInfo } from '../types'

	type Props = {
		info: PageDetailsInfo
	}

	let { info }: Props = $props()

	// Lazy data loading - only called when tab is active
	let data = $derived(info.getData())
</script>

<div class="space-y-4 p-4 text-sm">
	<div>
		<h3 class="mb-2 font-semibold">Page Title</h3>
		<div class="rounded bg-muted p-2">
			{data.title}
		</div>
	</div>

	<div>
		<h3 class="mb-2 font-semibold">Route</h3>
		<div class="rounded bg-muted p-2 font-mono text-xs">
			{data.route}
		</div>
	</div>

	{#if Object.keys(data.params).length > 0}
		<div>
			<h3 class="mb-2 font-semibold">Route Parameters</h3>
			<pre class="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(data.params, null, 2)}</pre>
		</div>
	{/if}

	<div>
		<h3 class="mb-2 font-semibold">Tenant Interface Details</h3>
		<pre class="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(data.tenantInterfaceDetails, null, 2)}</pre>
	</div>

	<div>
		<h3 class="mb-2 font-semibold">Page Configuration</h3>
		<pre class="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(data.config, null, 2)}</pre>
	</div>
</div>
