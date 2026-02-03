<!--
  @component CurrencyField
  @description Select field for Currency with autowired form context support.
-->
<script lang="ts">
  import SelectField from './SelectField.svelte'
  import { SelectorFieldDefaults, type SelectorFieldProps } from './form'
  import { DEFAULT_CURRENCY_CODE, getCurrencyOptions } from '$utils/currency'
  import * as m from '$lib/paraglide/messages'

  type Props = Omit<SelectorFieldProps, 'placeholder'> & {
    /** Callback when value changes */
    onChange?: (value: string | null) => void
  }

  let {
    name = 'currency',
    label = m.currency_label(),
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
    onChange,
    class: className = '',
  }: Props = $props()

  // Build currency options
  const items = getCurrencyOptions()
</script>

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
