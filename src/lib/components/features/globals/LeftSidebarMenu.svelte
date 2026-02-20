<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/state'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
  import * as LucideIcons from 'lucide-svelte'
  import type { Component } from 'svelte'

  const { entityConfig }: SnippetProps = $props()
  const mainMenu = $derived(entityConfig?.dashboard.menus.main || { name: 'Unnamed Menu', items: [] })

  const STORAGE_KEY = 'left-sidebar-menu-open'

  function loadOpenState(): Record<string, boolean> {
    if (!browser) return {}
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
    } catch {
      return {}
    }
  }

  let openState = $state<Record<string, boolean>>(loadOpenState())

  $effect(() => {
    if (!browser) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(openState)))
  })

  function getIcon(name?: string): Component | null {
    if (!name) return null
    const key =
      name
        .split('-')
        .map(w => w[0].toUpperCase() + w.slice(1))
        .join('') + 'Icon'
    return ((LucideIcons as Record<string, unknown>)[key] as Component) ?? null
  }

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'
    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>{getI18nLabel(mainMenu.name)}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each mainMenu.items.filter(i => i.visible !== false) as item (item.label)}
      {#if item.type === 'link'}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton isActive={page.url.pathname === getHref(item)} tooltipContent={getI18nLabel(item.label)}>
            {#snippet child({ props })}
              {@const Icon = getIcon(item.icon)}
              <a href={getHref(item)} {...props}>
                {#if Icon}
                  <Icon />
                {/if}
                <span>{getI18nLabel(item.label)}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {:else}
        {@const isGroupActive = item.children.some(c => page.url.pathname === getHref(c))}
        <Collapsible.Root
          open={openState[item.label] ?? isGroupActive}
          onOpenChange={(v) => { openState[item.label] = v }}
          class="group/collapsible">
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  {@const Icon = getIcon(item.icon)}
                  <Sidebar.MenuButton {...props} tooltipContent={getI18nLabel(item.label)}>
                    {#if Icon}
                      <Icon />
                    {/if}
                    <span>{getI18nLabel(item.label)}</span>
                    <ChevronRightIcon
                      class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each item.children.filter(c => c.visible !== false) as subItem (subItem.label)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton isActive={page.url.pathname === getHref(subItem)}>
                        {#snippet child({ props })}
                          <a href={getHref(subItem)} {...props}>
                            <span>{getI18nLabel(subItem.label)}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
