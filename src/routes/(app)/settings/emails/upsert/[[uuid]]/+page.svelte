<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { EmailDetails } from '$lib/components/features/emails/EmailDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { getBreadcrumbLabels } from '$lib/utils/breadcrumb-title'
  import type { PageProps } from './$types'

  const PAGE_ID = 'settings-email-details'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const uuid = $derived(page.params.uuid)
  const breadcrumbLabels = $derived(getBreadcrumbLabels(pageState))
  const breadcrumbLabel = $derived(breadcrumbLabels[PAGE_ID] ?? m.new_email())
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.emails(), href: '/settings/emails' },
    { label: breadcrumbLabel },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <EmailDetails legalEntity={data.legalEntity} {uuid} pageId={PAGE_ID} />
</div>
