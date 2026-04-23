<script lang="ts">
  import type { PageConfig } from '$lib/utils/page-registry'
  import type { NodeKind, Path } from '../types'
  import PageForm from './PageForm.svelte'

  type Props = {
    path: Path
    kind: NodeKind
    node: unknown
    onChange: (newValue: unknown) => void
  }

  let { path, kind, node, onChange }: Props = $props()

  const pathKey = $derived(path.join('/'))
</script>

{#key pathKey}
  {#if kind === 'page'}
    <PageForm page={node as PageConfig} onChange={(newValue) => onChange(newValue)} />
  {:else}
    <div class="rounded border p-4 text-sm text-muted-foreground">
      <div class="font-medium">Non ancora editabile in questo prototipo</div>
      <div class="mt-1 text-xs">Tipo: <code>{kind}</code></div>
      <pre class="mt-3 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(node, null, 2)}</pre>
    </div>
  {/if}
{/key}
