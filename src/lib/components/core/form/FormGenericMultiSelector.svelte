<script lang="ts" generics="T">
	import { browser } from '$app/environment';
	import FormFieldMessages from './FormFieldMessages.svelte';
	import { FormFieldClass, FormLabelClass, type FormFieldMessagePosition } from './form';
	import MultiSelect from './multiselect/MultiSelect.svelte';
	import FormFieldSkeleton from './FormFieldSkeleton.svelte';
	import Label from '$components/ui/label/label.svelte';
	import { getFormContextOptional } from './form-context';
	import type { MinimalFilterQuery } from '$utils/filters';
	import type { BasicOption, ExtendedOption } from '$utils/generics';

	type Props = {
		label?: string;
		placeholder?: string;
		name: string;
		id?: string;
		value?: Array<string>;
		error?: string;
		warning?: string;
		warningPosition?: FormFieldMessagePosition;
		showLabel?: boolean;
		showErrorMessage?: boolean;
		width?: string;
		contentWidth?: string;
		allowCreate?: boolean;
		emptyText?: string;
		addItemText?: string;
		addItemInvalidText?: string;
		onChoose?: (items: T[]) => void;
		onChange?: (items: ExtendedOption[]) => void;
		fetchFunction?: (query: Partial<MinimalFilterQuery>) => Promise<T[]>;
		validateAddItem?: (value: string) => boolean;
		filterFunction?: (item: T, query: Partial<MinimalFilterQuery>) => boolean;
		optionMappingFunction?: (item: T) => ExtendedOption;
	};

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
		optionMappingFunction = (item) =>
			({
				label: (item as Record<string, unknown>).name,
				value: (item as Record<string, unknown>).id as string,
				attr: item
			}) as ExtendedOption
	}: Props = $props();

	const form = getFormContextOptional();

	let itemsList: Array<T> = $state([]);
	let selectedValues: Array<BasicOption> = $state([]);

	const errorMessage = $derived((form?.errors[name] as string | undefined) || error || undefined);

	// Watch for value changes from form context or prop
	$effect(() => {
		const valuesArray = (form?.values[name] as Array<string> | undefined) || value;
		loadSelectedValues(valuesArray);
	});

	function onItemsChange(nextItems: Array<ExtendedOption>) {
		onChange(nextItems);
		onChoose(nextItems.map((option) => option.attr as T));

		form?.updateField(
			name,
			nextItems.map((option) => option.value) as never
		);
	}

	async function loadSelectedValues(valuesArray: Array<string>) {
		if (!itemsList.length) await defaultFetchFunction({});
		if (!valuesArray || !valuesArray.length) {
			selectedValues = [];
			return;
		}

		const mappedItems = itemsList.map(optionMappingFunction);

		selectedValues = valuesArray.map((selectedValue) => ({
			label: mappedItems.find((i) => i.value === selectedValue)?.label as string,
			value: selectedValue
		}));
	}

	async function defaultFetchFunction(query: MinimalFilterQuery) {
		itemsList = await fetchFunction(query);
		return itemsList.filter((item) => filterFunction(item, query)).map(optionMappingFunction);
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
				multiselection
			/>
		</FormFieldMessages>
	</div>
{:else}
	<FormFieldSkeleton {showLabel} {width} />
{/if}
