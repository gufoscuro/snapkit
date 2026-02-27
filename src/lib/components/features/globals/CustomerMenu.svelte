<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import * as Avatar from '$lib/components/ui/avatar/index.js'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import { useSidebar } from '$lib/components/ui/sidebar/index.js'
  import * as m from '$lib/paraglide/messages'
  import { getLocale, locales, setLocale } from '$lib/paraglide/runtime'
  import { apiRequest } from '$utils/request'
  import { createRoute } from '$utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { getUserInitials } from '$utils/strings'
  import BellIcon from '@lucide/svelte/icons/bell'
  import CheckIcon from '@lucide/svelte/icons/check'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'
  import LanguagesIcon from '@lucide/svelte/icons/languages'
  import LogOutIcon from '@lucide/svelte/icons/log-out'
  import MonitorIcon from '@lucide/svelte/icons/monitor'
  import MoonIcon from '@lucide/svelte/icons/moon'
  import SunIcon from '@lucide/svelte/icons/sun'
  import SunMoonIcon from '@lucide/svelte/icons/sun-moon'
  import { Cog } from 'lucide-svelte'
  import { resetMode, setMode, userPrefersMode } from 'mode-watcher'

  let { user }: SnippetProps = $props()

  const sidebar = useSidebar()

  let currentLocale = $state(getLocale())

  const localeLabels: Record<string, string> = {
    en: 'English',
    it: 'Italiano',
  }

  function switchLocale(locale: string) {
    setLocale(locale as (typeof locales)[number])
    currentLocale = locale as (typeof locales)[number]
  }

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
          <DropdownMenu.Item onclick={() => goto(createRoute({ $id: 'settings' }))}>
            <Cog />
            {m.settings()}
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled>
            <BellIcon />
            {m.notifications()}
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <LanguagesIcon />
              {m.language()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {#each locales as locale (locale)}
                <DropdownMenu.Item onclick={() => switchLocale(locale)}>
                  {#if currentLocale === locale}
                    <CheckIcon />
                  {/if}
                  {localeLabels[locale] ?? locale}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <SunMoonIcon />
              {m.theme()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onclick={() => setMode('light')}>
                {#if userPrefersMode.current === 'light'}
                  <CheckIcon />
                {:else}
                  <SunIcon />
                {/if}
                {m.theme_light()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => setMode('dark')}>
                {#if userPrefersMode.current === 'dark'}
                  <CheckIcon />
                {:else}
                  <MoonIcon />
                {/if}
                {m.theme_dark()}
              </DropdownMenu.Item>
              <DropdownMenu.Item onclick={() => resetMode()}>
                {#if userPrefersMode.current === 'system'}
                  <CheckIcon />
                {:else}
                  <MonitorIcon />
                {/if}
                {m.theme_system()}
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
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
