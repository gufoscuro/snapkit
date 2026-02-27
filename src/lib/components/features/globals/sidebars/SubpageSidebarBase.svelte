<!--
  @component SubpageSidebarBase
  @description Base sidebar layout for subpages with back button, custom content, and customer menu
  @keywords sidebar subpage base
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  import BackButton from '$components/core/common/BackButton.svelte'
  import CustomerMenu from '$components/features/globals/CustomerMenu.svelte'
  import LeftSidebarWrapper from '$components/features/globals/LeftSidebarWrapper.svelte'
  import type { SnippetProps } from '$utils/runtime'

  type Props = SnippetProps & {
    fallback: string
    children?: Snippet
  }

  const { fallback, children, ...props }: Props = $props()
</script>

<LeftSidebarWrapper collapsible="offcanvas">
  {#snippet header()}
    <div class="">
      <BackButton variant="ghost" {fallback} />
    </div>
  {/snippet}

  {#snippet content()}
    {@render children?.()}
  {/snippet}

  {#snippet footer()}
    <CustomerMenu {...props} />
  {/snippet}
</LeftSidebarWrapper>
