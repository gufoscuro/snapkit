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
  import type { SnippetDefinition } from '$utils/page-registry'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext, type Snippet } from 'svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import SnippetBindingsProvider from './SnippetBindingsProvider.svelte'

  type SnippetResolverProps = {
    snippet: SnippetDefinition
    props?: Record<string, any>
    children?: Snippet
    class?: string
  }

  let { props, snippet, children, class: className }: SnippetResolverProps = $props()

  // Get the snippet props getter from context - $derived ensures reactivity
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  let snippetProps = $derived(getSnippetProps?.())
  let ComponentFunction = $state<ConstructorOfATypedSvelteComponent | null>(null)
  let componentContract = $state<ComponentContract | null>(null)
  let loading: boolean = $state(true)
  let error: any = $state(null)
  let latestKey: string = $state('')

  async function loadSnippet(s: SnippetDefinition) {
    if (!s || !s.componentKey || !s.enabled) {
      ComponentFunction = null
      componentContract = null
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
        ComponentFunction = cached.Component
        componentContract = cached.contract
        console.log(`✓ Loaded from shared cache: ${s.componentKey}`)
        return
      }

      // Load and cache the component
      const componentDef = getComponent(s.componentKey)
      const customModule = await componentDef.component()
      const contract = customModule.contract ?? null

      sharedComponentsCache.set(s.componentKey, {
        Component: customModule.default,
        contract,
      })

      ComponentFunction = customModule.default
      componentContract = contract
      console.log(`✓ Loaded and cached component: ${s.componentKey}`, contract ? '(with contract)' : '(no contract)')
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
{:else if ComponentFunction}
  {#if componentContract}
    <SnippetBindingsProvider contract={componentContract} bindings={snippet.bindings}>
      <ComponentFunction {...snippetProps} {...props} />
    </SnippetBindingsProvider>
  {:else}
    <ComponentFunction {...snippetProps} {...props} />
  {/if}
{:else}{/if}
