<!--
	@component LeftSidebarWrapper
	@description Contextual sidebar for left sidebar layout
	@keywords sidebar
-->
<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar'
  import type { Snippet } from 'svelte'

  type Props = {
    header?: Snippet
    content?: Snippet
    footer?: Snippet
    collapsible?: 'offcanvas' | 'icon' | 'none'
  }

  const { header, content, footer, collapsible = 'icon' }: Props = $props()
</script>

<Sidebar.Root {collapsible} class="sidebar-wrapper">
  {#if header}
    <Sidebar.Header class="justify-center space-y-3 py-3">
      {@render header()}
    </Sidebar.Header>
  {/if}

  <Sidebar.Content>
    {@render content?.()}
  </Sidebar.Content>

  {#if footer}
    <Sidebar.Footer>
      {@render footer()}
    </Sidebar.Footer>
  {/if}

  <Sidebar.Rail />
</Sidebar.Root>

<style>
  :global(.sidebar-wrapper) {
    view-transition-name: sidebar;
  }
</style>
