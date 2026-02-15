<!--
	@component LeftSidebarWrapper
	@description Contextual sidebar for left sidebar layout
	@keywords sidebar
-->
<script lang="ts">
  import Logo from '$components/icons/Logo.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import type { SnippetProps } from '$utils/runtime'
  import type { WithChildren } from 'bits-ui'
  import CustomerMenu from './CustomerMenu.svelte'

  const { children, user }: WithChildren & SnippetProps = $props()

  $inspect(user, 'User in LeftSidebarWrapper')
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header class="justify-center space-y-3 py-3">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          class="gap-1 group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div class="flex size-8 shrink-0 items-center justify-center">
            <Logo class="size-5 shrink-0 text-primary" />
          </div>
          <div class="truncate text-base font-semibold">Moddo</div>
          <!-- <div class="grid flex-1 text-start text-sm leading-tight">
            <span class="truncate font-medium">{user.name}</span>
            <span class="truncate text-xs">{user.email}</span>
          </div> -->
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>

    <!-- <div class="flex items-center gap-2 font-medium">
      <Logo class="size-5 text-primary" />
          Moddo
    </div> -->
  </Sidebar.Header>

  <Sidebar.Content>
    {@render children?.()}
  </Sidebar.Content>

  <Sidebar.Footer>
    <CustomerMenu {user} />
  </Sidebar.Footer>

  <Sidebar.Rail />
</Sidebar.Root>
