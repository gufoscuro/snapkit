<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import type { ComponentKey } from '$generated/components-registry'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import { pageStore } from '$lib/admin/stores/page-store.svelte'
  import type { ExtendedSnippetDefinition } from '$lib/admin/types'
  import { formatBlockName, formatComponentKey } from '$lib/admin/utils'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import { getAllContracts, getContract, loadContractRegistry } from '$lib/contracts'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import LayoutTemplate from '@lucide/svelte/icons/layout-template'
  import Lightbulb from '@lucide/svelte/icons/lightbulb'
  import Save from '@lucide/svelte/icons/save'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'

  const pageId = $derived(page.params.id)
  const currentPage = $derived(adminStore.state.pages.find(p => p.$id === pageId))
  let isSaving = $state(false)
  let iframeHeight = $state(800)
  let previewIframe = $state<HTMLIFrameElement | null>(null)

  // Track snippets changes for deep reactivity
  const snippetsKey = $derived(currentPage ? JSON.stringify(currentPage.snippets) : null)

  // Select page from URL param
  $effect(() => {
    if (pageId && adminStore.state.selection.id !== pageId) {
      adminStore.selectPage(pageId)
    }
  })

  // Initialize page store when page changes or snippets change
  $effect(() => {
    if (currentPage) {
      pageStore.setPage(currentPage.$id, currentPage.snippets)
    } else {
      pageStore.clear()
    }
  })

  // Expose stores to iframe preview (so preview can access parent data)
  $effect(() => {
    if (typeof window !== 'undefined') {
      (window as any).pageStore = pageStore;
      (window as any).adminStore = adminStore
    }
  })

  // Notify iframe when snippets change (reactive live preview)
  $effect(() => {
    snippetsKey // React to snippets changes
    if (previewIframe?.contentWindow) {
      previewIframe.contentWindow.postMessage({
        type: 'snippets-changed'
      }, window.location.origin)
    }
  })

  // Build the tenant-based URL for the page
  function buildTenantPageUrl(): string | null {
    if (!currentPage) return null
    const tenant = adminStore.state.tenants.find(t => t.id === currentPage.tenantId)
    if (!tenant) return null

    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port

    const parts = hostname.split('.')
    const baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname

    const portSuffix = port ? `:${port}` : ''
    const url = `${protocol}//${tenant.vanity}.${baseDomain}${portSuffix}${currentPage.route}`
    return url
  }

  // Build preview URL for iframe
  function buildPreviewUrl(): string | null {
    if (!currentPage) return null
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port
    const portSuffix = port ? `:${port}` : ''
    return `${protocol}//${hostname}${portSuffix}/admin/preview/page/${currentPage.$id}`
  }

  const tenantPageUrl = $derived(buildTenantPageUrl())
  const previewUrl = $derived(buildPreviewUrl())

  async function handleSave() {
    isSaving = true
    const result = await saveAdminConfig()
    if (result.success) {
      toast.success(result.message)
      // Notify iframe preview that data was saved
      if (previewIframe?.contentWindow) {
        previewIframe.contentWindow.postMessage({ type: 'page-saved' }, window.location.origin)
      }
    } else {
      toast.error(result.message)
    }
    isSaving = false
  }

  function handleDeletePage() {
    if (!currentPage) return
    const pageTitle = currentPage.title
    confirmDelete({
      title: 'Delete Page',
      description: `Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`,
      confirm: {
        text: 'Delete Page',
      },
      onConfirm: async () => {
        adminStore.deletePage(currentPage.$id)
        toast.success(`Page "${pageTitle}" deleted successfully`)
        await goto(adminPagesRoute())
      },
    })
  }

  // Listen for height updates from iframe
  function handleMessage(event: MessageEvent) {
    if (event.data?.type === 'preview-height' && typeof event.data.height === 'number') {
      iframeHeight = Math.max(600, event.data.height + 40) // Add some padding
    }
  }

  // Calculate page-level suggestions
  interface Suggestion {
    type: 'provider' | 'consumer'
    namespace: string
    components: ComponentKey[]
    forComponent: ComponentKey
  }

  let pageSuggestions = $state<Suggestion[]>([])

  interface GroupedSuggestion {
    type: 'provider' | 'consumer'
    namespace: string
    components: ComponentKey[]
    forComponents: ComponentKey[]
  }

  // Group suggestions by type, namespace, and components
  const groupedSuggestions = $derived.by((): GroupedSuggestion[] => {
    const groups = new Map<string, GroupedSuggestion>()

    for (const suggestion of pageSuggestions) {
      // Create a unique key for grouping (use toSorted to avoid mutation)
      const key = `${suggestion.type}:${suggestion.namespace}:${[...suggestion.components].sort().join(',')}`

      const existing = groups.get(key)
      if (existing) {
        // Add forComponent to existing group if not already present
        if (!existing.forComponents.includes(suggestion.forComponent)) {
          existing.forComponents.push(suggestion.forComponent)
        }
      } else {
        // Create new group
        groups.set(key, {
          type: suggestion.type,
          namespace: suggestion.namespace,
          components: suggestion.components,
          forComponents: [suggestion.forComponent],
        })
      }
    }

    return Array.from(groups.values())
  })

  async function calculatePageSuggestions() {
    if (!currentPage || Object.keys(currentPage.snippets).length === 0) {
      pageSuggestions = []
      return
    }

    await loadContractRegistry()

    const results: Suggestion[] = []
    const snippets = Object.values(currentPage.snippets) as ExtendedSnippetDefinition[]
    const usedComponentKeys = new Set(snippets.map(s => s.componentKey))

    // Iterate through all components in the page
    snippets.forEach((snippet) => {
      const contract = getContract(snippet.componentKey)
      if (!contract) return

      // Case 1: This component CONSUMES - suggest providers not yet in page
      Object.keys(contract.consumes).forEach(namespace => {
        const hasProvider = snippets.some(s => {
          const providerContract = getContract(s.componentKey)
          return providerContract && Object.keys(providerContract.provides).includes(namespace)
        })

        if (!hasProvider) {
          const providers = getAllContracts()
            .filter(c => Object.keys(c.contract.provides).includes(namespace) && !usedComponentKeys.has(c.componentKey))
            .map(c => c.componentKey)

          if (providers.length > 0) {
            results.push({
              type: 'provider',
              namespace,
              components: providers,
              forComponent: snippet.componentKey,
            })
          }
        }
      })

      // Case 2: This component PROVIDES - suggest consumers not yet in page
      Object.keys(contract.provides).forEach(namespace => {
        const consumers = getAllContracts()
          .filter(c => Object.keys(c.contract.consumes).includes(namespace) && !usedComponentKeys.has(c.componentKey))
          .map(c => c.componentKey)

        if (consumers.length > 0) {
          results.push({
            type: 'consumer',
            namespace,
            components: consumers,
            forComponent: snippet.componentKey,
          })
        }
      })
    })

    pageSuggestions = results
  }

  $effect(() => {
    snippetsKey // React to snippet changes
    calculatePageSuggestions()
  })
</script>

<svelte:window onmessage={handleMessage} />

{#if !currentPage}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <h3 class="mb-2 text-lg font-semibold">Page not found</h3>
    <p class="mb-4 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been removed.</p>
    <Button onclick={() => goto(adminPagesRoute())}>
      <ArrowLeft class="mr-2 size-4" />
      Back to pages
    </Button>
  </div>
{:else}
  <div class="-m-6 flex h-full flex-col">
    <div class="flex items-center justify-between border-b bg-white px-6 py-4">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">{currentPage.title}</h1>
      </div>
      <div class="flex gap-2">
        {#if tenantPageUrl}
          <Button variant="ghost" size="icon" onclick={() => window.open(tenantPageUrl, '_blank')} title="View page">
            <ExternalLink class="size-4" />
          </Button>
        {/if}
        <Button
          variant="ghost"
          size="icon"
          class="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onclick={handleDeletePage}
          title="Delete page">
          <Trash2 class="size-4" />
        </Button>
        <Button size="sm" onclick={handleSave} disabled={isSaving}>
          <Save class="mr-2 size-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>

    <!-- Preview area -->
    <div class="flex-1 overflow-auto bg-gray-50 p-6">
      <div class="mx-auto space-y-4">
        <!-- Page-level Suggestions -->
        {#if groupedSuggestions.length > 0}
          <div class="space-y-2">
            {#each groupedSuggestions as suggestion}
              <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 text-blue-700">
                    <Lightbulb class="size-4 shrink-0" />
                    <span>
                      {#if suggestion.type === 'provider'}
                        Add <span class="font-semibold"
                          >{suggestion.components.map(formatComponentKey).join(' or ')}</span>
                        to enable <span class="font-semibold">{formatBlockName(suggestion.namespace)}</span>
                        for <span class="font-semibold">{suggestion.forComponents.map(formatComponentKey).join(', ')}</span>
                      {:else}
                        <span class="font-semibold">{suggestion.components.map(formatComponentKey).join(', ')}</span>
                        {suggestion.components.length === 1 ? 'is' : 'are'} compatible with
                        <span class="font-semibold">{suggestion.forComponents.map(formatComponentKey).join(', ')}</span>
                        already in your page
                      {/if}
                    </span>
                  </div>
                  <Badge variant="default" class="shrink-0 bg-blue-500 py-0 text-[10px]">Recommended</Badge>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Preview iframe -->
        {#if previewUrl}
          {#if Object.keys(currentPage.snippets).length === 0}
            <div
              class="flex min-h-125 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 to-muted/10 p-12">
              <div class="max-w-md text-center">
                <div class="mb-4 inline-flex size-20 items-center justify-center rounded-full bg-muted-foreground/5">
                  <LayoutTemplate class="size-10 text-muted-foreground/40" />
                </div>
                <h3 class="mb-3 text-2xl font-bold text-muted-foreground/60">Empty page</h3>
                <p class="mb-2 text-base text-muted-foreground/50">
                  Get started by adding components to the <strong class="font-semibold text-muted-foreground/70"
                    >Snippets</strong> section in the sidebar.
                </p>
                <p class="text-sm text-muted-foreground/40">
                  Your page preview will appear here once you add at least one component.
                </p>
              </div>
            </div>
          {:else}
            <div class="rounded-lg bg-white p-4">
              <iframe
                bind:this={previewIframe}
                src={previewUrl}
                title="Page Preview"
                class="w-full border-0"
                style="height: {iframeHeight}px;"></iframe>
            </div>
          {/if}
        {:else}
          <div class="flex items-center justify-center rounded-lg border bg-white p-12">
            <p class="text-muted-foreground">Preview not available</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
