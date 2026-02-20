<!--
	@component MenuEditor
	@description Editor for configuring navigation menus with drag-and-drop reordering
	@keywords admin, menu, editor, navigation
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminMenusRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { MenuConfig } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Plus from '@lucide/svelte/icons/plus'
  import Save from '@lucide/svelte/icons/save'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'
  import MenuItemForm from './MenuItemForm.svelte'

  interface Props {
    menu: MenuConfig
  }

  const { menu }: Props = $props()

  let draggedIndex = $state<number | null>(null)
  let isSaving = $state(false)

  function handleNameChange(e: Event) {
    adminStore.updateMenu(menu.id, { name: (e.target as HTMLInputElement).value })
  }

  function handleAddItem() {
    const newItems = [...menu.items, { label: 'New Item', href: '/', visible: true, disabled: false }]
    adminStore.updateMenu(menu.id, { items: newItems })
  }

  function handleUpdateItem(index: number, item: any) {
    const newItems = [...menu.items]
    newItems[index] = item
    adminStore.updateMenu(menu.id, { items: newItems })
  }

  function handleDeleteItem(index: number) {
    const newItems = menu.items.filter((_, i) => i !== index)
    adminStore.updateMenu(menu.id, { items: newItems })
  }

  function handleDeleteMenu() {
    const menuName = menu.name // Capture name before deletion
    confirmDelete({
      title: 'Delete Menu',
      description: `Are you sure you want to delete "${menuName}"? This action cannot be undone.`,
      confirm: {
        text: 'Delete Menu',
      },
      onConfirm: async () => {
        adminStore.deleteMenu(menu.id)
        toast.success(`Menu "${menuName}" deleted successfully`)
        goto(adminMenusRoute())
      },
    })
  }

  async function handleSave() {
    isSaving = true
    const result = await saveAdminConfig()
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    isSaving = false
  }

  // Drag and drop handlers
  function handleDragStart(index: number) {
    draggedIndex = index
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...menu.items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    adminStore.updateMenu(menu.id, { items: newItems })
    draggedIndex = index
  }

  function handleDragEnd() {
    draggedIndex = null
  }
</script>

<div class="space-y-6">
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Menu Settings</CardTitle>
        <div class="flex gap-2">
          <Button variant="destructive" size="sm" onclick={handleDeleteMenu}>
            <Trash2 class="mr-2 size-4" />
            Delete Menu
          </Button>
          <Button size="sm" onclick={handleSave} disabled={isSaving}>
            <Save class="mr-2 size-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="menu-name">Name</Label>
          <Input id="menu-name" value={menu.name} oninput={handleNameChange} placeholder="Menu Name" />
        </div>
        <div class="space-y-2">
          <Label for="menu-id">Menu ID</Label>
          <Input id="menu-id" value={menu.id} disabled class="bg-muted" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Menu Items</CardTitle>
        <Button size="sm" onclick={handleAddItem}>
          <Plus class="mr-2 size-4" />
          Add Item
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {#if menu.items.length === 0}
        <p class="text-sm text-muted-foreground">No menu items. Click "Add Item" to create one.</p>
      {:else}
        <div class="space-y-2">
          {#each menu.items as item, index (index)}
            <div
              class="flex items-start gap-2 rounded-lg border bg-white p-3 {draggedIndex === index ? 'opacity-50' : ''}"
              draggable="true"
              ondragstart={() => handleDragStart(index)}
              ondragover={e => handleDragOver(e, index)}
              ondragend={handleDragEnd}>
              <button type="button" class="mt-2 cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical class="size-5" />
              </button>
              <div class="flex-1">
                <MenuItemForm
                  {item}
                  onChange={updated => handleUpdateItem(index, updated)}
                  onDelete={() => handleDeleteItem(index)} />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
