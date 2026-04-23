<script lang="ts">
  import type { LegalEntityPolicies } from '$lib/stores/tenant-config/policies'
  import type { Path } from '../types'
  import SectionHeader from './SectionHeader.svelte'

  type Props = {
    policies: Partial<LegalEntityPolicies>
    selectedPath: Path | null
    onSelect: (path: Path) => void
  }

  let { policies: _policies, selectedPath: _selectedPath, onSelect: _onSelect }: Props = $props()

  let expanded = $state(false)
</script>

<SectionHeader label="Policies" {expanded} onToggle={() => (expanded = !expanded)}>
  <div class="px-2 py-1 text-xs italic text-muted-foreground">
    (non ancora editabile in prototipo)
  </div>
</SectionHeader>
