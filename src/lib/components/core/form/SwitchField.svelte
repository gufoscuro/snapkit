<script lang="ts">
  import Label from '$components/ui/label/label.svelte'
  import { Switch } from '$components/ui/switch'
  import * as m from '$lib/paraglide/messages'
  import type { Snippet } from 'svelte'
  import { FormLabelClass, SwitchFieldDefaults, type SwitchFieldProps } from './form'
  import { getFormContextOptional } from './form-context'

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
    hidden = false,
    showLabel = SwitchFieldDefaults.showLabel,
    labelPosition = SwitchFieldDefaults.labelPosition,
    labelClass = SwitchFieldDefaults.labelClass,
    tabindex = undefined,
    onChange,
    children,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)

  // Derive values - form context takes precedence, otherwise use bindable prop
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Single source of truth: form context OR bindable prop
  const currentChecked = $derived(form ? ((form.values[name] as boolean | undefined) ?? false) : checked)

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

{#if !isHidden}
  <div class="flex gap-2 {className} {labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'items-center'}">
    <Switch
      {id}
      {name}
      {tabindex}
      disabled={isDisabled}
      checked={currentChecked}
      onCheckedChange={handleCheckedChange} />
    <Label for={name} id="label-{id}" class="{showLabel ? FormLabelClass : 'sr-only'} {labelClass}">
      {#if children}
        {@render children()}
      {:else}
        {label}
      {/if}
    </Label>
  </div>
{/if}
