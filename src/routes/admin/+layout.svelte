<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { untrack } from 'svelte'
	import AdminLayout from '$lib/components/core/admin/AdminLayout.svelte'
	import { adminStore } from '$lib/admin/store.svelte'

	interface Props {
		data: LayoutData
		children: Snippet
	}

	const { data, children }: Props = $props()

	// Initialize admin store with saved configuration and restore tenant from localStorage
	// Use untrack to prevent infinite loops when loadState modifies the store
	$effect(() => {
		if (data.adminConfig) {
			untrack(() => {
				adminStore.loadState(data.adminConfig)
				adminStore.initializeTenantFromStorage()
			})
		}
	})
</script>

<AdminLayout user={data.user}>
	{@render children()}
</AdminLayout>
