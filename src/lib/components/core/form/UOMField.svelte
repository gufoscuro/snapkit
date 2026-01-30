<!--
  @component UOMField
  @description Select field for Unit of Measure with autowired form context support.
  Supports both base and aggregate UOMs with optional read-only warning.
-->
<script lang="ts">
  import SelectField from './SelectField.svelte'
  import { SelectorFieldDefaults, type SelectorFieldProps } from './form'
  import * as Alert from '$components/ui/alert'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import * as m from '$lib/paraglide/messages'
  import { getAggregateUnitOfMeasureOptions, getUnitOfMeasureOptions } from '$utils/uom'
  import { Info } from 'lucide-svelte'

  type Props = Omit<SelectorFieldProps, 'placeholder'> & {
    /** Use aggregate UOM options instead of base */
    aggregate?: boolean
    /** Include "Unset" option at the beginning */
    includeUnset?: boolean
    /** Show warning that UOM cannot be changed after save */
    showReadonlyWarning?: boolean
    /** Callback when value changes */
    onChange?: (value: string | null) => void
  }

  let {
    name = 'uom',
    label = m.uom_label(),
    id = name,
    error = undefined,
    warning = undefined,
    errorPosition = SelectorFieldDefaults.errorPosition,
    warningPosition = SelectorFieldDefaults.warningPosition,
    showLabel = SelectorFieldDefaults.showLabel,
    showErrorMessage = SelectorFieldDefaults.showErrorMessage,
    allowClear = false,
    disabled = SelectorFieldDefaults.disabled,
    width = 'min-w-32',
    contentWidth = SelectorFieldDefaults.contentWidth,
    align = SelectorFieldDefaults.align,
    aggregate = false,
    includeUnset = true,
    showReadonlyWarning = false,
    onChange,
    class: className = '',
  }: Props = $props()

  // Build UOM options based on aggregate flag
  const baseOptions = $derived(aggregate ? getAggregateUnitOfMeasureOptions() : getUnitOfMeasureOptions())

  const items = $derived(
    includeUnset
      ? [{ label: m.uom_unset(), value: UnitOfMeasures.Unset }, ...baseOptions]
      : baseOptions
  )
</script>

<div class="flex flex-col gap-2">
  <SelectField
    {name}
    {label}
    {id}
    {items}
    {error}
    {warning}
    {errorPosition}
    {warningPosition}
    {showLabel}
    {showErrorMessage}
    {allowClear}
    {disabled}
    {width}
    {contentWidth}
    {align}
    {onChange}
    class={className}
  />

  {#if !disabled && showReadonlyWarning}
    <Alert.Root>
      <Info class="size-4" />
      <Alert.Title>{m.uom_readonly_warning_title()}</Alert.Title>
      <Alert.Description>{m.uom_readonly_warning()}</Alert.Description>
    </Alert.Root>
  {/if}
</div>
