<script lang="ts">
  import { FormFieldClass } from '$components/form/form'
  import FormGenericSingleSelector from '$components/form/FormGenericSingleSelector.svelte'
  import { type FilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { apiRequest } from '$utils/request'

  export let formAPI: any = null
  export let attr: ExampleObject | undefined = undefined
  export let label: string = 'Object'
  export let placeholder: string | undefined = 'Select an object...'
  export let name: string = 'object'
  export let id: string = name
  export let error: string | undefined = ''
  export let showLabel: boolean = true
  export let showErrorMessage: boolean = true
  export let width: string = FormFieldClass.SelectorDefaultWidth
  export let contentWidth: string = width
  export let readonly: boolean = false
  export let allowNewRecord: boolean = false
  export let onChoose: (item: ExampleObject) => void = () => {}
  export let onChange: (item: ExtendedOption | undefined) => void = () => {}
  export let onClear: () => void = () => {}

  type ExampleObject = {
    id: string
    name: string
  }

  function optionMappingFunction(item: ExampleObject): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<ExampleObject[]> {
    return apiRequest<ExampleObject[]>({
      url: `/some/foo/bar/endpoint`,
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
