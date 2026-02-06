<!--
  @component PageContextMenuButton
  @description Three-dot dropdown menu button for page actions
  @keywords admin, pages, dropdown, menu, actions
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { adminPageUpsertRoute } from '$lib/admin/routes'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { FlatBuilderPageConfig } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import Edit from '@lucide/svelte/icons/edit'
  import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical'
  import Plus from '@lucide/svelte/icons/plus'
  import Trash from '@lucide/svelte/icons/trash'
  import { toast } from 'svelte-sonner'
  import { getChildPages } from '$lib/admin/page-hierarchy-utils'

  interface Props {
    page: FlatBuilderPageConfig
  }

  let { page }: Props = $props()

  function handleCreateSubpage(e: Event) {
    e.stopPropagation()
    try {
      const newSubpage = adminStore.addSubpage(page.$id)
      adminStore.selectPage(newSubpage.$id)
      goto(adminPageUpsertRoute(newSubpage.$id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create subpage')
    }
  }

  function handleEdit(e: Event) {
    e.stopPropagation()
    adminStore.selectPage(page.$id)
    goto(adminPageUpsertRoute(page.$id))
  }

  function handleDelete(e: Event) {
    e.stopPropagation()
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

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="h-6 w-6"
        onclick={(e: MouseEvent) => e.stopPropagation()}
      >
        <EllipsisVertical class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="w-48">
    <DropdownMenu.Item onclick={handleCreateSubpage}>
      <Plus class="mr-2 size-4" />
      Create Subpage
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={handleEdit}>
      <Edit class="mr-2 size-4" />
      Edit Page
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={handleDelete} class="text-destructive focus:text-destructive">
      <Trash class="mr-2 size-4" />
      Delete Page
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
