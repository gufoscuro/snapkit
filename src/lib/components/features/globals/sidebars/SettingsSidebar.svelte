<!--
  @component SettingsSidebar
  @description Sidebar template for the settings pages
  @keywords sidebar
-->

<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import * as m from '$lib/paraglide/messages'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  type SettingsMenuItem = {
    label: string
    href: string
  }

  const props: SnippetProps = $props()

  const items: SettingsMenuItem[] = [
    { label: m.overview(), href: '/settings' },
    { label: m.product_line(), href: '/settings/product-lines' },
    { label: m.product_family(), href: '/settings/product-families' },
    { label: m.commodity_code(), href: '/settings/commodity-codes' },
    { label: m.bank(), href: '/settings/banks' },
    { label: m.emails(), href: '/settings/emails' },
    { label: m.payment_terms(), href: '/settings/payment-terms' },
  ]
</script>

<SubpageSidebarBase {...props} fallback="/">
  {#if !page.url.pathname.includes('upsert')}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.settings()}
      </h2>
    </div>

    <Sidebar.Group>
      <Sidebar.GroupLabel>{m.settings()}</Sidebar.GroupLabel>
      <Sidebar.Menu>
        {#each items as item (item.href)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={page.url.pathname === item.href} tooltipContent={item.label}>
              {#snippet child({ props: btnProps })}
                <a href={item.href} {...btnProps} data-sveltekit-preload-data="off">
                  <span>{item.label}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  {/if}
</SubpageSidebarBase>
