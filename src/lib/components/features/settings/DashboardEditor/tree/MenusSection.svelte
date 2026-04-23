<script lang="ts">
  import type { DashboardConfigData } from '$lib/stores/tenant-config/types'
  import type { Path } from '../types'
  import SectionHeader from './SectionHeader.svelte'

  type Props = {
    menus: DashboardConfigData['menus']
    selectedPath: Path | null
    onSelect: (path: Path) => void
  }

  let { menus: _menus, selectedPath: _selectedPath, onSelect: _onSelect }: Props = $props()

  let expanded = $state(false)
</script>

<SectionHeader label="Menus" {expanded} onToggle={() => (expanded = !expanded)}>
  <div class="px-2 py-1 text-xs italic text-muted-foreground">
    (non ancora editabile in prototipo)
  </div>
</SectionHeader>
