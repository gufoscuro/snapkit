<!--
  @component FormProductSelector
  @description A selector component for choosing products from the product catalog.
  @keywords product, selector, picker, form, dropdown, catalog
  @uses FormGenericSingleSelector
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { ProductSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { apiRequest } from '$utils/request'

  type Props = EntitySelectorProps & {
    attr?: ProductSummary
    onChoose?: (item: ProductSummary) => void
    onChange?: (item: ExtendedOption | undefined) => void
    onClear?: () => void
  }

  let {
    attr = undefined,
    label = m.product(),
    placeholder = m.select_product_placeholder(),
    name = 'product',
    id = name,
    error = EntitySelectorDefaults.error,
    showLabel = EntitySelectorDefaults.showLabel,
    showErrorMessage = EntitySelectorDefaults.showErrorMessage,
    width = EntitySelectorDefaults.width,
    contentWidth = width,
    readonly = EntitySelectorDefaults.readonly,
    allowNewRecord = EntitySelectorDefaults.allowNewRecord,
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
    class: className = '',
  }: Props = $props()

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
