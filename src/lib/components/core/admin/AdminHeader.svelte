<!--
	@component AdminHeader
	@description Header for admin panel with user info
	@keywords admin, header, user
-->
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import type { JWTUser } from '$lib/server/auth'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import LogOut from '@lucide/svelte/icons/log-out'
  import User from '@lucide/svelte/icons/user'
  import TenantSelector from './TenantSelector.svelte'

  interface Props {
    user: JWTUser
  }

  const { user }: Props = $props()
</script>

<header class="flex h-14 items-center justify-between border-b bg-white px-4">
  <div class="flex items-center gap-4">
    <TenantSelector />
  </div>

  <div class="flex items-center gap-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="sm" class="gap-2">
          <User class="size-4" />
          <span>{user.full_name || user.username}</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
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
  </div>
</header>
