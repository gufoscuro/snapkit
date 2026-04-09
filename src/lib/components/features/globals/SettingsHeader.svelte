<script lang="ts">
  import Logo from '$components/icons/Logo.svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import * as m from '$lib/paraglide/messages'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import PanelLeftIcon from '@lucide/svelte/icons/panel-left'

  type BreadcrumbItem = {
    label: string
    href?: string
  }

  let {
    legalEntityName,
    breadcrumbs = [],
  }: {
    legalEntityName?: string | null
    breadcrumbs?: BreadcrumbItem[]
  } = $props()

  const sidebar = useSidebar()
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
        <Breadcrumb.Link href="/">{legalEntityName || 'Moddo'}</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      {#if breadcrumbs.length === 0}
        <Breadcrumb.Item>
          <Breadcrumb.Page>{m.settings()}</Breadcrumb.Page>
        </Breadcrumb.Item>
      {:else}
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/settings">{m.settings()}</Breadcrumb.Link>
        </Breadcrumb.Item>
        {#each breadcrumbs as crumb, i (crumb.href || '' + i)}
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            {#if i === breadcrumbs.length - 1}
              <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
        {/each}
      {/if}
    </Breadcrumb.List>
  </Breadcrumb.Root>
</header>
