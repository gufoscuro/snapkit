<script lang="ts">
  import { FormFieldClass } from './form'

  type Props = {
    showLabel?: boolean
    width?: string
    class?: string
  }

  let {
    showLabel = true,
    width = '',
    class: className = '',
  }: Props = $props()
</script>

<div>
  {#if showLabel}
    <div class="h-5 w-20 rounded bg-secondary/50"></div>
  {/if}

  <div class="flex">
    <div
      class="{showLabel ? 'mt-1' : ''} h-9 {width || FormFieldClass.MinWidth} flex-wrap rounded-md bg-secondary/50 {className}"
    ></div>
  </div>
</div>
