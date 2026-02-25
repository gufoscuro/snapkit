<script lang="ts" module>
  import type { ComponentContract } from '$lib/contexts/page-state'

  type CachedComponent = {
    Component: ConstructorOfATypedSvelteComponent
    contract: ComponentContract | null
  }

  // Shared cache at module level - exists once for the entire application
  const sharedComponentsCache = new Map<string, CachedComponent>()
</script>

<script lang="ts">
  import { browser } from '$app/environment'
  import { getComponent } from '$generated/components-registry'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import type { SnippetDefinition } from '$utils/page-registry'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext, type Snippet } from 'svelte'
  import SnippetBindingsProvider from './SnippetBindingsProvider.svelte'

  type SnippetResolverProps = {
    snippet: SnippetDefinition
    props?: Record<string, any>
    children?: Snippet
    fallback?: Snippet<[snippetProps: ReturnType<SnippetPropsGetter>]>
    class?: string
  }

  let { props, snippet, children, fallback, class: className }: SnippetResolverProps = $props()

  // Get the snippet props getter from context - $derived ensures reactivity
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  let snippetProps = $derived(getSnippetProps?.())

  // Component and contract are kept as a single object to guarantee they are always
  // updated atomically — prevents a transient render where a new Component is paired
  // with the previous componentContract (or null), which would cause useConsumes() to
  // read bindings from the wrong SnippetBindingsProvider context.
  let loaded = $state<CachedComponent | null>(null)
  let loading: boolean = $state(true)
  let error: any = $state(null)
  let latestKey: string = $state('')
  const debugActive = false

  function debugLog(...args: any[]) {
    if (debugActive) console.log('[SnippetResolver]', ...args)
  }

  async function loadSnippet(s: SnippetDefinition) {
    if (!s || !s.componentKey || !s.enabled) {
      loaded = null
      latestKey = ''
      loading = false
      return
    }
    if (latestKey === s.componentKey) return

    try {
      loading = true
      latestKey = s.componentKey

      // Check shared cache first
      const cached = sharedComponentsCache.get(s.componentKey)
      if (cached) {
        loaded = cached
        debugLog(`✓ Loaded from shared cache: ${s.componentKey}`)
        return
      }

      // Load and cache the component
      const componentDef = getComponent(s.componentKey)
      const customModule = await componentDef.component()
      const contract = customModule.contract ?? null

      const entry: CachedComponent = { Component: customModule.default, contract }
      sharedComponentsCache.set(s.componentKey, entry)
      loaded = entry
      debugLog(`✓ Loaded and cached component: ${s.componentKey}`, contract ? '(with contract)' : '(no contract)')
    } catch (err) {
      console.error(`Failed to load component:`, err)
      error = err
    } finally {
      loading = false
    }
  }

  function updateSnippet(s: SnippetDefinition) {
    if (!browser) return

    loadSnippet(s)
  }

  $effect(() => updateSnippet(snippet))
</script>

{#if loading}
  {#if children}
    {@render children?.()}
  {:else}
    <div class="py-2">
      <Skeleton class="mx-auto {className || 'h-10 w-60'}" />
    </div>
  {/if}
{:else if loaded?.contract}
  {#key loaded.contract.$id}
    <SnippetBindingsProvider contract={loaded.contract} bindings={snippet.bindings}>
      <loaded.Component {...snippetProps} {...props} />
    </SnippetBindingsProvider>
  {/key}
{:else if loaded}
  <loaded.Component {...snippetProps} {...props} />
{:else if fallback}
  {@render fallback?.(snippetProps)}
{/if}
