<!--
  @component AttributesEditor
  @description Multi-line editor for custom attributes (key-value pairs).
  Provides add/remove row functionality via EditableTableField pattern.
  @keywords attributes, metadata, properties, key-value
  @uses EditableTableField, TextField
-->
<script lang="ts" module>
	import type { FieldValidator } from '$components/core/form/validation'
	import * as m from '$lib/paraglide/messages'
	import type { AttributeAttr } from '$lib/types/api-types'

	/**
	 * Validator: requires at least one attribute.
	 * Use with v.schema(): attributes: [attributesRequired()]
	 */
	export function attributesRequired<T>(message?: string): FieldValidator<T> {
		return (value) => {
			const items = value as AttributeAttr[] | undefined
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
	import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
	import * as Table from '$components/ui/table'

	/**
	 * Internal line item type for editing
	 */
	type InternalAttributeItem = AttributeAttr

	type Props = {
		/** Field name for form binding */
		name?: string
		/** Label for the field */
		label?: string
		/** Show visible label */
		showLabel?: boolean
		/** Initial value (for loading existing data) */
		value?: AttributeAttr[]
		/** Require at least one item (adds asterisk to label) */
		required?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Callback when attributes change */
		onChange?: (items: AttributeAttr[]) => void
		/** Additional CSS classes */
		class?: string
	}

	let {
		name = 'attributes',
		label = m.attributes(),
		showLabel = true,
		value = [],
		required = false,
		disabled = false,
		onChange,
		class: className = '',
	}: Props = $props()

	// Internal items state
	let items = $state<InternalAttributeItem[]>([])

	// Create empty item
	function createEmptyItem(): InternalAttributeItem {
		return {
			name: '',
			value: '',
		}
	}

	// Check if item is empty
	function isEmptyItem(item: InternalAttributeItem): boolean {
		return !item.name && !item.value
	}

	// Check if item is complete (valid for output)
	function isCompleteItem(item: InternalAttributeItem): boolean {
		return !!item.name && !!item.value
	}

	// Transform internal items to API output format
	function transformOutput(internalItems: InternalAttributeItem[]): AttributeAttr[] {
		return internalItems.map((item) => ({
			name: item.name,
			value: item.value,
		}))
	}

	// Load initial value
	$effect(() => {
		if (value && value.length > 0 && items.length === 0) {
			items = value.map((item) => ({
				name: item.name,
				value: item.value,
			}))
		}
	})

	/**
	 * Handle items change callback
	 */
	function handleItemsChange(completedItems: InternalAttributeItem[]) {
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
	minWidth="700px"
	onItemsChange={handleItemsChange}
	class={className}>
	{#snippet header()}
		<Table.Head class="min-w-64">{m.attribute_name()}</Table.Head>
		<Table.Head class="min-w-64">{m.attribute_value()}</Table.Head>
	{/snippet}

	{#snippet row({ item, index, updateItem, onFocus, onBlur })}
		<!-- Attribute Name -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<TextField
				name="attribute-name-{index}"
				value={item.name}
				placeholder={m.attribute_name()}
				class={FormFieldClass.TableCell}
				showLabel={false}
				showErrorMessage={false}
				width="w-full"
				oninput={(e) => updateItem(index, { name: e.currentTarget.value })}
				onfocus={onFocus}
				onblur={onBlur} />
		</Table.Cell>

		<!-- Attribute Value -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<TextField
				name="attribute-value-{index}"
				value={item.value}
				placeholder={m.attribute_value()}
				class={FormFieldClass.TableCell}
				showLabel={false}
				showErrorMessage={false}
				width="w-full"
				oninput={(e) => updateItem(index, { value: e.currentTarget.value })}
				onfocus={onFocus}
				onblur={onBlur} />
		</Table.Cell>
	{/snippet}
</EditableTableField>
