<script lang="ts">
  import type { LegalEntityResourceConfig } from '$lib/stores/tenant-config/types'
  import type { Path } from '../types'
  import SectionHeader from './SectionHeader.svelte'

  type Props = {
    resources: Record<string, LegalEntityResourceConfig>
    selectedPath: Path | null
    onSelect: (path: Path) => void
  }

  let { resources: _resources, selectedPath: _selectedPath, onSelect: _onSelect }: Props = $props()

  let expanded = $state(false)
</script>

<SectionHeader label="Resources" {expanded} onToggle={() => (expanded = !expanded)}>
  <div class="px-2 py-1 text-xs italic text-muted-foreground">
    (non ancora editabile in prototipo)
  </div>
</SectionHeader>
