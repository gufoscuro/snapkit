<!--
  @component AddressesEditor
  @description Multi-line editor for addresses with name, address, and country fields.
  Provides add/remove row functionality via EditableTableField pattern.
  @keywords addresses, editor, line-items, location
  @uses EditableTableField, CountryField, TextField, Textarea
-->
<script lang="ts" module>
	import type { FieldValidator } from '$components/core/form/validation'
	import * as m from '$lib/paraglide/messages'
	import type { AddressAttr } from '$lib/types/api-types'

	/**
	 * Validator: requires at least one address.
	 * Use with v.schema(): addresses: [addressesRequired()]
	 */
	export function addressesRequired<T>(message?: string): FieldValidator<T> {
		return (value) => {
			const items = value as AddressAttr[] | undefined
			if (!items || items.length === 0) {
				return message ?? m.validation_required_generic()
			}
			return undefined
		}
	}
</script>

<script lang="ts">
	import EditableTableField from '$components/core/form/EditableTableField.svelte'
	import TextField from '$components/core/form/TextField.svelte'
	import CountryField from '$components/core/form/CountryField.svelte'
	import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
	import * as Table from '$components/ui/table'
	import { Textarea } from '$components/ui/textarea'
	import { DEFAULT_COUNTRY_CODE } from '$utils/country'

	/**
	 * Internal line item type for editing
	 */
	type InternalAddressItem = AddressAttr

	type Props = {
		/** Field name for form binding */
		name?: string
		/** Label for the field */
		label?: string
		/** Show visible label */
		showLabel?: boolean
		/** Initial value (for loading existing data) */
		value?: AddressAttr[]
		/** Require at least one item (adds asterisk to label) */
		required?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Callback when addresses change */
		onChange?: (items: AddressAttr[]) => void
		/** Additional CSS classes */
		class?: string
	}

	let {
		name = 'addresses',
		label = m.addresses(),
		showLabel = true,
		value = [],
		required = false,
		disabled = false,
		onChange,
		class: className = '',
	}: Props = $props()

	// Internal items state
	let items = $state<InternalAddressItem[]>([])

	// Create empty item
	function createEmptyItem(): InternalAddressItem {
		return {
			name: '',
			address: '',
			country: DEFAULT_COUNTRY_CODE,
		}
	}

	// Check if item is empty
	function isEmptyItem(item: InternalAddressItem): boolean {
		return !item.name && !item.address
	}

	// Check if item is complete (valid for output)
	function isCompleteItem(item: InternalAddressItem): boolean {
		return !!item.name && !!item.address && !!item.country
	}

	// Transform internal items to API output format
	function transformOutput(internalItems: InternalAddressItem[]): AddressAttr[] {
		return internalItems.map((item) => ({
			name: item.name,
			address: item.address,
			country: item.country,
		}))
	}

	// Load initial value
	$effect(() => {
		if (value && value.length > 0 && items.length === 0) {
			items = value.map((item) => ({
				name: item.name,
				address: item.address,
				country: item.country || DEFAULT_COUNTRY_CODE,
			}))
		}
	})

	/**
	 * Handle items change callback
	 */
	function handleItemsChange(completedItems: InternalAddressItem[]) {
		const output = transformOutput(completedItems)
		onChange?.(output)
	}
</script>

<EditableTableField
	{name}
	{label}
	{showLabel}
	{required}
	bind:items
	{createEmptyItem}
	{isEmptyItem}
	{isCompleteItem}
	{transformOutput}
	{disabled}
	minWidth="800px"
	onItemsChange={handleItemsChange}
	class={className}>
	{#snippet header()}
		<Table.Head class="min-w-64">{m.address()}</Table.Head>
		<Table.Head class="w-48">{m.country_label()}</Table.Head>
		<Table.Head class="min-w-48">{m.address_label()}</Table.Head>
	{/snippet}

	{#snippet row({ item, index, updateItem, onFocus, onBlur })}
		<!-- Address -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<Textarea
				name="address-{index}"
				placeholder={m.address()}
				class="{FormFieldClass.TableCell} min-h-10 resize-none"
				rows={1}
				value={item.address}
				oninput={(e) => {
					const target = e.currentTarget
					updateItem(index, { address: target.value.replace(/\n/g, ' ') })
				}}
				onfocus={(e) => {
					const target = e.currentTarget
					target.style.height = 'auto'
					target.style.height = `${target.scrollHeight}px`
					onFocus()
				}}
				onblur={(e) => {
					const target = e.currentTarget
					target.style.height = 'auto'
					onBlur()
				}} />
		</Table.Cell>

		<!-- Country -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<CountryField
				name="country-{index}"
				value={item.country}
				class={FormFieldClass.TableCell}
				showLabel={false}
				showErrorMessage={false}
				width={FormFieldClass.SelectorTableCellWidth}
				contentWidth={FormFieldClass.SelectorContentTableCellWidth}
				onChange={(value) => updateItem(index, { country: value || DEFAULT_COUNTRY_CODE })} />
		</Table.Cell>

		<!-- Address Label -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<TextField
				name="name-{index}"
				value={item.name}
				placeholder={m.address_label()}
				class={FormFieldClass.TableCell}
				showLabel={false}
				showErrorMessage={false}
				width="w-full"
				oninput={(e) => updateItem(index, { name: e.currentTarget.value })}
				onfocus={onFocus}
				onblur={onBlur} />
		</Table.Cell>
	{/snippet}
</EditableTableField>
