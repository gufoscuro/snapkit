<!--
	@component UserDropdown
	@description User dropdown menu for admin sidebar
	@keywords admin, user, dropdown, logout
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge'
	import { Button } from '$lib/components/ui/button'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import type { JWTUser } from '$lib/server/auth'
	import ExternalLink from '@lucide/svelte/icons/external-link'
	import LogOut from '@lucide/svelte/icons/log-out'
	import User from '@lucide/svelte/icons/user'

	interface Props {
		user: JWTUser
	}

	const { user }: Props = $props()
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="sm" class="w-full justify-start gap-2">
			<User class="size-4" />
			<span class="truncate">{user.full_name || user.username}</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="w-56">
		<DropdownMenu.Label>
			{user.username}
			{#if user.super_admin}
				<Badge variant="secondary" class="ml-2">Super Admin</Badge>
			{/if}
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<a href="/" class="block">
			<DropdownMenu.Item>
				<ExternalLink class="mr-2 size-4" />
				Back to App
			</DropdownMenu.Item>
		</a>
		<a href="/api/logout" class="block">
			<DropdownMenu.Item>
				<LogOut class="mr-2 size-4" />
				Logout
			</DropdownMenu.Item>
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
