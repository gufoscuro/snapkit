<!--
	@component PageDetailSidebar
	@description Sidebar for editing page configuration (layout, snippets, metadata)
	@keywords admin, pages, sidebar, detail, editor
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { getComponent, type ComponentKey } from '$generated/components-registry'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { autoSave } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { BuilderPageConfig, LayoutSlotDefinition } from '$lib/admin/types'
  import * as Accordion from '$lib/components/ui/accordion'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import ComponentPicker from './ComponentPicker.svelte'
  import SnippetSlotEditor from './SnippetSlotEditor.svelte'

  interface Props {
    page: BuilderPageConfig
  }

  const { page }: Props = $props()

  let showLayoutPicker = $state(false)
  let showSnippetPicker = $state(false)
  let selectedSlotName = $state<string | null>(null)
  let layoutSlots = $state<LayoutSlotDefinition[]>([])

  function goBack() {
    adminStore.clearSelection()
    goto(adminPagesRoute())
  }

  // Load layout slots when layout changes
  async function loadLayoutSlots(layoutKey: ComponentKey) {
    try {
      const componentDef = getComponent(layoutKey)
      const module = await componentDef.component()
      layoutSlots = module.slots ?? []
    } catch (e) {
      console.error('Failed to load layout slots:', e)
      layoutSlots = []
    }
  }

  // Load slots on mount and when layout changes
  $effect(() => {
    loadLayoutSlots(page.layout.componentKey)
  })

  function handleTitleChange(e: Event) {
    adminStore.updatePage(page.$id, { title: (e.target as HTMLInputElement).value })
  }

  function handleIdChange(e: Event) {
    adminStore.updatePage(page.$id, { $id: (e.target as HTMLInputElement).value })
  }

  function handleRouteChange(e: Event) {
    adminStore.updatePage(page.$id, { route: (e.target as HTMLInputElement).value })
  }

  function handleLayoutSelect(componentKey: ComponentKey) {
    // When layout changes, clear snippets since slots may be different
    adminStore.updatePage(page.$id, {
      layout: { ...page.layout, componentKey },
      snippets: {},
    })
    showLayoutPicker = false
  }

  async function handleSlotComponentSelect(componentKey: ComponentKey) {
    if (!selectedSlotName) return
    adminStore.addSnippet(page.$id, selectedSlotName, {
      componentKey,
      enabled: true,
    })
    selectedSlotName = null
    showSnippetPicker = false

    // Auto-save after adding snippet
    await autoSave(true, 'Component added and saved')
  }

  function openSnippetPickerForSlot(slotName: string) {
    selectedSlotName = slotName
    showSnippetPicker = true
  }

  const tenant = $derived(adminStore.state.tenants.find(t => t.id === page.tenantId))
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel class="mb-2">
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={goBack}>
      <ArrowLeft class="size-4" />
    </Button>
  </Sidebar.GroupLabel>
  <Sidebar.GroupContent class="space-y-3 p-3">
    <!-- Accordion for organized sections -->
    <Accordion.Root class="w-full" type="multiple" value={['settings']}>
      <!-- Page Settings Section -->
      <Accordion.Item value="settings">
        <Accordion.Trigger class="text-sm">Page Settings</Accordion.Trigger>
        <Accordion.Content>
          <div class="space-y-3 pt-2">
            <div class="space-y-1.5">
              <Label for="page-title" class="text-xs">Title</Label>
              <Input
                id="page-title"
                value={page.title}
                oninput={handleTitleChange}
                placeholder="Page Title"
                class="h-8 text-sm" />
            </div>
            <div class="space-y-1.5">
              <Label for="page-route" class="text-xs">Route</Label>
              <Input
                id="page-route"
                value={page.route}
                oninput={handleRouteChange}
                placeholder="/path/:param"
                class="h-8 text-sm" />
              <p class="text-xs text-muted-foreground">Dynamic params: :uuid</p>
            </div>
            <div class="space-y-1.5">
              <Label for="page-id" class="text-xs">Page ID</Label>
              <Input
                id="page-id"
                value={page.$id}
                oninput={handleIdChange}
                placeholder="unique-page-id"
                class="h-8 text-sm" />
            </div>
            {#if tenant}
              <div class="space-y-1.5">
                <Label class="text-xs">Tenant</Label>
                <div class="rounded-md border bg-muted px-2 py-1.5 text-xs">{tenant.name}</div>
              </div>
            {/if}
          </div>
        </Accordion.Content>
      </Accordion.Item>

      <!-- Layout Section -->
      <Accordion.Item value="layout">
        <Accordion.Trigger class="text-sm">Layout</Accordion.Trigger>
        <Accordion.Content>
          <div class="space-y-3 pt-2">
            <div class="space-y-1.5">
              <Label class="text-xs">Current</Label>
              <code class="block truncate rounded bg-muted px-2 py-1 text-xs" title={page.layout.componentKey}>
                {page.layout.componentKey}
              </code>
            </div>
            <Button variant="outline" size="sm" class="h-8 w-full text-xs" onclick={() => (showLayoutPicker = true)}>
              Change Layout
            </Button>
          </div>
        </Accordion.Content>
      </Accordion.Item>

      <!-- Content Snippets Section -->
      <Accordion.Item value="snippets">
        <Accordion.Trigger class="text-sm">
          Snippets ({Object.keys(page.snippets).length}/{layoutSlots.length})
        </Accordion.Trigger>
        <Accordion.Content>
          <div class="space-y-3 pt-2">
            {#if layoutSlots.length === 0}
              <p class="text-xs text-muted-foreground">No configurable slots</p>
            {:else}
              {#each layoutSlots as slot (slot.name)}
                {@const snippet = page.snippets[slot.name]}
                <div class="space-y-2 rounded-lg border p-2">
                  <div>
                    <h4 class="text-xs font-medium">{slot.label}</h4>
                    <p class="text-xs text-muted-foreground">{slot.description}</p>
                  </div>
                  {#if snippet}
                    <SnippetSlotEditor pageId={page.$id} slotName={slot.name} {snippet} pageSnippets={page.snippets} />
                  {:else}
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-8 w-full text-xs"
                      onclick={() => openSnippetPickerForSlot(slot.name)}>
                      Select component
                    </Button>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  </Sidebar.GroupContent>
</Sidebar.Group>

<ComponentPicker
  open={showLayoutPicker}
  title="Select Layout"
  filter={key => key.startsWith('layouts.')}
  onSelect={handleLayoutSelect}
  onClose={() => (showLayoutPicker = false)}
  pageSnippets={page.snippets} />

<ComponentPicker
  open={showSnippetPicker}
  title="Select Component for {selectedSlotName}"
  onSelect={handleSlotComponentSelect}
  onClose={() => (showSnippetPicker = false)}
  pageSnippets={page.snippets} />
