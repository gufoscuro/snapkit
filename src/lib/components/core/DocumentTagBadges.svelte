<!--
  @component DocumentTagBadges
  @description Generic tag badges component for document entities (quotations, sales orders, etc.).
  Renders each tag as a StatusBadge with configurable label and variant mapping.
  @keywords tags, badges, status, generic, document
  @uses StatusBadge
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'

  interface Props {
    tags: string[]
    getLabel: (tag: string) => string
    getVariant: (tag: string) => StatusVariant
  }

  let { tags, getLabel, getVariant }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-1">
  {#each tags as tag (tag)}
    <StatusBadge variant={getVariant(tag)} label={getLabel(tag)} />
  {/each}
</div>
