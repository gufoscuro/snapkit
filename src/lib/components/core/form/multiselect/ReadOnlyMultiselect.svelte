<script lang="ts">
  import Button from '$components/ui/button/button.svelte'
  import Label from '$components/ui/label/label.svelte'
  import type { ExtendedOption } from '$utils/generics'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { FormLabelClass } from '../form'

  type Props = {
    selectedValue?: ExtendedOption
    label?: string
    placeholder?: string
    name?: string
    id?: string
    showLabel?: boolean
    width?: string
    class?: string
  }

  let {
    selectedValue = undefined,
    label = '',
    placeholder = undefined,
    name: nameProp = '',
    id = nameProp,
    showLabel = true,
    width = 'w-full',
    class: className = '',
  }: Props = $props()

  const displayName = $derived(selectedValue?.label ?? '')
</script>

<div>
  <Label for={nameProp} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
  <div title={displayName}>
    <Button
      disabled
      variant="outline"
      aria-label={placeholder}
      class="h-auto min-h-9 justify-between py-1.5 {width} {className}"
    >
      <span class="truncate">{displayName}</span>
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </div>
</div>
