<script lang="ts">
  type T = $$Generic

  import { browser } from '$app/environment'
  import { FormFieldClass } from '$components/features/form/form'
  import FormFieldMessages from '$components/features/form/FormFieldMessages.svelte'
  import FormFieldSkeleton from '$components/features/form/FormFieldSkeleton.svelte'
  import MultiSelect from '$components/features/form/multiselect/MultiSelect.svelte'
  import ReadOnlyMultiselect from '$components/features/form/multiselect/ReadOnlyMultiselect.svelte'
  import Label from '$components/ui/label/label.svelte'
  import { type FilterQuery, type MinimalFilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'

  export let formAPI: any = null
  export let selectedValue: ExtendedOption | undefined = undefined
  export let label: string = 'Selector label'
  export let placeholder: string | undefined = 'Seleziona placeholder...'
  export let emptyText: string = 'No Results Found'
  export let name: string = 'operator'
  export let id: string = name
  export let error: string | undefined = ''
  export let showLabel: boolean = true
  export let showErrorMessage: boolean = true
  export let width: string = FormFieldClass.SelectorDefaultWidth
  export let contentWidth: string = width
  export let readonly: boolean = false
  export let allowNewRecord: boolean = false
  export let onChoose: (item: T) => void = () => {}
  export let onChange: (item: ExtendedOption | undefined) => void = () => {}
  export let onClear: () => void = () => {}

  export let fetchFunction: (query: Partial<FilterQuery>) => Promise<T[]> = () => Promise.resolve([])
  export let filterFunction: (item: T, query: Partial<MinimalFilterQuery>) => boolean = () => true
  export let optionMappingFunction: (item: T) => ExtendedOption = item => ({
    label: (item as any).name,
    value: (item as any).id as string,
  })

  let itemsList: Array<T> = []
  let attentionSeeker = false

  function onSelectionChange(value: Array<ExtendedOption>) {
    const [item] = value

    onChange(item)

    if (!item) return onClear()

    onChoose(item.attr as T)

    if (!formAPI) return
    formAPI.updateField(name, item.value)
    if (errorMessage) formAPI.validateField(name)
  }

  async function defaultFetchFunction(query: MinimalFilterQuery) {
    itemsList = await fetchFunction(query)

    return itemsList.filter(item => filterFunction(item, query)).map(optionMappingFunction)
  }

  $: errorMessage = (typeof formAPI?.errors[name] === 'string' && formAPI?.errors[name]) || error
  // $: selectedValue = attr ? { label: attr.name, value: attr.token_id as string } : undefined
</script>

{#if readonly}
  <ReadOnlyMultiselect {selectedValue} width={FormFieldClass.MinWidth} {label} {placeholder} {name} {id} {showLabel} />
{:else if browser}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} error={errorMessage} {showErrorMessage}>
      <MultiSelect
        {placeholder}
        {width}
        {contentWidth}
        {allowNewRecord}
        {emptyText}
        fetchFunction={defaultFetchFunction}
        value={selectedValue ? [selectedValue] : []}
        error={errorMessage}
        options={[]}
        newRecordText={'Add New Customer'}
        class="w-full {attentionSeeker ? 'attention-seeker shadow-border' : ''} {$$restProps.class || ''}"
        multiselection={false}
        shouldFilter={false}
        allowClear
        onChange={onSelectionChange}
        on:change />
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} class={$$restProps.class || ''} />
{/if}
