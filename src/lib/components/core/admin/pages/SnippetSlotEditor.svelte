<!--
	@component SnippetSlotEditor
	@description Editor for a single snippet slot with component selection and props editing
	@keywords admin, snippet, slot, editor
-->
<script lang="ts">
  import type { ComponentKey } from '$generated/components-registry'
  import { adminStore } from '$lib/admin/store.svelte'
  import type { ExtendedSnippetDefinition } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import { Label } from '$lib/components/ui/label'
  import { Switch } from '$lib/components/ui/switch'
  import Settings from '@lucide/svelte/icons/settings'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'
  import ComponentPicker from './ComponentPicker.svelte'

  interface Props {
    pageId: string
    slotName: string
    snippet: ExtendedSnippetDefinition
  }

  const { pageId, slotName, snippet }: Props = $props()

  let showComponentPicker = $state(false)

  function handleToggleEnabled() {
    adminStore.updateSnippet(pageId, slotName, { enabled: !snippet.enabled })
  }

  function handleComponentSelect(componentKey: ComponentKey) {
    adminStore.updateSnippet(pageId, slotName, { componentKey })
    showComponentPicker = false
  }

  function handleDelete() {
    confirmDelete({
      title: 'Delete Snippet',
      description: `Are you sure you want to delete the snippet for slot "${slotName}"? This action cannot be undone.`,
      confirm: {
        text: 'Delete Snippet',
      },
      onConfirm: async () => {
        adminStore.deleteSnippet(pageId, slotName)
        toast.success(`Snippet "${slotName}" deleted successfully`)
      },
    })
  }
</script>

<div class="space-y-2">
  <!-- Component info and enable toggle -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Switch checked={snippet.enabled} onCheckedChange={handleToggleEnabled} />
      <Label class="text-xs font-medium">{snippet.enabled ? 'Enabled' : 'Disabled'}</Label>
    </div>
  </div>

  <!-- Component key display -->
  <code class="block truncate rounded bg-muted px-2 py-1 text-xs" title={snippet.componentKey}>
    {snippet.componentKey}
  </code>

  <!-- Action buttons -->
  <div class="flex gap-2">
    <Button variant="outline" size="sm" class="flex-1 text-xs" onclick={() => (showComponentPicker = true)}>
      <Settings class="mr-1 size-3" />
      Change
    </Button>
    <Button variant="outline" size="sm" class="text-xs text-destructive hover:bg-destructive/10" onclick={handleDelete}>
      <Trash2 class="size-3" />
    </Button>
  </div>
</div>

<ComponentPicker
  open={showComponentPicker}
  title="Select Component for {slotName}"
  onSelect={handleComponentSelect}
  onClose={() => (showComponentPicker = false)} />
