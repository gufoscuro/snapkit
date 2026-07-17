<!--
	@component LeftSidebarWrapper
	@description Contextual sidebar for left sidebar layout
	@keywords sidebar
-->
<script lang="ts">
  import { page } from '$app/state'
  import ShadowModeIndicator from '$components/features/tenant/ShadowModeIndicator.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { getCurrentVanity } from '$lib/utils/tenant'
  import type { Snippet } from 'svelte'

  type Props = {
    header?: Snippet
    content?: Snippet
    footer?: Snippet
    collapsible?: 'offcanvas' | 'icon' | 'none'
  }

  const { header, content, footer, collapsible = 'icon' }: Props = $props()

  // Read straight from the layout data rather than take props: this wrapper is
  // instantiated from the page registry, whose snippet props have no notion of
  // tenancy, and shadowing must be visible on every page — including ones whose
  // config predates this.
  const shadowing = $derived(page.data.shadowing === true)
  const homeTenant = $derived(page.data.user?.tenant)
  const currentVanity = $derived(getCurrentVanity())
</script>

<Sidebar.Root {collapsible} class="sidebar-wrapper">
  {#if header || shadowing}
    <Sidebar.Header class="justify-center space-y-3 py-3">
      {#if shadowing && homeTenant && currentVanity}
        <ShadowModeIndicator
          homeTenantName={homeTenant.name}
          homeVanity={homeTenant.vanity}
          actingAsVanity={currentVanity}
          class="group-data-[collapsible=icon]:hidden" />
      {/if}
      {@render header?.()}
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
