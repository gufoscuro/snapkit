<!--
  @component CustomerSidebar
  @description Sidebar template for the customer pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerSidebarContract as contract } from './CustomerSidebar.contract.js'
</script>

<script lang="ts">
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'customers' })}></SubpageSidebarBase>
