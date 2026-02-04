<!--
	@component ComponentPicker
	@description Dialog to select a component from the registry
	@keywords admin, component, picker, dialog, registry
-->
<script lang="ts">
  import { COMPONENT_REGISTRY, getAllComponentKeys, type ComponentKey } from '$generated/components-registry'
  import { pageStore } from '$lib/admin/stores/page-store.svelte'
  import type { ExtendedSnippetDefinition } from '$lib/admin/types'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { getContract, type ComponentCompatibility } from '$lib/contracts'
  import Search from '@lucide/svelte/icons/search'

  interface Props {
    open: boolean
    title?: string
    filter?: (key: ComponentKey) => boolean
    onSelect: (key: ComponentKey) => void
    onClose: () => void
    pageSnippets?: Record<string, ExtendedSnippetDefinition>
  }

  const { open, title = 'Select Component', filter, onSelect, onClose, pageSnippets }: Props = $props()

  let searchQuery = $state('')

  const allKeys = getAllComponentKeys()

  // Get compatibility data from pageStore
  const compatibilityMap = $derived(pageStore.compatibilityMap)
  const isAnalyzing = $derived(pageStore.isAnalyzing)

  interface CategorizedComponent {
    key: ComponentKey
    category: 'recommended' | 'other'
    compatibility?: ComponentCompatibility
  }

  function isCompatible(compat: ComponentCompatibility | undefined): boolean {
    if (!compat) return false

    const canSatisfyConsumes = (compat.canSatisfyConsumes?.length ?? 0) > 0
    const totalConsumes = Object.keys(compat.contract.consumes).length
    const canConsumeFromPage = totalConsumes > 0 && compat.consumesUnsatisfied.length < totalConsumes

    return canSatisfyConsumes || canConsumeFromPage
  }

  const sortedKeys = $derived((): CategorizedComponent[] => {
    let keys = filter ? allKeys.filter(filter) : allKeys

    // Filter out components already in the page
    if (pageSnippets) {
      const usedComponentKeys = new Set(Object.values(pageSnippets).map(s => s.componentKey))
      keys = keys.filter(k => !usedComponentKeys.has(k))
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      keys = keys.filter(k => k.toLowerCase().includes(query))
    }

    // If no page context, return keys in original order
    if (!pageSnippets || !compatibilityMap || compatibilityMap.size === 0) {
      return keys.map(key => ({ key, category: 'other' as const }))
    }

    // Categorize and sort
    const categorized = keys.map(key => {
      const compat = compatibilityMap.get(key)
      const category = isCompatible(compat) ? 'recommended' : 'other'

      return { key, category: category as 'recommended' | 'other', compatibility: compat }
    })

    return categorized.sort((a, b) => {
      if (a.category !== b.category) return a.category === 'recommended' ? -1 : 1
      return a.key.localeCompare(b.key)
    })
  })

  // Group keys by domain (for fallback when no page context)
  const groupedKeys = $derived(() => {
    const groups: Record<string, ComponentKey[]> = {}

    const keys = sortedKeys()
      .filter(item => item.category === 'other')
      .map(item => item.key)

    for (const key of keys) {
      const domain = key.split('.')[0]
      if (!groups[domain]) {
        groups[domain] = []
      }
      groups[domain].push(key)
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  })

  function findComponentsByNamespace(
    predicate: (contract: NonNullable<ReturnType<typeof getContract>>) => boolean,
  ): string[] {
    if (!pageSnippets) return []

    return Array.from(
      new Set(
        Object.values(pageSnippets)
          .map(snip => {
            const contract = getContract(snip.componentKey)
            return contract && predicate(contract) ? snip.componentKey : null
          })
          .filter(Boolean) as string[],
      ),
    )
  }

  function getCompatibilityDescription(key: ComponentKey, compat?: ComponentCompatibility): string | null {
    if (!compat || !pageSnippets) return null

    // Case 1: This component provides what other components need
    if ((compat.canSatisfyConsumes?.length ?? 0) > 0) {
      const namespaces = compat.canSatisfyConsumes!.map(c => c.namespace).join(', ')
      const consumers = findComponentsByNamespace(contract =>
        compat.canSatisfyConsumes!.some(c => Object.keys(contract.consumes).includes(c.namespace)),
      )

      return consumers.length > 0
        ? `Works with ${consumers.join(', ')} - provides ${namespaces}`
        : `Provides ${namespaces}`
    }

    // Case 2: This component can consume from components in page
    const satisfiedNamespaces = Object.keys(compat.contract.consumes).filter(
      ns => !compat.consumesUnsatisfied.some(u => u.namespace === ns),
    )

    if (satisfiedNamespaces.length > 0) {
      const providers = findComponentsByNamespace(contract =>
        satisfiedNamespaces.some(ns => Object.keys(contract.provides).includes(ns)),
      )

      if (providers.length > 0) {
        return `Can use ${satisfiedNamespaces.join(', ')} from ${providers.join(', ')}`
      }
    }

    return null
  }

  function handleSelect(key: ComponentKey) {
    onSelect(key)
    searchQuery = ''
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      searchQuery = ''
      onClose()
    }
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="min-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>Choose a component from the registry</Dialog.Description>
    </Dialog.Header>

    <div class="relative overflow-hidden">
      <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input bind:value={searchQuery} placeholder="Search components..." class="pl-9" />
    </div>

    <ScrollArea class="h-[400px] pr-4">
      {#if isAnalyzing}
        <div class="flex items-center justify-center py-8">
          <p class="text-sm text-muted-foreground">Analyzing compatibility...</p>
        </div>
      {:else if sortedKeys().length === 0}
        <p class="py-8 text-center text-muted-foreground">No components found</p>
      {:else if !pageSnippets || compatibilityMap.size === 0}
        <!-- Fallback to original grouped view when no page context -->
        <div class="space-y-4">
          {#each groupedKeys() as [domain, keys] (domain)}
            <div>
              <h4 class="mb-2 text-sm font-medium text-gray-500 capitalize">{domain}</h4>
              <div class="space-y-1">
                {#each keys as key (key)}
                  <button
                    type="button"
                    class="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    onclick={() => handleSelect(key)}>
                    <div class="font-mono text-xs">{key}</div>
                    <div class="text-xs text-muted-foreground">
                      {COMPONENT_REGISTRY[key].description}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- New sorted list with compatibility descriptions -->
        <div class="space-y-1">
          {#each sortedKeys() as item (item.key)}
            {@const description = getCompatibilityDescription(item.key, item.compatibility)}
            <button
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
              onclick={() => handleSelect(item.key)}>
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1 overflow-hidden">
                  <!-- Component Key -->
                  <div class="truncate font-mono text-xs">{item.key}</div>

                  <!-- Original Description -->
                  <div class="mt-0.5 text-xs text-muted-foreground">
                    {COMPONENT_REGISTRY[item.key].description}
                  </div>

                  <!-- Compatibility Description -->
                  {#if description}
                    <div class="mt-1.5 text-xs font-medium break-words text-blue-600">
                      {description}
                    </div>
                  {/if}
                </div>

                <!-- Badge and Icon aligned right (only for recommended) -->
                {#if item.category === 'recommended'}
                  <div class="flex shrink-0 items-center gap-2">
                    <Badge variant="default" class="bg-blue-500 py-0 text-[10px]">Recommended</Badge>
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </ScrollArea>

    <Dialog.Footer>
      <Button variant="outline" onclick={onClose}>Cancel</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
