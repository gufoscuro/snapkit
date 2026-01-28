<!--
	@component AdminLayout
	@description Main layout for the admin panel with sidebar navigation and header
	@keywords admin, layout, sidebar, navigation, dashboard
-->
<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { JWTUser } from '$lib/server/auth'
	import AdminSidebar from './AdminSidebar.svelte'
	import AdminHeader from './AdminHeader.svelte'
	import ConfirmDeleteDialog from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'

	interface Props {
		user: JWTUser
		children: Snippet
	}

	const { user, children }: Props = $props()
</script>

<div class="flex h-screen w-full">
	<AdminSidebar />

	<div class="flex flex-1 flex-col overflow-hidden">
		<AdminHeader {user} />

		<main class="flex-1 overflow-auto bg-gray-50 p-6">
			{@render children()}
		</main>
	</div>
</div>

<!-- Global confirm delete dialog -->
<ConfirmDeleteDialog />
