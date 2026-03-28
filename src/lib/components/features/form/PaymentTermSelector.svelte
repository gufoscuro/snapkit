<!--
  @component PaymentTermSelector
  @description A single-select dropdown for choosing payment terms.
  Fetches payment terms from GET /api/legal-entities/{legalEntity}/payment-terms endpoint with search support.
  Displays payment term name with code.
  @keywords payment-term, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/payment-terms -> PaymentTerm[]
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { PaymentTerm } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { api } from '$utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** Pre-selected payment term */
    attr?: PaymentTerm
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<PaymentTerm[]>
    /** Callback when a payment term is selected */
    onChoose?: (item: PaymentTerm) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.payment_term(),
    placeholder = m.select_payment_term_placeholder(),
    name = 'paymentTermId',
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

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function optionMappingFunction(item: PaymentTerm): ExtendedOption {
    return {
      label: item.code ? `${item.name} (${item.code})` : item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<PaymentTerm[]> {
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<PaymentTerm>>(`/legal-entities/${legalEntityId}/payment-terms`, {
        queryParams: params,
      })
    ).data
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<PaymentTerm[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_payment_terms_found()}
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
  class={className}
  allowClear />
