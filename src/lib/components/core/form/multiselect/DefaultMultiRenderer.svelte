<script lang="ts">
  import type { ExtendedOption } from '$utils/generics'

  type Props = {
    items?: Array<ExtendedOption>
    removeItem?: (item: ExtendedOption, event: MouseEvent) => void
    placeholder: string
    colored?: boolean
  }

  let {
    items = [],
    removeItem = () => {},
    placeholder,
    colored = true,
  }: Props = $props()
</script>

<div class="flex flex-wrap gap-1">
  {#each items as item}
    <button
      type="button"
      class="cursor-pointer rounded border bg-muted/30 px-1 py-0.5 hover:bg-muted/50"
      onclick={(event) => removeItem(item, event)}
    >
      {item.label}
    </button>
  {:else}
    {placeholder}
  {/each}
</div>
