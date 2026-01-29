<!--
	@component PageEditor
	@description Main editor for configuring a page's metadata, layout, and snippets
	@keywords admin, page, editor, builder
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { getComponent, type ComponentKey } from '$generated/components-registry'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/store.svelte'
  import type { BuilderPageConfig, LayoutSlotDefinition } from '$lib/admin/types'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import Save from '@lucide/svelte/icons/save'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'
  import ComponentPicker from './ComponentPicker.svelte'
  import SnippetSlotEditor from './SnippetSlotEditor.svelte'

  interface Props {
    page: BuilderPageConfig
  }

  const { page }: Props = $props()

  let showLayoutPicker = $state(false)
  let showSnippetPicker = $state(false)
  let selectedSlotName = $state<string | null>(null)
  let isSaving = $state(false)
  let layoutSlots = $state<LayoutSlotDefinition[]>([])

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

  // Build the tenant-based URL for the page
  function buildTenantPageUrl(): string | null {
    const tenant = adminStore.state.tenants.find(t => t.id === page.tenantId)
    if (!tenant) return null

    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port

    const parts = hostname.split('.')
    const baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname

    const portSuffix = port ? `:${port}` : ''
    const url = `${protocol}//${tenant.vanity}.${baseDomain}${portSuffix}${page.route}`
    return url
  }

  const tenantPageUrl = $derived(buildTenantPageUrl())

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

  function handleSlotComponentSelect(componentKey: ComponentKey) {
    if (!selectedSlotName) return
    adminStore.addSnippet(page.$id, selectedSlotName, {
      componentKey,
      enabled: true,
    })
    selectedSlotName = null
    showSnippetPicker = false
  }

  function openSnippetPickerForSlot(slotName: string) {
    selectedSlotName = slotName
    showSnippetPicker = true
  }

  function handleDeletePage() {
    const pageTitle = page.title // Capture title before deletion
    confirmDelete({
      title: 'Delete Page',
      description: `Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`,
      confirm: {
        text: 'Delete Page',
      },
      onConfirm: async () => {
        adminStore.deletePage(page.$id)
        toast.success(`Page "${pageTitle}" deleted successfully`)
        goto(adminPagesRoute())
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
</script>

<div class="space-y-6">
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Page Settings</CardTitle>
        <div class="flex gap-2">
          {#if tenantPageUrl}
            <Button
              variant="outline"
              size="sm"
              onclick={() => window.open(tenantPageUrl, '_blank')}
              title="Open page in new tab">
              <ExternalLink class="mr-2 size-4" />
              View Page
            </Button>
          {/if}
          <Button variant="destructive" size="sm" onclick={handleDeletePage}>
            <Trash2 class="mr-2 size-4" />
            Delete Page
          </Button>
          <Button size="sm" onclick={handleSave} disabled={isSaving}>
            <Save class="mr-2 size-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="page-title">Title</Label>
        <Input id="page-title" value={page.title} oninput={handleTitleChange} placeholder="Page Title" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="page-route">Route</Label>
          <Input id="page-route" value={page.route} oninput={handleRouteChange} placeholder="/path/:param" />
          <p class="text-xs text-muted-foreground">Supports dynamic params like :uuid (e.g., /orders/:uuid)</p>
        </div>
        <div class="space-y-2">
          <Label for="page-id">Page ID</Label>
          <Input id="page-id" value={page.$id} oninput={handleIdChange} placeholder="unique-page-id" />
          <p class="text-xs text-muted-foreground">Used for route generation</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Layout</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex items-center gap-4">
        <code class="rounded bg-muted px-2 py-1 text-sm">{page.layout.componentKey}</code>
        <Button variant="outline" size="sm" onclick={() => (showLayoutPicker = true)}>Change Layout</Button>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Snippets</CardTitle>
    </CardHeader>
    <CardContent>
      {#if layoutSlots.length === 0}
        <p class="text-sm text-muted-foreground">This layout has no configurable slots.</p>
      {:else}
        <div class="space-y-4">
          {#each layoutSlots as slot (slot.name)}
            {@const snippet = page.snippets[slot.name]}
            <div class="rounded-lg border p-4">
              <div class="mb-2 flex items-center justify-between">
                <div>
                  <h4 class="font-medium">{slot.label}</h4>
                  <p class="text-xs text-muted-foreground">{slot.description}</p>
                </div>
              </div>
              {#if snippet}
                <SnippetSlotEditor pageId={page.$id} slotName={slot.name} {snippet} />
              {:else}
                <Button variant="outline" size="sm" onclick={() => openSnippetPickerForSlot(slot.name)}>
                  Select component for {slot.label}
                </Button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>

<ComponentPicker
  open={showLayoutPicker}
  title="Select Layout"
  filter={key => key.startsWith('layouts.')}
  onSelect={handleLayoutSelect}
  onClose={() => (showLayoutPicker = false)} />

<ComponentPicker
  open={showSnippetPicker}
  title="Select Component for {selectedSlotName}"
  onSelect={handleSlotComponentSelect}
  onClose={() => (showSnippetPicker = false)} />
