<!--
  @component LegalEntityBankSelector
  @description A single-select dropdown for choosing a legal entity bank.
  Fetches banks from GET /api/legal-entities/{legalEntity}/banks endpoint with search support.
  Displays bank name with IBAN.
  @keywords bank, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/banks -> LegalEntityBank[]
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityBank } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { api } from '$utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** Pre-selected bank */
    attr?: LegalEntityBank
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<LegalEntityBank[]>
    /** Callback when a bank is selected */
    onChoose?: (item: LegalEntityBank) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.bank(),
    placeholder = m.select_bank_placeholder(),
    name = 'legal_entity_bank_id',
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

  function optionMappingFunction(item: LegalEntityBank): ExtendedOption {
    return {
      label: item.iban ? `${item.name} (${item.iban})` : item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<LegalEntityBank[]> {
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<LegalEntityBank>>(`/legal-entities/${legalEntityId}/banks`, {
        queryParams: params,
      })
    ).data
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<LegalEntityBank[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_banks_found()}
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
