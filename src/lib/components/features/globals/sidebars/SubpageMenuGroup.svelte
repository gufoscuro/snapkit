<!--
  @component SubpageMenuGroup
  @description Sidebar menu group that renders a list of MenuItem links with active/disabled states
  @keywords sidebar menu group
-->
<script lang="ts">
  import { page } from '$app/state'

  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { createRoute } from '$utils/route-builder.js'

  type Props = {
    name: string
    items: MenuItem[]
  }

  const { name, items }: Props = $props()

  function getHref(item: MenuItem): string {
    if (!item.pageId) return '#'

    return createRoute({ $id: item.pageId, params: item.params, query: item.query })
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>{name}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.label)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive={page.url.pathname === getHref(item)} tooltipContent={item.label}>
          {#snippet child({ props })}
            {#if item.disabled}
              <div {...props} class="{props.class || ''} cursor-default hover:bg-none!">
                <span>{item.label}</span>
              </div>
            {:else}
              <a href={getHref(item)} {...props} data-sveltekit-preload-data="off">
                <span>{item.label}</span>
              </a>
            {/if}
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
