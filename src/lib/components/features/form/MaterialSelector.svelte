<!--
  @component MaterialSelector
  @description A single-select dropdown for choosing raw materials from the supply API.
  Fetches materials from GET /raw-material endpoint with search support.
  Displays material name with supplier information.
  @keywords materials, raw-materials, selector, picker, dropdown, supply, inventory
  @uses FormGenericSingleSelector
  @api GET /raw-material (supply-api) -> rawMaterialSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { RawMaterialSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    attr?: RawMaterialSummary
    onChoose?: (item: RawMaterialSummary) => void
    onChange?: (item: ExtendedOption | undefined) => void
    onClear?: () => void
  }

  let {
    attr = undefined,
    label = m.material(),
    placeholder = m.select_material_placeholder(),
    name = 'material',
    id = name,
    error = EntitySelectorDefaults.error,
    showLabel = EntitySelectorDefaults.showLabel,
    showErrorMessage = EntitySelectorDefaults.showErrorMessage,
    width = EntitySelectorDefaults.width,
    contentWidth = width,
    readonly = EntitySelectorDefaults.readonly,
    allowNewRecord = EntitySelectorDefaults.allowNewRecord,
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
  }: Props = $props()

  function optionMappingFunction(item: RawMaterialSummary): ExtendedOption {
    const supplierInfo = item.supplier_attr?.name ? ` (${item.supplier_attr.name})` : ''
    return {
      label: `${item.name}${supplierInfo}`,
      value: (item.id ?? item.external_id) as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<RawMaterialSummary[]> {
    return apiRequest<RawMaterialSummary[]>({
      url: 'supply/raw-material',
      queryParams: createQueryRequestObject(query),
    })
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  {label}
  {placeholder}
  {name}
  {id}
  {error}
  {showLabel}
  {showErrorMessage}
  {width}
  {contentWidth}
  {readonly}
  {allowNewRecord}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  class={className} />
