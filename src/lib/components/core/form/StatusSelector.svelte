<script lang="ts" module>
  import type { StatusVariant } from '$lib/components/core/ResourceTable/types'

  export type StatusOption = {
    value: string
    label: string
    variant: StatusVariant
  }
</script>

<script lang="ts">
  import { browser } from '$app/environment'
  import {
    EntitySelectorDefaults,
    FormFieldClass,
    FormLabelClass,
    type EntitySelectorProps,
  } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import FormFieldMessages from '$components/core/form/FormFieldMessages.svelte'
  import FormFieldSkeleton from '$components/core/form/FormFieldSkeleton.svelte'
  import MultiSelect from '$components/core/form/multiselect/MultiSelect.svelte'
  import ReadOnlyMultiselect from '$components/core/form/multiselect/ReadOnlyMultiselect.svelte'
  import StatusItemRenderer from '$components/core/form/multiselect/StatusItemRenderer.svelte'
  import StatusSelectedRenderer from '$components/core/form/multiselect/StatusSelectedRenderer.svelte'
  import Label from '$components/ui/label/label.svelte'
  import type { ExtendedOption } from '$utils/generics'

  type Props = Omit<EntitySelectorProps, 'name'> & {
    name: string
    statuses: StatusOption[]
    selectedValue?: ExtendedOption
    allowClear?: boolean
    onChange?: (item: ExtendedOption | undefined) => void
    onChoose?: (value: string) => void
    onClear?: () => void
  }

  let {
    name,
    id = name,
    label = EntitySelectorDefaults.label,
    placeholder = EntitySelectorDefaults.placeholder,
    statuses,
    selectedValue = undefined,
    error = EntitySelectorDefaults.error,
    warning = EntitySelectorDefaults.warning,
    warningPosition = EntitySelectorDefaults.warningPosition,
    showLabel = EntitySelectorDefaults.showLabel,
    showErrorMessage = EntitySelectorDefaults.showErrorMessage,
    width = EntitySelectorDefaults.width,
    contentWidth = width,
    align = EntitySelectorDefaults.align,
    readonly = EntitySelectorDefaults.readonly,
    disabled = EntitySelectorDefaults.disabled,
    allowClear = true,
    onChange = () => {},
    onChoose = () => {},
    onClear: onClearCallback = () => {},
    class: className = '',
    hidden = false,
  }: Props = $props()

  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)
  const errorMessage = $derived((form?.errors[name] as string | undefined) || error || undefined)

  const statusOptions = $derived(
    statuses.map(s => ({ label: s.label, value: s.value, attr: { variant: s.variant } }))
  )

  const formValue = $derived(form?.values[name] as string | undefined)
  const resolvedSelected = $derived(
    formValue ? statusOptions.find(o => o.value === formValue) : selectedValue
  )

  function onSelectionChange(value: ExtendedOption[]) {
    const [item] = value

    onChange(item)

    if (!item) {
      onClearCallback()
      form?.updateField(name, '' as never)
      return
    }

    onChoose(item.value)
    form?.updateField(name, item.value as never)

    if (errorMessage) {
      form?.validateField(name)
    }
  }
</script>

{#if !isHidden && readonly}
  <ReadOnlyMultiselect
    selectedValue={resolvedSelected}
    width={FormFieldClass.MinWidth}
    {label}
    {placeholder}
    {name}
    {id}
    {showLabel} />
{:else if !isHidden && browser}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} error={errorMessage} {warning} {warningPosition} {showErrorMessage}>
      <MultiSelect
        {placeholder}
        {width}
        {contentWidth}
        {align}
        {disabled}
        {allowClear}
        {warning}
        options={statusOptions}
        value={resolvedSelected ? [resolvedSelected] : []}
        error={errorMessage}
        multiselection={false}
        shouldFilter={true}
        itemRendererComponent={StatusItemRenderer}
        selectedItemRendererComponent={StatusSelectedRenderer}
        class="w-full {className}"
        onChange={onSelectionChange} />
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} class={className} />
{/if}
