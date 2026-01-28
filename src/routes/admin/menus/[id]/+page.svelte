<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminMenusRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/store.svelte'
  import MenuEditor from '$lib/components/core/admin/menus/MenuEditor.svelte'
  import { Button } from '$lib/components/ui/button'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  const menuId = $derived(page.params.id)
  const currentMenu = $derived(adminStore.state.menus.find(m => m.id === menuId))

  $effect(() => {
    if (!currentMenu && menuId) {
      goto(adminMenusRoute())
    }
  })
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center gap-4 p-4">
    <Button variant="ghost" size="icon" onclick={() => goto(adminMenusRoute())}>
      <ArrowLeft class="size-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-medium">{currentMenu?.name ?? 'Menu'}</h1>
      <p class="text-sm text-muted-foreground">Edit menu configuration</p>
    </div>
  </div>

  <div class="flex-1 overflow-auto p-4">
    {#if currentMenu}
      <MenuEditor menu={currentMenu} />
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-muted-foreground">Menu not found</p>
      </div>
    {/if}
  </div>
</div>
