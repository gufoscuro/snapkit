<!--
	@component PageDetailSidebar
	@description Detail view of a selected page in the sidebar
	@keywords admin, pages, sidebar, detail
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import type { BuilderPageConfig } from '$lib/admin/types'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  interface Props {
    page: BuilderPageConfig
  }

  const { page }: Props = $props()

  function goBack() {
    adminStore.clearSelection()
    goto(adminPagesRoute())
  }

  const tenant = $derived(adminStore.state.tenants.find(t => t.id === page.tenantId))
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent class="space-y-4 p-4">
    <div>
      <h3 class="truncate text-lg font-semibold">{page.title}</h3>
      <p class="mt-1 text-sm text-muted-foreground">Page configuration</p>
    </div>

    {#if tenant}
      <div>
        <div class="mb-1 text-xs font-medium text-muted-foreground">Tenant</div>
        <Badge variant="secondary">{tenant.name}</Badge>
      </div>
    {/if}

    <div>
      <div class="mb-1 text-xs font-medium text-muted-foreground">Route</div>
      <code class="block rounded bg-muted px-2 py-1 text-xs break-all">{page.route}</code>
    </div>

    <div>
      <div class="mb-1 text-xs font-medium text-muted-foreground">Page ID</div>
      <code class="block rounded bg-muted px-2 py-1 text-xs break-all">{page.$id}</code>
    </div>

    <div>
      <div class="mb-1 text-xs font-medium text-muted-foreground">Layout</div>
      <code class="block rounded bg-muted px-2 py-1 text-xs break-all">{page.layout.componentKey}</code>
    </div>

    <div>
      <div class="mb-1 text-xs font-medium text-muted-foreground">Snippets</div>
      <div class="text-xs text-muted-foreground">
        {Object.keys(page.snippets).length} configured
      </div>
    </div>
  </Sidebar.GroupContent>
</Sidebar.Group>
