<!--
  @component FormSelectorExample
  @description A single-select dropdown that is intended as an example of a form selector.
  Fetches materials from GET /raw-material endpoint with search support.
  Displays material name with supplier information.
  @keywords materials, raw-materials, selector, picker, dropdown, supply, inventory, example
  @uses FormGenericSingleSelector
  @api GET /raw-material (supply-api) -> rawMaterialSummary[]
-->

<script lang="ts">
	import { FormFieldClass } from '$components/core/form/form';
	import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte';
	import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters';
	import type { ExtendedOption } from '$lib/utils/generics';
	import { apiRequest } from '$lib/utils/request';

	/**
	 * Raw material summary type from supply-api GET /raw-material endpoint
	 */
	type RawMaterialSummary = {
		id?: string;
		external_id: string;
		name: string;
		description?: string;
		categories: string[];
		supplier_id: string;
		supplier_attr?: {
			address?: string;
			country?: string;
			id?: string;
			name: string;
			vat: string;
		};
		uom: string;
		minimum_quantity: number;
		lead_time?: string;
		prod_id?: string;
	};

	type Props = {
		attr?: RawMaterialSummary;
		label?: string;
		placeholder?: string;
		name?: string;
		id?: string;
		error?: string;
		showLabel?: boolean;
		showErrorMessage?: boolean;
		width?: string;
		contentWidth?: string;
		readonly?: boolean;
		allowNewRecord?: boolean;
		onChoose?: (item: RawMaterialSummary) => void;
		onChange?: (item: ExtendedOption | undefined) => void;
		onClear?: () => void;
	};

	let {
		attr = undefined,
		label = 'Material',
		placeholder = 'Select a material...',
		name = 'material',
		id = name,
		error = '',
		showLabel = true,
		showErrorMessage = true,
		width = FormFieldClass.SelectorDefaultWidth,
		contentWidth = width,
		readonly = false,
		allowNewRecord = false,
		onChoose = () => {},
		onChange = () => {},
		onClear = () => {}
	}: Props = $props();

	function optionMappingFunction(item: RawMaterialSummary): ExtendedOption {
		const supplierInfo = item.supplier_attr?.name ? ` (${item.supplier_attr.name})` : '';
		return {
			label: `${item.name}${supplierInfo}`,
			value: (item.id ?? item.external_id) as string,
			attr: item
		};
	}

	async function fetchFunction(query: Partial<FilterQuery>): Promise<RawMaterialSummary[]> {
		console.log('FormSelectorExample fetchFunction called with query:', query);
		return apiRequest<RawMaterialSummary[]>({
			url: 'supply/raw-material',
			queryParams: createQueryRequestObject(query)
		});
	}
</script>

<FormGenericSingleSelector
	selectedValue={attr ? optionMappingFunction(attr) : undefined}
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
	{onClear}
/>
