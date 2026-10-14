<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/state'
  import * as Collapsible from '$lib/components/ui/collapsible/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import type { MenuItem, SimpleMenuItem } from '$lib/stores/tenant-config/types'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
  import { getMenuIcon } from './menu-icons'

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

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'
    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }

  type InlineSegment = { kind: 'inline'; label?: string; items: MenuItem[] }
  type SimpleSegment = { kind: 'simple'; label: string; children: SimpleMenuItem[] }
  type Segment = InlineSegment | SimpleSegment

  const segments = $derived.by((): Segment[] => {
    const result: Segment[] = []
    const visibleTop = mainMenu.items.filter(i => i.visible !== false)
    let inlineBuffer: MenuItem[] = []
    let menuNameUsed = false

    const flushInline = () => {
      const meaningful = inlineBuffer.filter(
        i => i.type === 'link' || (i.type === 'submenu' && i.children.some(c => c.visible !== false)),
      )
      if (meaningful.length > 0) {
        result.push({
          kind: 'inline',
          label: menuNameUsed ? undefined : mainMenu.name,
          items: meaningful,
        })
        menuNameUsed = true
      }
      inlineBuffer = []
    }

    for (const item of visibleTop) {
      if (item.type === 'submenu' && item.submenuStyle === 'simple') {
        flushInline()
        const visibleChildren = item.children.filter(
          (c): c is SimpleMenuItem => c.visible !== false && c.type === 'link',
        )
        if (visibleChildren.length > 0) {
          result.push({ kind: 'simple', label: item.label, children: visibleChildren })
        }
      } else {
        inlineBuffer.push(item)
      }
    }
    flushInline()

    return result
  })
</script>

{#each segments as segment, i (segment.kind === 'simple' ? `s:${segment.label}` : `i:${i}`)}
  {#if segment.kind === 'simple'}
    <Sidebar.Group data-sveltekit-preload-data="off">
      {#if segment.label}
        <Sidebar.GroupLabel>{getI18nLabel(segment.label)}</Sidebar.GroupLabel>
      {/if}
      <Sidebar.Menu>
        {#each segment.children as subItem (subItem.label)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              isActive={page.url.pathname === getHref(subItem)}
              tooltipContent={getI18nLabel(subItem.label)}>
              {#snippet child({ props })}
                {@const Icon = getMenuIcon(subItem.icon)}
                <a href={getHref(subItem)} {...props}>
                  {#if Icon}
                    <Icon />
                  {/if}
                  <span>{getI18nLabel(subItem.label)}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  {:else}
    <Sidebar.Group data-sveltekit-preload-data="off">
      {#if segment.label}
        <Sidebar.GroupLabel>{getI18nLabel(segment.label)}</Sidebar.GroupLabel>
      {/if}
      <Sidebar.Menu>
        {#each segment.items as item (item.label)}
          {#if item.type === 'link'}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={page.url.pathname === getHref(item)}
                tooltipContent={getI18nLabel(item.label)}>
                {#snippet child({ props })}
                  {@const Icon = getMenuIcon(item.icon)}
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
              onOpenChange={v => {
                openState[item.label] = v
              }}
              class="group/collapsible">
              {#snippet child({ props })}
                <Sidebar.MenuItem {...props}>
                  <Collapsible.Trigger>
                    {#snippet child({ props })}
                      {@const Icon = getMenuIcon(item.icon)}
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
                              {@const Icon = getMenuIcon(subItem.icon)}
                              <a href={getHref(subItem)} {...props}>
                                {#if Icon}
                                  <Icon />
                                {/if}
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
  {/if}
{/each}
