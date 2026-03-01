<script lang="ts">
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
</script>

<SettingsHeader legalEntityName={data.legalEntity?.name} />

<div class="flex flex-1 flex-col items-center justify-center gap-4 p-4">
  {m.settings()}
</div>
