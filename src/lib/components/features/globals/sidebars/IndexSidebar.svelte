<!--
	@component IndexSidebar
	@description Sidebar template for the index pages
	@keywords sidebar
-->
<script lang="ts">
  import CustomerMenu from '$components/features/globals/CustomerMenu.svelte'
  import LeftSidebarMenu from '$components/features/globals/LeftSidebarMenu.svelte'
  import LeftSidebarWrapper from '$components/features/globals/LeftSidebarWrapper.svelte'
  import LegalEntitySwitcher from '$components/features/globals/LegalEntitySwitcher.svelte'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<LeftSidebarWrapper>
  {#snippet header()}
    <LegalEntitySwitcher {...props} />
  {/snippet}

  {#snippet content()}
    <LeftSidebarMenu {...props} />
  {/snippet}

  {#snippet footer()}
    <CustomerMenu {...props} />
  {/snippet}
</LeftSidebarWrapper>
