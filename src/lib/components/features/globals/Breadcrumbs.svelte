<script lang="ts">
  import Logo from '$components/icons/Logo.svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import { getPageState } from '$lib/contexts/page-state'
  import type { PageConfig } from '$lib/utils/page-registry'
  import { getI18nLabel } from '$utils/i18n'
  import { createRoute } from '$utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { ChevronRight } from '@lucide/svelte'
  import { PanelLeftIcon } from 'lucide-svelte'

  const props: SnippetProps = $props()
  const pageState = getPageState()
  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const sidebar = useSidebar()

  function findAncestors(pages: PageConfig[], targetId: string, trail: PageConfig[] = []): PageConfig[] | null {
    for (const page of pages) {
      if (page.$id === targetId) {
        return [...trail, page]
      }
      if (page.subpages?.length) {
        const result = findAncestors(page.subpages, targetId, [...trail, page])
        if (result) return result
      }
    }
    return null
  }

  const pages = $derived(props.entityConfig?.dashboard.pages ?? [])
  const breadcrumbItems = $derived(findAncestors(pages, props.pageDetails.config.$id))
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

  {#if breadcrumbItems?.length}
    <Breadcrumb.Root class="ms-4 cursor-default">
      <Breadcrumb.List>
        {#each breadcrumbItems as page, i (page.$id)}
          {#if i > 0}
            <Breadcrumb.Separator />
          {/if}
          <Breadcrumb.Item>
            {#if i === breadcrumbItems.length - 1}
              <Breadcrumb.Page>{recordTitle ?? getI18nLabel(page.title)}</Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link class="hover:text-brand hover:underline" href={createRoute({ $id: page.$id })}>
                {getI18nLabel(page.title)}
              </Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  {/if}
</header>
