<!--
  @component PhonesEditor
  @description Multi-line editor for phones with phone number and label fields.
  Provides add/remove row functionality via EditableTableField pattern with phone validation.
  @keywords phones, editor, line-items, contact
  @uses EditableTableField, TextField
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'
  import type { PhoneAttr } from '$lib/types/api-types'

  /**
   * Validator: requires at least one phone.
   * Use with v.schema(): phones: [phonesRequired()]
   */
  export function phonesRequired<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as PhoneAttr[] | undefined
      if (!items || items.length === 0) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }

  /**
   * Phone validation regex (basic international format)
   * Accepts: +, digits, spaces, dashes, parentheses
   */
  const PHONE_REGEX = /^[\d\s()+-]+$/

  /**
   * Validate phone format
   */
  export function isValidPhone(phone: string): boolean {
    // Must have at least 6 digits and match pattern
    const digitsOnly = phone.replace(/\D/g, '')
    return digitsOnly.length >= 6 && PHONE_REGEX.test(phone)
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
  type InternalPhoneItem = PhoneAttr & {
    /** Phone validation error */
    phoneError?: string
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
    value?: PhoneAttr[]
    /** Require at least one item (adds asterisk to label) */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when phones change */
    onChange?: (items: PhoneAttr[]) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'phones',
    label = m.phones(),
    showLabel = true,
    value = [],
    required = false,
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props()

  // Internal items state
  let items = $state<InternalPhoneItem[]>([])

  // Create empty item
  function createEmptyItem(): InternalPhoneItem {
    return {
      name: '',
      phone: '',
      phoneError: undefined,
      nameError: undefined,
    }
  }

  // Check if item is empty
  function isEmptyItem(item: InternalPhoneItem): boolean {
    return !item.name && !item.phone
  }

  // Check if item is complete (valid for output)
  function isCompleteItem(item: InternalPhoneItem): boolean {
    const hasRequiredFields = !!item.name && !!item.phone
    const hasValidPhone = isValidPhone(item.phone)
    return hasRequiredFields && hasValidPhone
  }

  // Transform internal items to API output format
  function transformOutput(internalItems: InternalPhoneItem[]): PhoneAttr[] {
    return internalItems.map(item => ({
      name: item.name,
      phone: item.phone,
    }))
  }

  // Load initial value
  $effect(() => {
    if (value && value.length > 0 && items.length === 0) {
      items = value.map(item => ({
        name: item.name,
        phone: item.phone,
        phoneError: undefined,
        nameError: undefined,
      }))
    }
  })

  /**
   * Validate phone field
   */
  function validatePhone(item: InternalPhoneItem): string | undefined {
    // Don't validate empty rows
    if (isEmptyItem(item)) return undefined
    // Empty phone on non-empty row is OK (user might be filling other fields first)
    if (!item.phone) return undefined
    // Validate phone format
    // if (!isValidPhone(item.phone)) {
    // 	return m.validation_invalid_format({ field: m.phone() })
    // }

    return undefined
  }

  /**
   * Handle items change callback
   */
  function handleItemsChange(completedItems: InternalPhoneItem[]) {
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
    <Table.Head class="min-w-64">{m.phone()}</Table.Head>
    <Table.Head class="min-w-48">{m.phone_label()}</Table.Head>
  {/snippet}

  {#snippet row({ item, index, updateItem, onFocus, onBlur })}
    <!-- Phone Number -->
    <Table.Cell class={EditableTableFieldClass.TableCell}>
      <TextField
        name="phone-{index}"
        type="tel"
        value={item.phone}
        placeholder={m.phone()}
        class={FormFieldClass.TableCell}
        showLabel={false}
        showErrorMessage={false}
        error={validatePhone(item)}
        errorPosition="floating-bottom"
        width="w-full"
        oninput={e => {
          const newPhone = e.currentTarget.value
          updateItem(index, { phone: newPhone, phoneError: validatePhone({ ...item, phone: newPhone }) })
        }}
        onfocus={onFocus}
        onblur={onBlur} />
    </Table.Cell>

    <!-- Phone Label -->
    <Table.Cell class={EditableTableFieldClass.TableCell}>
      <TextField
        name="name-{index}"
        value={item.name}
        placeholder={m.phone_label()}
        class={FormFieldClass.TableCell}
        showLabel={false}
        showErrorMessage={false}
        width="w-full"
        oninput={e => updateItem(index, { name: e.currentTarget.value })}
        onfocus={onFocus}
        onblur={onBlur} />
    </Table.Cell>
  {/snippet}
</EditableTableField>
