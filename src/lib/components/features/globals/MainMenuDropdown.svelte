<script lang="ts">
  import { goto } from '$app/navigation'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem, SimpleMenuItem } from '$lib/stores/tenant-config/types'
  import { cn } from '$lib/utils.js'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import LayoutGridIcon from '@lucide/svelte/icons/layout-grid'
  import { getMenuIcon } from './menu-icons'

  type Props = {
    items: MenuItem[]
    align?: 'start' | 'center' | 'end'
    class?: string
  }

  const { items, align = 'start', class: className }: Props = $props()

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'
    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }

  type Section = { kind: 'links'; items: SimpleMenuItem[] } | { kind: 'group'; label: string; items: SimpleMenuItem[] }

  const sections = $derived.by((): Section[] => {
    const result: Section[] = []
    const visible = items.filter(i => i.visible !== false)
    let buffer: SimpleMenuItem[] = []

    const flushLinks = () => {
      if (buffer.length > 0) {
        result.push({ kind: 'links', items: buffer })
        buffer = []
      }
    }

    for (const item of visible) {
      if (item.type === 'link') {
        buffer.push(item)
      } else {
        flushLinks()
        const visibleChildren = item.children.filter(
          (c): c is SimpleMenuItem => c.visible !== false && c.type === 'link',
        )
        if (visibleChildren.length > 0) {
          result.push({ kind: 'group', label: item.label, items: visibleChildren })
        }
      }
    }
    flushLinks()

    return result
  })
</script>

{#if sections.length > 0}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8', className)}
      aria-label={m.main_menu()}
      title={m.main_menu()}>
      <LayoutGridIcon />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content {align} class="w-56">
      {#each sections as section, i (i)}
        {#if i > 0}
          <DropdownMenu.Separator />
        {/if}
        <DropdownMenu.Group>
          {#if section.kind === 'group'}
            <DropdownMenu.Label>{getI18nLabel(section.label)}</DropdownMenu.Label>
          {/if}
          {#each section.items as item (item.label)}
            {@const Icon = getMenuIcon(item.icon)}
            <DropdownMenu.Item onSelect={() => goto(getHref(item))}>
              {#if Icon}
                <Icon />
              {/if}
              <span>{getI18nLabel(item.label)}</span>
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Group>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
