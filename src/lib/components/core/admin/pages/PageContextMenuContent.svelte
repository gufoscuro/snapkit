<!--
  @component PageContextMenuContent
  @description Shared context menu content for page actions (create subpage, edit, delete)
  @keywords admin, pages, context menu, actions
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminPageUpsertRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { FlatBuilderPageConfig } from '$lib/admin/types'
  import * as ContextMenu from '$lib/components/ui/context-menu'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import Edit from '@lucide/svelte/icons/edit'
  import Plus from '@lucide/svelte/icons/plus'
  import Trash from '@lucide/svelte/icons/trash'
  import { toast } from 'svelte-sonner'
  import { getChildPages } from '$lib/admin/page-hierarchy-utils'

  interface Props {
    page: FlatBuilderPageConfig
  }

  let { page }: Props = $props()

  function handleCreateSubpage() {
    try {
      const newSubpage = adminStore.addSubpage(page.$id)
      adminStore.selectPage(newSubpage.$id)
      goto(adminPageUpsertRoute(newSubpage.$id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create subpage')
    }
  }

  function handleEdit() {
    adminStore.selectPage(page.$id)
    goto(adminPageUpsertRoute(page.$id))
  }

  function handleDelete() {
    const children = getChildPages(page.$id, adminStore.state.pages)
    const descendantCount = children.length

    let description = `Are you sure you want to delete "${page.title}"? This action cannot be undone.`
    if (descendantCount > 0) {
      description = `Are you sure you want to delete "${page.title}" and its ${descendantCount} subpage(s)? This action cannot be undone.`
    }

    confirmDelete({
      title: 'Delete Page',
      description,
      confirm: {
        text: 'Delete Page',
      },
      onConfirm: async () => {
        try {
          adminStore.deletePage(page.$id, true) // cascade delete
          toast.success(`Page "${page.title}" deleted successfully`)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to delete page')
        }
      },
    })
  }
</script>

<ContextMenu.Content class="w-48">
  <ContextMenu.Item onclick={handleCreateSubpage}>
    <Plus class="mr-2 size-4" />
    Create Subpage
  </ContextMenu.Item>
  <ContextMenu.Item onclick={handleEdit}>
    <Edit class="mr-2 size-4" />
    Edit Page
  </ContextMenu.Item>
  <ContextMenu.Separator />
  <ContextMenu.Item onclick={handleDelete} class="text-destructive focus:text-destructive">
    <Trash class="mr-2 size-4" />
    Delete Page
  </ContextMenu.Item>
</ContextMenu.Content>
