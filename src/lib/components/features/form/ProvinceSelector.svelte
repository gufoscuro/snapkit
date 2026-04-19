<!--
  @component ProvinceSelector
  @description A single-select dropdown for choosing an Italian province (by 2-letter code)
  with free-entry support for foreign province codes (any 2-character string).
  Backed by a static fixture of all 107 Italian provinces — no API call.
  Auto-wires to the surrounding form context (like TextField), but also accepts an
  explicit `value` prop for standalone usage.
  @keywords province, selector, picker, dropdown, italy, italian-province
  @uses FormGenericSingleSelector
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import { findItalianProvince, ITALIAN_PROVINCES, type ItalianProvince } from '$lib/fixtures/italianProvinces'
  import * as m from '$lib/paraglide/messages'
  import type { MinimalFilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'

  type Props = EntitySelectorProps & {
    /** Pre-selected province code (e.g. "MI"). Free-entered foreign codes are supported.
     *  When inside a FormUtil this prop is ignored — the value is read from form context. */
    value?: string | null
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
  }

  let {
    value: valueProp = undefined,
    label = m.province(),
    placeholder = m.select_province_placeholder(),
    name = 'province',
    id = name,
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
    class: className = '',
    onChange = () => {},
    onClear = () => {},
  }: Props = $props()

  const form = getFormContextOptional()

  const currentValue = $derived(form ? (form.values[name] as string | null | undefined) : valueProp)

  function optionMappingFunction(item: ItalianProvince): ExtendedOption {
    return {
      label: `${item.value} — ${item.label}`,
      value: item.value,
      attr: item,
    }
  }

  function selectedOptionFor(code: string | null | undefined): ExtendedOption | undefined {
    if (!code) return undefined
    const known = findItalianProvince(code)
    if (known) return optionMappingFunction(known)
    return { label: code.toUpperCase(), value: code.toUpperCase() }
  }

  const selectedValue = $derived(selectedOptionFor(currentValue))

  async function fetchFunction(): Promise<ItalianProvince[]> {
    return [...ITALIAN_PROVINCES]
  }

  function filterFunction(item: ItalianProvince, query: Partial<MinimalFilterQuery>): boolean {
    const search = query.search?.trim().toLowerCase()
    if (!search) return true
    return item.value.toLowerCase().includes(search) || item.label.toLowerCase().includes(search)
  }

  function validateAddItem(input: string): boolean {
    return input.trim().length === 2
  }
</script>

<FormGenericSingleSelector
  {selectedValue}
  emptyText={m.no_provinces_found()}
  addItemText={m.add_foreign_province()}
  addItemInvalidText={m.province_code_must_be_2_chars()}
  {label}
  {placeholder}
  {name}
  {id}
  {error}
  {warning}
  {warningPosition}
  {showLabel}
  {showErrorMessage}
  {width}
  {contentWidth}
  {align}
  {readonly}
  {disabled}
  {optionMappingFunction}
  {fetchFunction}
  {filterFunction}
  {validateAddItem}
  {onChange}
  {onClear}
  class={className}
  allowClear
  allowCreate />
