<!--
	@component BlocksMenu
	@description Contextual blocks menu that switches between list and detail views
	@keywords admin, blocks, sidebar, menu
-->
<script lang="ts">
	import { adminStore } from '$lib/admin/stores/admin-store.svelte'
	import BlocksListSidebar from './BlocksListSidebar.svelte'
	import BlockDetailSidebar from './BlockDetailSidebar.svelte'

	const selectedBlock = $derived(adminStore.selectedBlock)
</script>

{#if selectedBlock}
	<BlockDetailSidebar block={selectedBlock} />
{:else}
	<BlocksListSidebar blocks={adminStore.state.blocks} />
{/if}
