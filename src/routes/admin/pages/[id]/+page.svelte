<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import PageEditor from '$lib/components/features/admin/pages/PageEditor.svelte'
  import { Button } from '$lib/components/ui/button'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  const pageId = $derived(page.params.id)
  const currentPage = $derived(adminStore.state.pages.find(p => p.$id === pageId))

  $effect(() => {
    if (!currentPage && pageId) {
      goto(adminPagesRoute())
    }
  })
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center gap-4 p-4">
    <Button variant="ghost" size="icon" onclick={() => goto(adminPagesRoute())}>
      <ArrowLeft class="size-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-medium">{currentPage?.title ?? 'Page'}</h1>
      <p class="text-sm text-muted-foreground">Edit page configuration</p>
    </div>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if currentPage}
      <PageEditor page={currentPage} />
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-muted-foreground">Page not found</p>
      </div>
    {/if}
  </div>
</div>
