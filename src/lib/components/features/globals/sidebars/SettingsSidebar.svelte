<!--
  @component SettingsSidebar
  @description Sidebar template for the settings pages
  @keywords sidebar
-->
<!-- <script lang="ts" module>
  export { SettingsSidebarContract as contract } from './SettingsSidebar.contract.js'
</script> -->

<script lang="ts">
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const pageMenu: { name: string; items: MenuItem[] } = {
    name: m.settings(),
    items: [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'settings',
      },
      {
        type: 'link',
        label: m.product_line(),
        pageId: 'settings-product-line',
      },
      {
        type: 'link',
        label: m.product_family(),
        pageId: 'settings-product-family',
      },
      {
        type: 'link',
        label: m.commodity_code(),
        pageId: 'settings-commodity-code',
      },
    ],
  }
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'home' })}>
  <div class="px-4 pt-2">
    <h2 class="line-clamp-2 text-lg font-semibold">
      {m.settings()}
    </h2>
  </div>

  <SubpageMenuGroup name={pageMenu.name} items={pageMenu.items} />
</SubpageSidebarBase>
