<!--
  @component VatCodeSelector
  @description A single-select dropdown for choosing VAT codes.
  Fetches VAT codes from GET /api/vat-codes endpoint with search support.
  Displays code with description and rate percentage.
  @keywords vat, tax, selector, picker, dropdown, vat-code
  @uses FormGenericSingleSelector
  @api GET /api/vat-codes -> VatCode[]
-->
<script lang="ts" module>
  export type VatCodeSummary = {
    id: string
    code: string
    description: string
    rate: number
    type: string
    direction: string
    applies_to: string
    is_default: boolean
  }
</script>

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { api } from '$utils/request'

  type Props = EntitySelectorProps & {
    /** Pre-selected VAT code */
    attr?: VatCodeSummary
    /** Filter by direction (vendita/acquisto) */
    direction?: 'vendita' | 'acquisto'
    /** Callback when a VAT code is selected */
    onChoose?: (item: VatCodeSummary) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
  }

  let {
    attr = undefined,
    direction = undefined,
    label = m.vat_code(),
    placeholder = m.select_vat_code_placeholder(),
    name = 'vatCodeId',
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
    allowNewRecord = false,
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
  }: Props = $props()

  function optionMappingFunction(item: VatCodeSummary): ExtendedOption {
    return {
      label: `${item.code} - ${item.description} (${item.rate}%)`,
      value: item.id as string,
      attr: item,
    }
  }

  function filterFunction(item: VatCodeSummary): boolean {
    if (direction && item.direction !== direction) return false
    return true
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<VatCodeSummary[]> {
    const params = createQueryRequestObject(query)

    const items = (
      await api.get<PaginatedResponse<VatCodeSummary>>('/vat-codes', {
        queryParams: params,
      })
    ).data

    return items.filter(filterFunction)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_vat_codes_found()}
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
  {allowNewRecord}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  class={className} />
