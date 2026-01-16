<!--
  @component SnippetBindingsProvider
  @description Internal component that sets bindings context for snippet components.
               Used by SnippetResolver to provide bindings to components with contracts.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { ComponentContract, BindingConfig } from '$lib/contexts/page-state'
  import { resolveBindings, setSnippetBindings } from '$lib/contexts/page-state'

  interface Props {
    contract: ComponentContract
    bindings?: BindingConfig
    children: Snippet
  }

  let { contract, bindings, children }: Props = $props()

  // Resolve and set bindings during component initialization
  const resolvedBindings = resolveBindings(contract, bindings)
  setSnippetBindings(resolvedBindings)
</script>

{@render children()}
