<script lang="ts" generics="T">
  import { browser } from '$app/environment'
  import Label from '$components/ui/label/label.svelte'
  import type { MinimalFilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { FormFieldClass, FormLabelClass, type FormFieldMessagePosition } from './form'
  import { getFormContextOptional } from './form-context'
  import MultiSelect from './multiselect/MultiSelect.svelte'

  type Props = {
    label?: string
    placeholder?: string
    name: string
    id?: string
    value?: Array<string>
    error?: string
    warning?: string
    warningPosition?: FormFieldMessagePosition
    showLabel?: boolean
    showErrorMessage?: boolean
    width?: string
    contentWidth?: string
    allowCreate?: boolean
    emptyText?: string
    addItemText?: string
    addItemInvalidText?: string
    onChoose?: (items: T[]) => void
    onChange?: (items: ExtendedOption[]) => void
    fetchFunction?: (query: Partial<MinimalFilterQuery>) => Promise<T[]>
    validateAddItem?: (value: string) => boolean
    filterFunction?: (item: T, query: Partial<MinimalFilterQuery>) => boolean
    optionMappingFunction?: (item: T) => ExtendedOption
  }

  let {
    label = 'Items',
    placeholder = 'Select Items...',
    name,
    id = name,
    value = [],
    error = '',
    warning = '',
    warningPosition = undefined,
    showLabel = true,
    showErrorMessage = true,
    width = FormFieldClass.MinWidth,
    contentWidth = width,
    allowCreate = false,
    emptyText = 'No Results Found',
    addItemText = 'Add Item',
    addItemInvalidText = 'Cannot Add Item',
    onChoose = () => {},
    onChange = () => {},
    fetchFunction = () => Promise.resolve([]),
    validateAddItem = () => true,
    filterFunction = () => true,
    optionMappingFunction = item =>
      ({
        label: (item as Record<string, unknown>).name,
        value: (item as Record<string, unknown>).id as string,
        attr: item,
      }) as ExtendedOption,
  }: Props = $props()

  const form = getFormContextOptional()

  let itemsList: Array<T> = $state([])
  let hasInitialized = false

  const errorMessage = $derived((form?.errors[name] as string | undefined) || error || undefined)

  // Derive selected values from current form/prop values and items list
  const selectedValues = $derived.by(() => {
    const valuesArray = (form?.values[name] as Array<string> | undefined) || value

    if (!valuesArray || !valuesArray.length || !itemsList.length) {
      return []
    }

    const mappedItems = itemsList.map(optionMappingFunction)

    return valuesArray.map(selectedValue => ({
      label: mappedItems.find(i => i.value === selectedValue)?.label as string,
      value: selectedValue,
    }))
  })

  // Load items on mount (runs only once)
  $effect(() => {
    if (!hasInitialized) {
      hasInitialized = true
      defaultFetchFunction({})
    }
  })

  function onItemsChange(nextItems: Array<ExtendedOption>) {
    onChange(nextItems)
    onChoose(nextItems.map(option => option.attr as T))

    form?.updateField(name, nextItems.map(option => option.value) as never)
  }

  async function defaultFetchFunction(query: MinimalFilterQuery) {
    itemsList = await fetchFunction(query)
    return itemsList.filter(item => filterFunction(item, query)).map(optionMappingFunction)
  }
</script>

{#if browser}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {warning} {showErrorMessage} {warningPosition} error={errorMessage}>
      <MultiSelect
        {placeholder}
        {width}
        {contentWidth}
        {validateAddItem}
        fetchFunction={defaultFetchFunction}
        value={selectedValues}
        options={[]}
        {allowCreate}
        {addItemText}
        {addItemInvalidText}
        {emptyText}
        onChange={onItemsChange}
        multiselectionColored={false}
        multiselection />
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
