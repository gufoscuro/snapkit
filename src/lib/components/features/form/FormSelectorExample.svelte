<!--
  @component MaterialSelector
  @description A single-select dropdown that is intended as an example of a form selector
  Fetches materials from GET /raw-material endpoint with search support.
  Displays material name with supplier information.
  @keywords materials, raw-materials, selector, picker, dropdown, supply, inventory
  @uses FormGenericSingleSelector
  @api GET /raw-material (supply-api) -> rawMaterialSummary[]
-->

<script lang="ts">
  import { FormFieldClass } from '$components/features/form/form'
  import FormGenericSingleSelector from '$components/features/form/FormGenericSingleSelector.svelte'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  /**
   * Raw material summary type from supply-api GET /raw-material endpoint
   */
  type RawMaterialSummary = {
    id?: string
    external_id: string
    name: string
    description?: string
    categories: string[]
    supplier_id: string
    supplier_attr?: {
      address?: string
      country?: string
      id?: string
      name: string
      vat: string
    }
    uom: string
    minimum_quantity: number
    lead_time?: string
    prod_id?: string
  }

  export let formAPI: any = null
  export let attr: RawMaterialSummary | undefined = undefined
  export let label: string = 'Material'
  export let placeholder: string | undefined = 'Select a material...'
  export let name: string = 'material'
  export let id: string = name
  export let error: string | undefined = ''
  export let showLabel: boolean = true
  export let showErrorMessage: boolean = true
  export let width: string = FormFieldClass.SelectorDefaultWidth
  export let contentWidth: string = width
  export let readonly: boolean = false
  export let allowNewRecord: boolean = false
  export let onChoose: (item: RawMaterialSummary) => void = () => {}
  export let onChange: (item: ExtendedOption | undefined) => void = () => {}
  export let onClear: () => void = () => {}

  function optionMappingFunction(item: RawMaterialSummary): ExtendedOption {
    const supplierInfo = item.supplier_attr?.name ? ` (${item.supplier_attr.name})` : ''
    return {
      label: `${item.name}${supplierInfo}`,
      value: (item.id ?? item.external_id) as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<RawMaterialSummary[]> {
    console.log('MaterialSelector fetchFunction called with query:', query)
    return apiRequest<RawMaterialSummary[]>({
      url: 'supply/raw-material',
      queryParams: createQueryRequestObject(query),
    })
  }
</script>

<FormGenericSingleSelector
  {formAPI}
  {attr}
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
  {onClear} />
