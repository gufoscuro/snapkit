<!--
  @component PricesEditor
  @description Multi-line editor for volume-based pricing (deals) with VAT.
  First row is always the base "Unit Price" with min quantity 1.
  Provides add/remove row functionality via EditableTableField pattern.
  @keywords prices, deals, pricing, tiers, volume
  @uses EditableTableField, PriceField, TextField
-->
<script lang="ts" module>
	import type { FieldValidator } from '$components/core/form/validation'
	import * as m from '$lib/paraglide/messages'
	import type { PriceDealAttr, PricesAttr } from '$lib/types/api-types'

	/**
	 * Validator: requires at least one price (unit price).
	 * Use with v.schema(): prices: [pricesRequired()]
	 */
	export function pricesRequired<T>(message?: string): FieldValidator<T> {
		return (value) => {
			const prices = value as PricesAttr | undefined
			if (!prices || !prices.unit || prices.unit <= 0) {
				return message ?? m.validation_required_generic()
			}
			return undefined
		}
	}
</script>

<script lang="ts">
	import EditableTableField from '$components/core/form/EditableTableField.svelte'
	import PriceField from '$components/core/form/PriceField.svelte'
	import TextField from '$components/core/form/TextField.svelte'
	import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
	import * as Table from '$components/ui/table'
	import { DEFAULT_CURRENCY_CODE } from '$utils/prices'
	import { getUOMDisplayedSymbol, getUOMMinQuantity } from '$utils/uom'

	/**
	 * Internal deal item for editing (string values for inputs)
	 */
	type InternalDealItem = {
		min_quantity: string
		unit: string
		category: string
	}

	type Props = {
		/** Field name for form binding */
		name?: string
		/** Label for the field */
		label?: string
		/** Show visible label */
		showLabel?: boolean
		/** Initial value (for loading existing data) */
		value?: PricesAttr
		/** Currency code (ISO 4217) */
		currency?: 'EUR' | 'USD' | 'GBP'
		/** Unit of measure for quantity display */
		uom?: string
		/** Show VAT field */
		showVAT?: boolean
		/** Require at least one price */
		required?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Callback when prices change */
		onChange?: (prices: PricesAttr) => void
		/** Additional CSS classes */
		class?: string
	}

	let {
		name = 'prices',
		label = m.prices(),
		showLabel = true,
		value,
		currency = DEFAULT_CURRENCY_CODE,
		uom = 'unit',
		showVAT = true,
		required = false,
		disabled = false,
		onChange,
		class: className = '',
	}: Props = $props()

	// Internal state
	let deals = $state<InternalDealItem[]>([])
	let vat = $state<string>('22')

	// Derived UOM display
	const uomSymbol = $derived(getUOMDisplayedSymbol(uom))
	const uomMinQty = $derived(getUOMMinQuantity(uom))

	// Create empty deal item
	function createEmptyItem(): InternalDealItem {
		return {
			min_quantity: '',
			unit: '',
			category: '',
		}
	}

	// Create first/default item (Unit Price with min quantity 1)
	function createFirstItem(): InternalDealItem {
		return {
			min_quantity: '1',
			unit: '',
			category: m.unit_price(),
		}
	}

	// Check if item is empty
	function isEmptyItem(item: InternalDealItem): boolean {
		return !item.min_quantity && !item.unit
	}

	// Check if item is complete (valid for output)
	function isCompleteItem(item: InternalDealItem): boolean {
		const minQty = parseFloat(item.min_quantity)
		const price = parseFloat(item.unit)
		return !isNaN(minQty) && minQty > 0 && !isNaN(price) && price > 0
	}

	// Transform internal deals to API output format
	function transformDealsOutput(internalDeals: InternalDealItem[]): PriceDealAttr[] {
		return internalDeals
			.map((deal) => ({
				min_quantity: parseFloat(deal.min_quantity),
				unit: parseFloat(deal.unit),
				category: deal.category || undefined,
			}))
			.sort((a, b) => a.min_quantity - b.min_quantity)
	}

	// Transform to complete PricesAttr output
	function transformOutput(internalDeals: InternalDealItem[]): PricesAttr {
		const sortedDeals = transformDealsOutput(internalDeals)
		const unitPrice = sortedDeals.find((d) => d.min_quantity === 1)?.unit || sortedDeals[0]?.unit || 0

		return {
			currency,
			unit: unitPrice,
			vat: parseFloat(vat) || undefined,
			deals: sortedDeals,
		}
	}

	// Load initial value
	$effect(() => {
		if (value && deals.length === 0) {
			vat = value.vat?.toString() || '22'

			if (value.deals && value.deals.length > 0) {
				deals = value.deals.map((deal, index) => ({
					min_quantity: deal.min_quantity.toString(),
					unit: deal.unit.toString(),
					category: deal.category || (index === 0 ? m.unit_price() : ''),
				}))
			} else if (value.unit) {
				// Initialize with unit price if no deals
				deals = [
					{
						min_quantity: '1',
						unit: value.unit.toString(),
						category: m.unit_price(),
					},
				]
			} else {
				deals = [createFirstItem()]
			}
		} else if (deals.length === 0) {
			deals = [createFirstItem()]
		}
	})

	/**
	 * Handle deals change callback
	 */
	function handleDealsChange(completedDeals: InternalDealItem[]) {
		const output = transformOutput(completedDeals)
		onChange?.(output)
	}

	/**
	 * Handle VAT change
	 */
	function handleVATChange() {
		if (deals.length > 0) {
			const output = transformOutput(deals.filter(isCompleteItem))
			onChange?.(output)
		}
	}
</script>

<div class="w-full {className}">
	<EditableTableField
		name="{name}-deals"
		{label}
		{showLabel}
		{required}
		bind:items={deals}
		{createEmptyItem}
		{isEmptyItem}
		{isCompleteItem}
		transformOutput={transformDealsOutput}
		{disabled}
		minWidth="700px"
		onItemsChange={handleDealsChange}>
		{#snippet header()}
			<Table.Head class="w-40">{m.price()}</Table.Head>
			<Table.Head class="w-40">{m.min_quantity()}</Table.Head>
			<Table.Head class="min-w-48">{m.price_type()}</Table.Head>
		{/snippet}

		{#snippet row({ item, index, updateItem, onFocus, onBlur })}
			<!-- Price -->
			<Table.Cell class={EditableTableFieldClass.TableCell}>
				<PriceField
					name="price-{index}"
					value={parseFloat(item.unit) || 0}
					{currency}
					placeholder={m.price()}
					class={FormFieldClass.TableCell}
					showLabel={false}
					showErrorMessage={false}
					width="w-full"
					onChange={(value) => updateItem(index, { unit: value.toString() })}
					onfocus={onFocus}
					onblur={onBlur} />
			</Table.Cell>

			<!-- Min Quantity -->
			<Table.Cell class={EditableTableFieldClass.TableCell}>
				<TextField
					name="quantity-{index}"
					type="number"
					value={item.min_quantity}
					rightLabel={uomSymbol}
					placeholder={m.min_quantity()}
					class="{FormFieldClass.TableCell} pr-12"
					showLabel={false}
					showErrorMessage={false}
					width="w-full"
					min={uomMinQty}
					step={uomMinQty}
					oninput={(e) => updateItem(index, { min_quantity: e.currentTarget.value })}
					onfocus={onFocus}
					onblur={onBlur} />
			</Table.Cell>

			<!-- Category / Price Type -->
			<Table.Cell class={EditableTableFieldClass.TableCell}>
				<TextField
					name="category-{index}"
					value={item.category}
					placeholder={m.price_type()}
					class={FormFieldClass.TableCell}
					showLabel={false}
					showErrorMessage={false}
					width="w-full"
					oninput={(e) => updateItem(index, { category: e.currentTarget.value })}
					onfocus={onFocus}
					onblur={onBlur} />
			</Table.Cell>
		{/snippet}
	</EditableTableField>

	<!-- VAT Field -->
	{#if showVAT}
		<div class="mt-4 {FormFieldClass.MaxWidth}">
			<TextField
				name="{name}-vat"
				label={m.vat()}
				type="number"
				rightLabel="%"
				bind:value={vat}
				min={0}
				max={100}
				step={0.01}
				class="pr-8"
				{disabled}
				oninput={handleVATChange} />
		</div>
	{/if}
</div>
