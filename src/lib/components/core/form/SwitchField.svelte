<script lang="ts">
  import { getFormContextOptional } from './form-context'
  import { SwitchFieldDefaults, type SwitchFieldProps } from './form'
  import { Switch } from '$components/ui/switch'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Snippet } from 'svelte'

  type Props = SwitchFieldProps & {
    checked?: boolean
    onChange?: (value: boolean) => void
    children?: Snippet
  }

  let {
    name = 'active',
    label = m.active(),
    id = name,
    checked = $bindable(false),
    disabled = SwitchFieldDefaults.disabled,
    showLabel = SwitchFieldDefaults.showLabel,
    labelPosition = SwitchFieldDefaults.labelPosition,
    labelClass = SwitchFieldDefaults.labelClass,
    onChange,
    children,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  // Derive values - form context takes precedence, otherwise use bindable prop
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Single source of truth: form context OR bindable prop
  const currentChecked = $derived(
    form ? (form.values[name] as boolean | undefined) ?? false : checked
  )

  function handleCheckedChange(value: boolean) {
    if (form) {
      form.updateField(name, value)
    } else {
      // Update the bindable prop for standalone usage
      checked = value
    }

    onChange?.(value)
  }
</script>

<div class="flex gap-2 {className} {labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'items-center'}">
  <Switch
    {id}
    {name}
    disabled={isDisabled}
    checked={currentChecked}
    onCheckedChange={handleCheckedChange}
  />
  <Label
    for={name}
    id="label-{id}"
    class="{showLabel ? '' : 'sr-only'} {labelClass}"
  >
    {#if children}
      {@render children()}
    {:else}
      {label}
    {/if}
  </Label>
</div>
