<script lang="ts">
  import { page } from '$app/state'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import type { BuilderPageConfig } from '$lib/admin/types'
  import { initPageState } from '$lib/contexts/page-state/page-state.svelte'
  import { tenantConfigStore } from '$lib/stores/tenant-config/store.svelte'
  import { routeTracker } from '$lib/utils/route-tracker'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'

  const pageId = $derived(page.params.pageId)

  // Get page config from parent window's pageStore (this iframe is embedded in page editor)
  let pageConfig = $state<BuilderPageConfig | undefined>(undefined)
  let selectedTenant = $state<{ name: string; vanity?: string } | undefined>(undefined)
  let isStoreLoaded = $state(false)

  // Access parent window's stores if available (iframe context)
  const updateFromParent = () => {
    try {
      const parentAdminStore = (window.parent as any).adminStore

      if (parentAdminStore?.state?.pages) {
        const pages = parentAdminStore.state.pages
        const config = pages.find((p: BuilderPageConfig) => p.$id === pageId)

        if (config) {
          // Create a deep copy to ensure reactivity
          pageConfig = JSON.parse(JSON.stringify(config))
          selectedTenant = parentAdminStore?.selectedTenant
          isStoreLoaded = true
        }
      }
    } catch (e) {
      // Cross-origin or access error - silently fail
    }
  }

  // Initial load from parent on mount
  $effect(() => {
    if (window.parent !== window) {
      updateFromParent()
    }
  })

  // Listen for events from parent (event-driven, no polling needed)
  function handleMessage(event: MessageEvent) {
    const { type } = event.data || {}

    // Update preview when snippets change or after save
    if (type === 'snippets-changed' || type === 'page-saved') {
      updateFromParent()
    }
  }

  initPageState()

  // Load tenant config and initialize route tracker
  $effect(() => {
    const tenant = selectedTenant
    if (tenant?.vanity) {
      tenantConfigStore
        .fetchTenantConfig(tenant.vanity)
        .then(() => {
          // Initialize route tracker with pages from loaded tenant
          routeTracker.setValidPageIds(tenantConfigStore.getAllPageIds())
        })
        .catch(error => {
          console.error('[Page Preview] Failed to load tenant config:', error)
        })
    }
  })

  $effect(() => {
    if (pageId) {
      setTimeout(() => console.log('[Page Preview] Broken links links:', routeTracker.getBrokenLinkIds()), 700)
    }
  })

  // Set up snippet props context for all components in the page
  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails: {
      config: pageConfig || {
        $id: pageId || 'unknown',
        title: 'Page not found',
        route: '/404',
        layout: { componentKey: 'layouts.Showoff', enabled: true },
        snippets: {},
      },
      params: {},
    },
    routeDetails: {
      url: new URL(page.url.href),
      search: page.url.search,
    },
    tenantInterfaceDetails: {
      name: selectedTenant?.name || 'Preview Tenant',
      mainMenu: [],
    },
  }))

  let contentWrapper = $state<HTMLElement | null>(null)

  // Send height updates to parent window (for iframe embedding)
  $effect(() => {
    if (!contentWrapper) return

    let lastSentHeight = 0
    let isUpdating = false

    const sendHeight = () => {
      if (!contentWrapper || isUpdating) return

      isUpdating = true

      // Use scrollHeight to get the full content height
      const height = Math.max(
        contentWrapper.scrollHeight,
        contentWrapper.offsetHeight,
        600, // minimum height
      )

      // Only send if height changed significantly (avoid micro-changes)
      if (Math.abs(height - lastSentHeight) > 5) {
        lastSentHeight = height
        window.parent.postMessage({ type: 'preview-height', height }, '*')
      }

      // Reset flag after a short delay
      setTimeout(() => {
        isUpdating = false
      }, 100)
    }

    // Initial height after component loads
    const timeout = setTimeout(sendHeight, 200)

    // Observe size changes with debouncing
    const resizeObserver = new ResizeObserver(() => {
      if (!isUpdating) {
        sendHeight()
      }
    })
    resizeObserver.observe(contentWrapper)

    return () => {
      clearTimeout(timeout)
      resizeObserver.disconnect()
    }
  })
</script>

<svelte:window onmessage={handleMessage} />

<svelte:head>
  <title>Page Preview: {pageConfig?.title || pageId}</title>
</svelte:head>

{#if pageConfig}
  <div class="flex flex-col" bind:this={contentWrapper}>
    <!-- Render the layout with all configured snippets -->
    <SnippetResolver snippet={pageConfig.layout} />
  </div>
{:else}
  <div class="flex min-h-150 items-center justify-center" bind:this={contentWrapper}>
    <div class="text-center">
      <h1 class="text-2xl font-bold">Page not found</h1>
      <p class="mt-2 text-muted-foreground">No page configuration found for ID: {pageId}</p>
      {#if !isStoreLoaded}
        <p class="mt-1 text-sm text-muted-foreground">Loading preview...</p>
      {/if}
    </div>
  </div>
{/if}
