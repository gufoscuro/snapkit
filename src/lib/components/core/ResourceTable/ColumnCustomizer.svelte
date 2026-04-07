<script lang="ts" generics="T extends Record<string, any>">
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Switch } from '$lib/components/ui/switch'
  import * as m from '$lib/paraglide/messages.js'
  import * as StorageUtil from '$lib/utils/storage'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action'
  import { flip } from 'svelte/animate'
  import type { ColumnConfig } from './types'
  import { mergePreferences, type ColumnPreference } from './utils/column-preferences'

  type DndColumnItem = ColumnPreference & { header: string; _dndId: string }

  type Props = {
    columns: ColumnConfig<T>[]
    storageId: string
    open: boolean
    onApply: (preferences: ColumnPreference[] | null) => void
    onOpenChange: (open: boolean) => void
  }

  let { columns, storageId, open, onApply, onOpenChange }: Props = $props()

  const FLIP_DURATION_MS = 200
  const STORAGE_KEY = $derived(`columns:${storageId}`)

  overrideItemIdKeyNameBeforeInitialisingDndZones('_dndId')

  let dndItems = $state<DndColumnItem[]>([])

  // Number of currently visible columns
  const visibleCount = $derived(dndItems.filter(item => item.visible).length)

  // When dialog opens, rebuild the DnD items from saved preferences + current columns
  $effect(() => {
    if (open) {
      const saved = StorageUtil.getByUser<ColumnPreference[]>(STORAGE_KEY)
      const merged = mergePreferences(columns, saved)
      dndItems = merged.map((item, i) => ({ ...item, _dndId: `col-${i}` }))
    }
  })

  function handleDndConsider(e: CustomEvent<{ items: DndColumnItem[] }>) {
    dndItems = e.detail.items
  }

  function handleDndFinalize(e: CustomEvent<{ items: DndColumnItem[] }>) {
    dndItems = e.detail.items
  }

  function toggleVisibility(id: string) {
    dndItems = dndItems.map(item => (item.id === id ? { ...item, visible: !item.visible } : item))
  }

  function handleApply() {
    const preferences: ColumnPreference[] = dndItems.map(({ id, visible }) => ({ id, visible }))
    StorageUtil.setByUser(STORAGE_KEY, preferences)
    onApply(preferences)
    onOpenChange(false)
  }

  function handleReset() {
    StorageUtil.removeByUser(STORAGE_KEY)
    onApply(null)
    onOpenChange(false)
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>{m.customize_columns()}</Dialog.Title>
    </Dialog.Header>

    <div
      class="flex max-h-80 flex-col gap-2 overflow-y-auto"
      use:dndzone={{ items: dndItems, flipDurationMs: FLIP_DURATION_MS, dropTargetStyle: {} }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}>
      {#each dndItems as item (item._dndId)}
        <div
          class="flex cursor-grab items-center gap-2 rounded-md border bg-background px-3 py-2"
          animate:flip={{ duration: FLIP_DURATION_MS }}>
          <GripVertical class="size-4 shrink-0 text-muted-foreground" />
          <span class="flex-1 text-sm {item.visible ? '' : 'text-muted-foreground'}">{item.header}</span>
          <Switch
            checked={item.visible}
            disabled={item.visible && visibleCount <= 1}
            onCheckedChange={() => toggleVisibility(item.id)} />
        </div>
      {/each}
    </div>

    <Dialog.Footer>
      <Button variant="ghost" size="sm" onclick={handleReset}>{m.reset_defaults()}</Button>
      <Button size="sm" onclick={handleApply}>{m.common_save()}</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
