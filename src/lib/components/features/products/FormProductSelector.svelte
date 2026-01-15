<!--
  @component FormProductSelector
  @description A selector component for choosing products from the product catalog.
  @keywords product, selector, picker, form, dropdown, catalog
  @uses FormGenericSingleSelector
-->
<svelte:options runes={false} />

<script lang="ts">
  import { FormFieldClass } from '$components/form/form'
  import FormGenericSingleSelector from '$components/form/FormGenericSingleSelector.svelte'
  import { createQueryRequestObject, type FilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { apiRequest } from '$utils/request'

  export let formAPI: any = null
  export let attr: ProductSummary | undefined = undefined
  export let label: string = 'Product'
  export let placeholder: string | undefined = 'Select a product...'
  export let name: string = 'product'
  export let id: string = name
  export let error: string | undefined = ''
  export let showLabel: boolean = true
  export let showErrorMessage: boolean = true
  export let width: string = FormFieldClass.SelectorDefaultWidth
  export let contentWidth: string = width
  export let readonly: boolean = false
  export let allowNewRecord: boolean = false
  export let onChoose: (item: ProductSummary) => void = () => {}
  export let onChange: (item: ExtendedOption | undefined) => void = () => {}
  export let onClear: () => void = () => {}

  type ProductSummary = {
    id?: string
    name: string
    internal_id?: string
    categories: string[]
    type: 'producible' | 'purchasable' | 'bundle'
    uom: string
    prices: {
      base_price?: number
      currency: 'EUR' | 'USD' | 'GBP'
      unit: number
    }
  }

  function optionMappingFunction(item: ProductSummary): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<ProductSummary[]> {
    return apiRequest<ProductSummary[]>({
      url: 'product/product',
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
