<script lang="ts">
  import { page } from '$app/state'
  import { COMPONENT_REGISTRY } from '$generated/components-registry'
  import { setSnippetBindings } from '$lib/contexts/page-state/bindings.svelte'
  import { initPageState } from '$lib/contexts/page-state/page-state.svelte'

  // Initialize context for preview
  initPageState()
  setSnippetBindings({ provides: {}, consumes: {} })

  const componentKey = $derived(page.params.componentKey)
  const componentEntry = $derived(COMPONENT_REGISTRY[componentKey as keyof typeof COMPONENT_REGISTRY])

  // Load mock data client-side using dynamic import
  let mockData = $state<any>({})

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
</script>

<svelte:head>
  <title>Component Preview: {componentKey}</title>
</svelte:head>

<div class="preview-container p-4">
  {#if !componentEntry}
    <div class="text-center text-red-500">
      <p>Component not found: {componentKey}</p>
    </div>
  {:else}
    {#await componentEntry.component()}
      <div class="text-center text-gray-500">Loading component...</div>
    {:then module}
      {@const Component = module.default}
      <Component {...mockData} />
    {:catch error}
      <div class="text-center text-red-500">
        <p>Error loading component:</p>
        <pre class="mt-2 text-sm">{error.message}</pre>
      </div>
    {/await}
  {/if}
</div>

<style>
  .preview-container {
    min-height: 100vh;
    background: white;
  }
</style>
