<script lang="ts">
	type T = $$Generic

	import { browser } from '$app/environment'
	import FormFieldMessages from '$components/features/form/FormFieldMessages.svelte'
	import { FormFieldClass, type FormFieldMessagePosition } from '$components/features/form/form'
	import MultiSelect from '$components/features/form/multiselect/MultiSelect.svelte'
	import FormFieldSkeleton from '$components/features/form/FormFieldSkeleton.svelte'
	import Label from '$components/ui/label/label.svelte'
	import type { MinimalFilterQuery } from '$utils/filters'
	import type { BasicOption, ExtendedOption } from '$utils/generics'

	export let formAPI: any = null
	export let label: string = 'Items'
	export let placeholder: string | undefined = 'Select Items Placeholder'
	export let name: string = 'items'
	export let id: string = name
	export let value: Array<string> = []
	export let error: string | undefined = ''
	export let warning: string | undefined = ''
	export let warningPosition: FormFieldMessagePosition | undefined = undefined
	export let showLabel: boolean = true
	export let showErrorMessage: boolean = true
	export let width: string = FormFieldClass.MinWidth
	export let contentWidth: string = width
	export let allowCreate: boolean = false
	export let emptyText: string = 'No Results Found'
	export let addItemText: string = 'Add Item'
	export let addItemInvalidText: string = 'Cannot Add Item'
	export let onChoose: (items: T[]) => void = () => {}
	export let onChange: (items: ExtendedOption[]) => void = () => {}

	export let fetchFunction: (query: Partial<MinimalFilterQuery>) => Promise<T[]> = () =>
		Promise.resolve([])
	export let validateAddItem: (value: string) => boolean = () => true
	export let filterFunction: (item: T, query: Partial<MinimalFilterQuery>) => boolean = () => true
	export let optionMappingFunction: (item: T) => ExtendedOption = (item) => ({
		label: (item as any).name,
		value: (item as any).id as string,
		attr: item
	})

	let itemsList: Array<T> = []
	let selectedValues: Array<BasicOption> = []

	function onItemsChange(nextItems: Array<ExtendedOption>) {
		onChange(nextItems)
		onChoose(nextItems.map((option) => option.attr as T))

		if (!formAPI) return

		formAPI.updateField(
			name,
			nextItems.map((option) => option.value)
		)
	}

	async function loadSelectedValues(valuesArray: Array<string>) {
		if (!itemsList.length) await defaultFetchFunction({})
		if (!valuesArray) return []

		const mappedItems = itemsList.map(optionMappingFunction)

		selectedValues =
			valuesArray.map((selectedValue) => ({
				label: mappedItems.find((i) => i.value === selectedValue)?.label as string,
				value: selectedValue
			})) || []
	}

	async function defaultFetchFunction(query: MinimalFilterQuery) {
		itemsList = await fetchFunction(query)

		return itemsList.filter((item) => filterFunction(item, query)).map(optionMappingFunction)
	}

	$: errorMessage = (typeof formAPI?.errors[name] === 'string' && formAPI?.errors[name]) || error
	$: loadSelectedValues(formAPI?.form[name] || value)
</script>

{#if browser}
	<div>
		<Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
		<FormFieldMessages
			{id}
			{warning}
			{showErrorMessage}
			{warningPosition}
			error={errorMessage}
			let:aria
		>
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
				on:change
				multiselectionColored={false}
				multiselection
			/>
		</FormFieldMessages>
	</div>
{:else}
	<FormFieldSkeleton {showLabel} {width} />
{/if}
