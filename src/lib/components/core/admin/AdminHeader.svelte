<!--
	@component AdminHeader
	@description Header for admin panel with tenant selector
	@keywords admin, header, tenant
-->
<script lang="ts">
	import type { JWTUser } from '$lib/server/auth'
	import * as Sidebar from '$lib/components/ui/sidebar'
	import TenantSelector from './TenantSelector.svelte'

	interface Props {
		user: JWTUser
	}

	const { user }: Props = $props()
</script>

<header class="flex h-14 items-center justify-between border-b bg-white px-4">
	<Sidebar.Trigger />
	<TenantSelector />
</header>
