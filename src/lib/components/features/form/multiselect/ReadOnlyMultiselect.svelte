<script lang="ts">
  import Button from '$components/ui/button/button.svelte'
  import Label from '$components/ui/label/label.svelte'
  import type { ExtendedOption } from '$utils/generics'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'

  export let selectedValue: ExtendedOption | undefined = undefined
  export let label: string = ''
  export let placeholder: string | undefined = undefined
  export let name: string = ''
  export let id: string = name
  export let showLabel: boolean = true
  export let width: string = 'w-full'

  $: name = selectedValue?.label as string
</script>

<div>
  <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
  <div class="" title={name}>
    <Button
      disabled
      variant="outline"
      aria-label={placeholder}
      class="h-auto min-h-9 justify-between py-1.5 {width} {$$restProps.class || ''}">
      <span class="truncate">{name}</span>
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </div>
</div>
