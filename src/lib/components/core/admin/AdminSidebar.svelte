<!--
	@component AdminSidebar
	@description Contextual sidebar for admin panel
	@keywords admin, sidebar, navigation
-->
<script lang="ts">
  import { adminStore } from '$lib/admin/store.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import BlocksMenu from './blocks/BlocksMenu.svelte'
  import NavigationMenu from './NavigationMenu.svelte'
  import UserDropdown from './UserDropdown.svelte'

  interface Props {
    user: any
  }

  const { user }: Props = $props()
  const sidebarContext = $derived(adminStore.state.sidebarContext)
</script>

<Sidebar.Root collapsible="offcanvas">
  <Sidebar.Header class="space-y-3 border-b px-4 py-3">
    <UserDropdown {user} />
  </Sidebar.Header>

  <Sidebar.Content>
    {#if sidebarContext === 'navigation'}
      <NavigationMenu />
    {:else if sidebarContext === 'blocks'}
      <BlocksMenu />
    {/if}
  </Sidebar.Content>

  <Sidebar.Rail />
</Sidebar.Root>
