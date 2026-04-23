<script lang="ts">
  import * as Resizable from '$components/ui/resizable'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import { getAtPath, getKind, updateAtPath } from '$lib/utils/config-tree'
  import NodeForm from './forms/NodeForm.svelte'
  import MenusSection from './tree/MenusSection.svelte'
  import PagesSection from './tree/PagesSection.svelte'
  import PoliciesSection from './tree/PoliciesSection.svelte'
  import ResourcesSection from './tree/ResourcesSection.svelte'
  import type { Path } from './types'

  type Props = {
    config: LegalEntityConfigResponse
    onchange?: (updated: LegalEntityConfigResponse) => void
  }

  let { config, onchange }: Props = $props()

  let selectedPath = $state<Path | null>(null)

  const selectedKind = $derived(selectedPath ? getKind(selectedPath) : null)
  const selectedNode = $derived(selectedPath ? getAtPath(config, selectedPath) : null)

  function handleSelect(path: Path) {
    selectedPath = path
  }

  function handleNodeChange(newValue: unknown) {
    if (!selectedPath) return
    const updated = updateAtPath(config, selectedPath, () => newValue)
    onchange?.(updated)
  }
</script>

<Resizable.PaneGroup direction="horizontal" class="h-full min-h-96">
  <Resizable.Pane defaultSize={30} minSize={20}>
    <div class="h-full overflow-auto bg-muted/20 p-2">
      <PagesSection
        pages={config.dashboard.pages}
        {selectedPath}
        onSelect={handleSelect} />
      <MenusSection
        menus={config.dashboard.menus}
        {selectedPath}
        onSelect={handleSelect} />
      <ResourcesSection
        resources={config.resources}
        {selectedPath}
        onSelect={handleSelect} />
      <PoliciesSection
        policies={config.policies}
        {selectedPath}
        onSelect={handleSelect} />
    </div>
  </Resizable.Pane>

  <Resizable.Handle withHandle />

  <Resizable.Pane defaultSize={70}>
    <div class="h-full overflow-auto p-4">
      {#if selectedPath && selectedKind}
        <NodeForm
          path={selectedPath}
          kind={selectedKind}
          node={selectedNode}
          onChange={handleNodeChange} />
      {:else}
        <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
          Seleziona un elemento dall'albero per modificarlo
        </div>
      {/if}
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
