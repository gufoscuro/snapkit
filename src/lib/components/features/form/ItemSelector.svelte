<!--
  @component ItemSelector
  @description A single-select dropdown for choosing items from the item catalog.
  Fetches items from GET /api/legal-entities/{legalEntity}/items endpoint with search support.
  Displays item name with code as secondary info.
  @keywords item, selector, picker, dropdown, catalog, product, quotation
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/items -> Item[]
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import ItemSelectorRenderer from '$components/features/form/ItemSelectorRenderer.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Item } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { openRecordCreation, openRecordEdit } from '$lib/utils/record-creation'
  import { api } from '$utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** Pre-selected item */
    attr?: Item
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<Item[]>
    /** Filter items by mode */
    mode?: 'sellable'
    /** Callback when an item is selected */
    onChoose?: (item: Item) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "create new" is clicked (requires allowNewRecord=true) */
    onCreateRecord?: () => void
    /** Callback when "open record" is clicked (requires allowOpenRecord=true) */
    onOpenRecord?: (option: ExtendedOption) => void
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    mode = undefined,
    label = m.item(),
    placeholder = m.select_item_placeholder(),
    name = 'itemId',
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
    onCreateRecord = () =>
      openRecordCreation('item-details', m.new_tab_opened_for_item(), `/legal-entities/${legalEntityId}/items`),
    onOpenRecord = (option: ExtendedOption) =>
      openRecordEdit(
        'item-details',
        { uuid: option.value as string },
        m.new_tab_opened_for_item_edit(),
        `/legal-entities/${legalEntityId}/items`,
      ),
  }: Props = $props()

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function optionMappingFunction(item: Item): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<Item[]> {
    const params = createQueryRequestObject(query)
    if (mode) {
      params.mode = mode
    }

    return (
      await api.get<PaginatedResponse<Item>>(`/legal-entities/${legalEntityId}/items`, {
        queryParams: params,
      })
    ).data
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<Item[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_items_found()}
  newRecordText={m.add_new_item()}
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
  {allowOpenRecord}
  itemRendererComponent={ItemSelectorRenderer}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  onCreateNew={onCreateRecord}
  {onOpenRecord}
  class={className} />
