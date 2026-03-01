<script lang="ts">
  import { page } from '$app/state'
  import Logo from '$components/icons/Logo.svelte'
  import { ProductFamilyDetails } from '$lib/components/features/product-families/ProductFamilyDetails'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { ChevronRight } from '@lucide/svelte'
  import { PanelLeftIcon } from 'lucide-svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const sidebar = useSidebar()
  const pageState = getPageState()

  const uuid = $derived(page.params.uuid)
  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const breadcrumbLabel = $derived(recordTitle ?? m.new_product_family())
</script>

<header class="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center border-b bg-background px-4">
  <Sidebar.Trigger class="relative -ms-1 overflow-visible">
    {#if sidebar.open}
      <PanelLeftIcon />
    {:else}
      <div class="absolute left-1 flex items-center">
        <Logo class="z-10 text-brand" />
        <ChevronRight class=" size-3 text-brand/70" />
      </div>
    {/if}
    <span class="sr-only">Toggle Sidebar</span>
  </Sidebar.Trigger>

  <Breadcrumb.Root class="ms-4 cursor-default">
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">{data.legalEntity?.name || 'Moddo'}</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/settings">{m.settings()}</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/settings/product-families">{m.product_family()}</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>{breadcrumbLabel}</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
</header>

<div class="flex flex-1 flex-col gap-4 p-4">
  <ProductFamilyDetails legalEntity={data.legalEntity} {uuid} />
</div>
