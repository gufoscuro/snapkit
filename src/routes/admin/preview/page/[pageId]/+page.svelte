<script lang="ts">
  import { page } from '$app/state'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { pages } from '$generated/admin-config'
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import type { BuilderPageConfig } from '$lib/admin/types'
  import { initPageState } from '$lib/contexts/page-state/page-state.svelte'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'

  const pageId = $derived(page.params.pageId)

  // Find the page configuration from generated files (static)
  const pageConfig = $derived(pages.find(p => p.$id === pageId) as BuilderPageConfig | undefined)

  const selectedTenant = $derived(adminStore.selectedTenant)

  initPageState()

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
      <p class="mt-1 text-sm text-muted-foreground">Available pages: {pages.map(p => p.$id).join(', ')}</p>
    </div>
  </div>
{/if}
