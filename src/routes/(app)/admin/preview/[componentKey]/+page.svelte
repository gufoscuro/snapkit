<script lang="ts">
  import { page } from '$app/state'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { COMPONENT_REGISTRY } from '$generated/components-registry'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import { initPageState } from '$lib/contexts/page-state/page-state.svelte'
  import { tenantConfigStore } from '$lib/stores/tenant-config/store.svelte'
  import { routeTracker } from '$lib/utils/route-tracker'
  import type { SnippetDefinition } from '$utils/page-registry'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'

  const selectedTenant = $derived(adminStore.selectedTenant)
  const componentKey = $derived(page.params.componentKey)

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
          console.error('[Preview] Failed to load tenant config:', error)
        })
    }
  })

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails: {
      config: {
        $id: `${componentKey}`,
        title: `Preview: ${componentKey}`,
        route: `/admin/preview/${componentKey}`,
        layout: { componentKey: 'layouts.Showoff', enabled: true },
        snippets: {},
      },
      params: {},
    },
    routeDetails: {
      url: new URL('http://localhost'),
      search: page.url.search,
    },
    tenantInterfaceDetails: {
      name: selectedTenant?.name || 'Preview Tenant',
      mainMenu: adminStore.currentTenantMenus[0]?.items || [],
    },
  }))

  const componentDefinition: SnippetDefinition = {
    componentKey: page.params.componentKey as keyof typeof COMPONENT_REGISTRY,
    enabled: true,
  }

  // Load mock data client-side using dynamic import
  let mockData = $state<any>({})
  let contentWrapper = $state<HTMLElement | null>(null)

  $effect(() => {
    if (componentKey) {
      loadMockData(componentKey)
    }
  })

  async function loadMockData(key: string) {
    try {
      // Convert component key to file path
      // e.g., "globals.PageTitle" -> "globals/PageTitle"
      const parts = key.split('.')
      const componentName = parts.pop() || ''
      const path = parts.join('/')

      const mockModule = await import(`$lib/components/features/${path}/${componentName}.mock.ts`)
      mockData = mockModule.default || {}
    } catch (error) {
      console.log(`No mock data found for ${key}`)
      mockData = {}
    }
  }

  // Send height updates to parent window
  $effect(() => {
    if (!contentWrapper) return

    let lastSentHeight = 0

    const sendHeight = () => {
      if (!contentWrapper) return

      // Get the actual height of the content wrapper
      const height = contentWrapper.offsetHeight

      // Only send if height is valid and changed
      if (height > 0 && height !== lastSentHeight) {
        lastSentHeight = height
        window.parent.postMessage({ type: 'preview-height', height }, window.location.origin)
      }
    }

    const timeout1 = setTimeout(sendHeight, 100)

    // Observe size changes ONLY on the content wrapper
    const resizeObserver = new ResizeObserver(sendHeight)
    resizeObserver.observe(contentWrapper)

    return () => {
      clearTimeout(timeout1)
      resizeObserver.disconnect()
    }
  })
</script>

<svelte:head>
  <title>Component Preview: {componentKey}</title>
</svelte:head>

<div style="min-height:600px" bind:this={contentWrapper}>
  <SnippetResolver snippet={componentDefinition} />
</div>
