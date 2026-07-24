<script lang="ts">
  import { BrandingSettings } from '$components/features/branding/BrandingSettings'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()

  const companyName = $derived(data.legalEntity?.trade_name || data.legalEntity?.name || '')
</script>

<SettingsHeader legalEntityName={data.legalEntity?.name} />

<div class="flex flex-1 flex-col gap-6 p-4">
  <h1 class="text-2xl font-semibold">{companyName}</h1>

  <BrandingSettings legalEntity={data.legalEntity} user={data.user} />
</div>
