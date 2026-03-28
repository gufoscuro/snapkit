<script lang="ts">
  import { page } from '$app/state'
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import { ProductLineDetails } from '$lib/components/features/product-lines/ProductLineDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { getBreadcrumbLabels } from '$lib/utils/breadcrumb-title'
  import type { PageProps } from './$types'

  const PAGE_ID = 'settings-product-line-details'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const uuid = $derived(page.params.uuid)
  const breadcrumbLabels = $derived(getBreadcrumbLabels(pageState))
  const breadcrumbLabel = $derived(breadcrumbLabels[PAGE_ID] ?? m.new_product_line())
</script>

<SettingsHeader
  legalEntityName={data.legalEntity?.name}
  breadcrumbs={[
    { label: m.product_line(), href: '/settings/product-lines' },
    { label: breadcrumbLabel },
  ]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <ProductLineDetails legalEntity={data.legalEntity} {uuid} pageId={PAGE_ID} />
</div>
