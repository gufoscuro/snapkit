<!--
	@component PagesMenu
	@description Contextual pages menu that switches between list and detail views
	@keywords admin, pages, sidebar, menu
-->
<script lang="ts">
	import { adminStore } from '$lib/admin/store.svelte'
	import PagesListSidebar from './PagesListSidebar.svelte'
	import PageDetailSidebar from './PageDetailSidebar.svelte'

	const selectedPage = $derived(adminStore.selectedPage)
</script>

{#if selectedPage}
	<PageDetailSidebar page={selectedPage} />
{:else}
	<PagesListSidebar />
{/if}
