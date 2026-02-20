<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import * as Avatar from '$lib/components/ui/avatar/index.js'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { useSidebar } from '$lib/components/ui/sidebar/index.js'
  import type { UserResource } from '$lib/types/api-types'
  import { apiRequest } from '$utils/request'
  import { getUserInitials } from '$utils/strings'
  import BadgeCheckIcon from '@lucide/svelte/icons/badge-check'
  import BellIcon from '@lucide/svelte/icons/bell'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'
  import CreditCardIcon from '@lucide/svelte/icons/credit-card'
  import LogOutIcon from '@lucide/svelte/icons/log-out'

  let { user }: { user: UserResource | undefined } = $props()

  const sidebar = useSidebar()

  async function logoutApplication() {
    await apiRequest({
      url: '/logout',
      method: 'POST',
    })

    goto(resolve('/login'))
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            {...props}>
            <Avatar.Root class="size-8 rounded-md">
              <Avatar.Image src={user?.id} alt={user?.name} />
              <Avatar.Fallback class="rounded">{getUserInitials(user?.name || 'JD')}</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user?.name || 'John Doe'}</span>
              <span class="truncate text-xs text-muted-foreground">{user?.email || 'john.doe@example.com'}</span>
            </div>
            <ChevronsUpDownIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}>
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded">
              <Avatar.Image src={user?.id} alt={user?.name} />
              <Avatar.Fallback class="rounded-md">{getUserInitials(user?.name || 'JD')}</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user?.name || 'John Doe'}</span>
              <span class="truncate text-xs text-muted-foreground/80">{user?.email || 'john.doe@example.com'}</span>
            </div>
          </div>
        </DropdownMenu.Label>
        <!-- <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item disabled>
            <SparklesIcon />
            Upgrade to Pro
          </DropdownMenu.Item>
        </DropdownMenu.Group> -->
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item disabled>
            <BadgeCheckIcon />
            Account
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled>
            <CreditCardIcon />
            Billing
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled>
            <BellIcon />
            Notifications
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={logoutApplication}>
          <LogOutIcon />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
