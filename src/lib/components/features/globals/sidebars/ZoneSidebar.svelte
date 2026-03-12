<!--
  @component ZoneSidebar
  @description Sidebar template for the warehouse zone pages
  @keywords sidebar
-->

<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import * as m from '$lib/paraglide/messages'
  import type { BasicMenuItem } from '$lib/stores/tenant-config/types'
  import type { WarehouseZone } from '$lib/types/api-types.js'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  type Props = SnippetProps & { zone?: WarehouseZone | null }

  const { zone = null, ...props }: Props = $props()

  const warehouseId = $derived(page.params.uuid)

  const items: BasicMenuItem[] = $derived.by(() => {
    if (!zone) return []

    return [
      {
        label: m.overview(),
        href: `/settings/warehouses/upsert/${warehouseId}/zones/upsert/${zone.id}`,
      },
      {
        label: m.bins(),
        href: `/settings/warehouses/upsert/${warehouseId}/zones/${zone.id}/bins`,
      },
    ]
  })
</script>

<SubpageSidebarBase {...props} fallback="/settings/warehouses/upsert/{warehouseId}/zones">
  {#if zone}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={zone.code}>
        {zone.code}
      </h2>
      <p class="text-sm text-muted-foreground">{zone.description}</p>
    </div>

    <Sidebar.Group>
      <Sidebar.GroupLabel>{m.settings()}</Sidebar.GroupLabel>
      <Sidebar.Menu>
        {#each items as item (item.href)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={page.url.pathname === item.href} tooltipContent={item.label}>
              {#snippet child({ props: btnProps })}
                <a href={item.href} {...btnProps} data-sveltekit-preload-data="off">
                  <span>{item.label}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  {:else}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.zone()}
      </h2>
    </div>
  {/if}
</SubpageSidebarBase>
