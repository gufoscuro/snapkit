<!--
  @component CategoriesSelector
  @description A multi-select dropdown for choosing categories with support for creating new ones.
  Categories are simple strings. New categories must be alphanumeric only.
  @keywords category, categories, selector, picker, dropdown, tags, multi-select
  @uses FormGenericMultiSelector
-->

<script lang="ts">
  import { EntitySelectorDefaults, type FormFieldMessagePosition } from '$components/core/form/form'
  import FormGenericMultiSelector from '$components/core/form/FormGenericMultiSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { MinimalFilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Field label */
    label?: string
    /** Placeholder text */
    placeholder?: string
    /** HTML ID (default: name) */
    id?: string
    /** Pre-selected category values */
    value?: Array<string>
    /** Error message */
    error?: string
    /** Warning message */
    warning?: string
    /** Warning message position */
    warningPosition?: FormFieldMessagePosition
    /** Show visible label */
    showLabel?: boolean
    /** Show error message */
    showErrorMessage?: boolean
    /** Field width (Tailwind class) */
    width?: string
    /** Dropdown content width */
    contentWidth?: string
    /** Custom fetch function for categories */
    fetchFunction?: (query: Partial<MinimalFilterQuery>) => Promise<string[]>
    /** Callback when categories change */
    onChange?: (items: ExtendedOption[]) => void
    /** Callback when categories are selected (returns string array) */
    onChoose?: (categories: string[]) => void
  }

  let {
    name = 'categories',
    label = m.categories(),
    placeholder = m.select_categories_placeholder(),
    id = name,
    value = [],
    error = EntitySelectorDefaults.error,
    warning = EntitySelectorDefaults.warning,
    warningPosition = EntitySelectorDefaults.warningPosition,
    showLabel = EntitySelectorDefaults.showLabel,
    showErrorMessage = EntitySelectorDefaults.showErrorMessage,
    width = EntitySelectorDefaults.width,
    contentWidth = width,
    fetchFunction: customFetchFunction = undefined,
    onChange = () => {},
    onChoose = () => {},
  }: Props = $props()

  /**
   * Validates that new categories contain only alphanumeric characters
   */
  function validateAddItem(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value)
  }

  /**
   * Maps a category string to ExtendedOption format
   */
  function optionMappingFunction(item: string): ExtendedOption {
    return {
      label: item,
      value: item,
      attr: item,
    }
  }

  /**
   * Default fetch function - returns empty array since categories are typically created on-the-fly
   */
  async function defaultFetchFunction(_query: Partial<MinimalFilterQuery>): Promise<string[]> {
    return []
  }

  async function fetchFunction(query: Partial<MinimalFilterQuery>): Promise<string[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }

  function handleChoose(items: string[]) {
    onChoose(items)
  }
</script>

<FormGenericMultiSelector
  {label}
  {placeholder}
  {name}
  {id}
  {value}
  {error}
  {warning}
  {warningPosition}
  {showLabel}
  {showErrorMessage}
  {width}
  {contentWidth}
  {fetchFunction}
  {optionMappingFunction}
  {validateAddItem}
  {onChange}
  onChoose={handleChoose}
  allowCreate
  emptyText={m.no_categories_found()}
  addItemText={m.add_category()}
  addItemInvalidText={m.invalid_category()} />
