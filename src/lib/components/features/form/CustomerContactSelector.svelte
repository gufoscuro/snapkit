<!--
  @component CustomerContactSelector
  @description A single-select dropdown for choosing customer contacts.
  Fetches contacts from GET /customers/{customer}/contacts endpoint with search support.
  Displays contact as "name - job_title".
  Requires a customerId prop to scope contacts to the selected customer.
  @keywords customer, contact, selector, picker, dropdown, person
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/contacts -> CustomerContact[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerContact } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { openRecordEdit } from '$lib/utils/record-creation'
  import { api } from '$lib/utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** The customer ID to scope contacts to */
    customerId: string | undefined
    /** Pre-selected contact */
    attr?: CustomerContact
    /** Callback when a contact is selected */
    onChoose?: (item: CustomerContact) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "open record" is clicked (requires allowOpenRecord=true and a customerId) */
    onOpenRecord?: (option: ExtendedOption) => void
  }

  let {
    customerId,
    attr = undefined,
    label = m.contact_person(),
    placeholder = m.select_contact_placeholder(),
    name = 'contact_person_id',
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
    allowNewRecord = EntitySelectorDefaults.allowNewRecord,
    allowOpenRecord = EntitySelectorDefaults.allowOpenRecord,
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
    onOpenRecord = (option: ExtendedOption) => {
      if (!customerId) return
      openRecordEdit(
        'customer-contact-details',
        { uuid: customerId, cid: option.value as string },
        m.new_tab_opened_for_customer_contact_edit(),
        `/legal-entities/${legalEntityId}/customers/${customerId}/contacts`,
      )
    },
  }: Props = $props()

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function formatContactLabel(contact: CustomerContact): string {
    return [contact.name, contact.job_title].filter(Boolean).join(' - ')
  }

  function optionMappingFunction(item: CustomerContact): ExtendedOption {
    return {
      label: formatContactLabel(item),
      value: item.id as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<CustomerContact[]> {
    if (!customerId) return []
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<CustomerContact>>(
        `/legal-entities/${legalEntityId}/customers/${customerId}/contacts`,
        { queryParams: params },
      )
    ).data
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_contacts_found()}
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
  disabled={disabled || !customerId}
  {allowNewRecord}
  allowOpenRecord={allowOpenRecord && !!customerId}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  {onOpenRecord}
  class={className} />
