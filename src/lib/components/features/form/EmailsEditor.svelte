<!--
  @component EmailsEditor
  @description Multi-line editor for emails with email address and label fields.
  Provides add/remove row functionality via EditableTableField pattern with email validation.
  @keywords emails, editor, line-items, contact
  @uses EditableTableField, TextField
-->
<script lang="ts" module>
	import type { FieldValidator } from '$components/core/form/validation'
	import * as m from '$lib/paraglide/messages'
	import type { EmailAttr } from '$lib/types/api-types'

	/**
	 * Validator: requires at least one email.
	 * Use with v.schema(): emails: [emailsRequired()]
	 */
	export function emailsRequired<T>(message?: string): FieldValidator<T> {
		return (value) => {
			const items = value as EmailAttr[] | undefined
			if (!items || items.length === 0) {
				return message ?? m.validation_required_generic()
			}
			return undefined
		}
	}

	/**
	 * Email validation regex (RFC 5322 simplified)
	 */
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	/**
	 * Validate email format
	 */
	export function isValidEmail(email: string): boolean {
		return EMAIL_REGEX.test(email)
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
	type InternalEmailItem = EmailAttr & {
		/** Email validation error */
		emailError?: string
		/** Name validation error */
		nameError?: string
	}

	type Props = {
		/** Field name for form binding */
		name?: string
		/** Label for the field */
		label?: string
		/** Show visible label */
		showLabel?: boolean
		/** Initial value (for loading existing data) */
		value?: EmailAttr[]
		/** Require at least one item (adds asterisk to label) */
		required?: boolean
		/** Disabled state */
		disabled?: boolean
		/** Callback when emails change */
		onChange?: (items: EmailAttr[]) => void
		/** Additional CSS classes */
		class?: string
	}

	let {
		name = 'emails',
		label = m.emails(),
		showLabel = true,
		value = [],
		required = false,
		disabled = false,
		onChange,
		class: className = '',
	}: Props = $props()

	// Internal items state
	let items = $state<InternalEmailItem[]>([])

	// Create empty item
	function createEmptyItem(): InternalEmailItem {
		return {
			name: '',
			email: '',
			emailError: undefined,
			nameError: undefined,
		}
	}

	// Check if item is empty
	function isEmptyItem(item: InternalEmailItem): boolean {
		return !item.name && !item.email
	}

	// Check if item is complete (valid for output)
	function isCompleteItem(item: InternalEmailItem): boolean {
		const hasRequiredFields = !!item.name && !!item.email
		const hasValidEmail = isValidEmail(item.email)
		return hasRequiredFields && hasValidEmail
	}

	// Transform internal items to API output format
	function transformOutput(internalItems: InternalEmailItem[]): EmailAttr[] {
		return internalItems.map((item) => ({
			name: item.name,
			email: item.email,
		}))
	}

	// Load initial value
	$effect(() => {
		if (value && value.length > 0 && items.length === 0) {
			items = value.map((item) => ({
				name: item.name,
				email: item.email,
				emailError: undefined,
				nameError: undefined,
			}))
		}
	})

	/**
	 * Validate email field
	 */
	function validateEmail(item: InternalEmailItem): string | undefined {
		// Don't validate empty rows
		if (isEmptyItem(item)) return undefined
		// Empty email on non-empty row is OK (user might be filling other fields first)
		if (!item.email) return undefined
		// Validate email format
		if (!isValidEmail(item.email)) {
			return m.validation_invalid_format({ field: m.email() })
		}
		return undefined
	}

	/**
	 * Handle items change callback
	 */
	function handleItemsChange(completedItems: InternalEmailItem[]) {
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
		<Table.Head class="min-w-64">{m.email()}</Table.Head>
		<Table.Head class="min-w-48">{m.email_label()}</Table.Head>
	{/snippet}

	{#snippet row({ item, index, updateItem, onFocus, onBlur })}
		<!-- Email Address -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<TextField
				name="email-{index}"
				type="email"
				value={item.email}
				placeholder={m.email()}
				class={FormFieldClass.TableCell}
				showLabel={false}
				showErrorMessage={false}
				error={validateEmail(item)}
				errorPosition="floating-bottom"
				width="w-full"
				oninput={(e) => {
					const newEmail = e.currentTarget.value
					updateItem(index, { email: newEmail, emailError: validateEmail({ ...item, email: newEmail }) })
				}}
				onfocus={onFocus}
				onblur={onBlur} />
		</Table.Cell>

		<!-- Email Label -->
		<Table.Cell class={EditableTableFieldClass.TableCell}>
			<TextField
				name="name-{index}"
				value={item.name}
				placeholder={m.email_label()}
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
