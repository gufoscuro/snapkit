<script lang="ts" generics="T">
  import { browser } from '$app/environment'
  import Label from '$components/ui/label/label.svelte'
  import { type FilterQuery, type MinimalFilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { EntitySelectorDefaults, FormFieldClass, FormLabelClass, type EntitySelectorProps } from './form'
  import { getFormContextOptional } from './form-context'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import MultiSelect from './multiselect/MultiSelect.svelte'
  import ReadOnlyMultiselect from './multiselect/ReadOnlyMultiselect.svelte'

  type Props = Omit<EntitySelectorProps, 'name'> & {
    /** Campo name per form e identificazione - richiesto */
    name: string
    selectedValue?: ExtendedOption
    emptyText?: string
    newRecordText?: string
    allowClear?: boolean
    onChoose?: (item: T) => void
    onChange?: (item: ExtendedOption | undefined) => void
    onClear?: () => void
    onCreateNew?: () => void
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<T[]>
    filterFunction?: (item: T, query: Partial<MinimalFilterQuery>) => boolean
    optionMappingFunction?: (item: T) => ExtendedOption
  }

  let {
    selectedValue = undefined,
    label = 'Selector label',
    placeholder = 'Select...',
    emptyText = 'No Results Found',
    newRecordText = 'Add New',
    name,
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
    hidden = false,
    allowNewRecord = EntitySelectorDefaults.allowNewRecord,
    allowClear = true,
    onChoose = () => {},
    onChange = () => {},
    onClear: onClearCallback = () => {},
    onCreateNew = () => {},
    fetchFunction = () => Promise.resolve([]),
    filterFunction = () => true,
    optionMappingFunction = item =>
      ({
        label: (item as Record<string, unknown>).name,
        value: (item as Record<string, unknown>).id,
      }) as ExtendedOption,
    class: className = '',
    ...restProps
  }: Props = $props()

  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)

  let itemsList: Array<T> = $state([])

  const errorMessage = $derived((form?.errors[name] as string | undefined) || error || undefined)

  function onSelectionChange(value: Array<ExtendedOption>) {
    const [item] = value

    onChange(item)

    if (!item) {
      onClearCallback()
      form?.updateField(name, '' as never)
      return
    }

    onChoose(item.attr as T)
    form?.updateField(name, item.value as never)

    if (errorMessage) {
      form?.validateField(name)
    }
  }

  async function defaultFetchFunction(query: MinimalFilterQuery) {
    itemsList = await fetchFunction(query)
    return itemsList.filter(item => filterFunction(item, query)).map(optionMappingFunction)
  }
</script>

{#if !isHidden && readonly}
  <ReadOnlyMultiselect {selectedValue} width={FormFieldClass.MinWidth} {label} {placeholder} {name} {id} {showLabel} />
{:else if !isHidden && browser}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} error={errorMessage} {warning} {warningPosition} {showErrorMessage}>
      <MultiSelect
        {placeholder}
        {width}
        {contentWidth}
        {align}
        {disabled}
        {allowNewRecord}
        {emptyText}
        {newRecordText}
        {warning}
        fetchFunction={defaultFetchFunction}
        value={selectedValue ? [selectedValue] : []}
        error={errorMessage}
        options={[]}
        class="w-full {className}"
        multiselection={false}
        shouldFilter={false}
        {allowClear}
        {onCreateNew}
        onChange={onSelectionChange} />
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} class={className} />
{/if}
