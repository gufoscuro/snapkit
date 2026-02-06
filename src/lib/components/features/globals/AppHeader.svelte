<script lang="ts">
  import { getI18nLabel } from '$utils/i18n'
  import type { SnippetProps } from '$utils/runtime'
  import { resolveMenuItems, type ResolvedMenuItem } from '$utils/menu-resolver'
  import * as NavigationMenu from '$lib/components/ui/navigation-menu'
  import { cn } from '$lib/utils'
  import LanguageSwitcher from './LanguageSwitcher.svelte'

  const { tenantInterfaceDetails }: SnippetProps = $props()

  // Resolve menu items to include computed hrefs
  const resolvedMenu = $derived(
    resolveMenuItems(tenantInterfaceDetails.mainMenu ?? [])
  )

  // Filter visible items
  const visibleItems = $derived(resolvedMenu.filter(item => item.visible))

  /**
   * Renders a simple menu item (link)
   */
  function renderSimpleItem(item: ResolvedMenuItem) {
    if (!item.href) return null

    return {
      label: getI18nLabel(item.label),
      href: item.href,
      disabled: item.disabled,
      icon: item.icon
    }
  }

  /**
   * Renders submenu content based on submenuStyle
   */
  function getSubmenuClass(style: ResolvedMenuItem['submenuStyle']): string {
    switch (style) {
      case 'grid':
        return 'grid w-[400px] gap-2 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]'
      case 'list':
        return 'grid w-[300px] gap-4 p-2'
      case 'simple':
        return 'grid w-[200px] gap-4 p-2'
      case 'icon':
        return 'grid w-[200px] gap-4 p-2'
      default:
        return 'grid w-[300px] gap-2 p-2'
    }
  }
</script>

<div class="sticky top-0 flex h-14 w-full items-center justify-between gap-3 border-b bg-background px-4">
  <div class="font-semibold">{tenantInterfaceDetails.name}</div>

  <div class="flex items-center gap-2">
    <NavigationMenu.Root>
      <NavigationMenu.List class="flex-wrap">
        {#each visibleItems as item (item.label)}
          <NavigationMenu.Item>
            {#if item.type === 'link' && item.href}
              <!-- Simple link item -->
              <NavigationMenu.Link>
                {#snippet child()}
                  <a
                    href={item.href}
                    class={cn(
                      "cursor-pointer rounded px-3 py-1 hover:bg-muted/70",
                      item.disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    {#if item.icon}
                      <span class="flex items-center gap-2">
                        <!-- Icon placeholder - integrate with lucide-svelte if needed -->
                        <span>{getI18nLabel(item.label)}</span>
                      </span>
                    {:else}
                      {getI18nLabel(item.label)}
                    {/if}
                  </a>
                {/snippet}
              </NavigationMenu.Link>
            {:else if item.type === 'submenu' && item.children}
              <!-- Submenu item -->
              <NavigationMenu.Trigger
                disabled={item.disabled}
                class={cn(
                  "cursor-pointer rounded px-3 py-1 hover:bg-muted/70"
                )}
              >
                {getI18nLabel(item.label)}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul class={getSubmenuClass(item.submenuStyle)}>
                  {#each item.children.filter(child => child.visible) as child (child.label)}
                    {#if child.href}
                      <li>
                        <NavigationMenu.Link>
                          {#snippet child()}
                            <a
                              href={child.href}
                              class={cn(
                                "block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                child.disabled && "opacity-50 pointer-events-none"
                              )}
                            >
                              {#if item.submenuStyle === 'list'}
                                <!-- List style with title + description -->
                                <div class="text-sm leading-none font-medium">
                                  {getI18nLabel(child.label)}
                                </div>
                                {#if child.description}
                                  <p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {getI18nLabel(child.description)}
                                  </p>
                                {/if}
                              {:else if item.submenuStyle === 'icon'}
                                <!-- Icon style -->
                                <div class="flex items-center gap-2">
                                  {#if child.icon}
                                    <!-- Icon placeholder -->
                                  {/if}
                                  {getI18nLabel(child.label)}
                                </div>
                              {:else}
                                <!-- Simple or grid style -->
                                {getI18nLabel(child.label)}
                              {/if}
                            </a>
                          {/snippet}
                        </NavigationMenu.Link>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </NavigationMenu.Content>
            {/if}
          </NavigationMenu.Item>
        {/each}
      </NavigationMenu.List>
    </NavigationMenu.Root>

    <LanguageSwitcher />
  </div>
</div>
