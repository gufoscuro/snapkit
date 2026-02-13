<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminPageUpsertRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Table from '$lib/components/ui/table'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'
  import { toast } from 'svelte-sonner'

  const pages = $derived(adminStore.currentTenantPages)
  const selectedTenant = $derived(adminStore.selectedTenant)

  function handleAddPage() {
    if (!selectedTenant) {
      toast.error('Please select a tenant first')
      return
    }
    try {
      const newPage = adminStore.addPage()
      goto(adminPageUpsertRoute(newPage.$id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create page')
    }
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between p-4">
    <div>
      <h1 class="text-2xl font-medium">Pages</h1>
    </div>
    <Button onclick={handleAddPage} disabled={!selectedTenant}>
      <Plus class="mr-2 size-4" />
      Add Page
    </Button>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if !selectedTenant}
      <!-- Empty state: no tenant selected -->
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="text-muted-foreground">Select a tenant from the dropdown above to view and manage pages.</p>
        </div>
      </div>
    {:else if pages.length === 0}
      <!-- Empty state: tenant selected but no pages -->
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="mb-4 text-muted-foreground">No pages for this tenant yet.</p>
          <Button onclick={handleAddPage}>
            <Plus class="mr-2 size-4" />
            Create your first page
          </Button>
        </div>
      </div>
    {:else}
      <!-- Table with tenant-filtered pages -->
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Title</Table.Head>
            <Table.Head>Route</Table.Head>
            <Table.Head>Layout</Table.Head>
            <Table.Head class="text-center">Snippets</Table.Head>
            <Table.Head class="w-20"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each pages as page (page.$id)}
            <Table.Row class="cursor-pointer" onclick={() => goto(adminPageUpsertRoute(page.$id))}>
              <Table.Cell class="font-medium">{page.title}</Table.Cell>
              <Table.Cell class="text-muted-foreground">{page.route}</Table.Cell>
              <Table.Cell>
                <code class="rounded bg-muted px-1.5 py-0.5 text-xs">{page.layout.componentKey}</code>
              </Table.Cell>
              <Table.Cell class="text-center">{Object.keys(page.snippets).length}</Table.Cell>
              <Table.Cell>
                <Button variant="ghost" size="icon" class="size-8">
                  <Pencil class="size-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </div>
</div>
