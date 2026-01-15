<script lang="ts">
  import { FormFieldClass } from '$components/form/form'

  export let showLabel: boolean = true
  export let width: string = ''
</script>

<div>
  {#if showLabel}
    <div class="h-5 w-20 rounded bg-secondary/50" />
  {/if}

  <div class="flex">
    <div
      class="{showLabel ? 'mt-1' : ''} h-9 {width ||
        FormFieldClass.MinWidth} flex-wrap rounded-md bg-secondary/50 {$$restProps.class || ''}" />
  </div>
</div>
