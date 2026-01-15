<script lang="ts">
  import { browser } from '$app/environment'
  import { getComponent } from '$generated/components-registry'
  import type { SnippetDefinition } from '$utils/page-registry'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetProps, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext, type Snippet } from 'svelte'

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
  let loading: boolean = $state(true)
  let error: any = $state(null)
  let latestKey: string = $state('')

  async function loadSnippet(s: SnippetDefinition) {
    if (!s || !s.componentKey || !s.enabled) {
      ComponentFunction = null
      latestKey = ''
      loading = false
      return
    }
    if (latestKey === s.componentKey) return

    try {
      loading = true
      latestKey = s.componentKey
      // await new Promise(resolve => setTimeout(resolve, Math.random() * 500)) // Simulate network latency
      const componentDef = getComponent(s.componentKey)
      const customModule = await componentDef.component()
      ComponentFunction = customModule.default
      console.log(`✓ Loaded custom component: ${s.componentKey}`)
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
      <div class="animate-pulse rounded bg-muted {className || 'h-10 w-60'}"></div>
    </div>
  {/if}
{:else if ComponentFunction}
  <ComponentFunction {...snippetProps} {...props} />
{:else}{/if}
