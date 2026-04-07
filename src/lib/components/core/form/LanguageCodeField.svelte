<!--
  @component LanguageCodeField
  @description Select field for Language Code with autowired form context support.
-->
<script lang="ts">
	import SelectField from './SelectField.svelte'
	import { SelectorFieldDefaults, type SelectorFieldProps } from './form'
	import { DEFAULT_LANGUAGE_CODE, getLanguageOptions } from '$utils/language'
	import * as m from '$lib/paraglide/messages'

	type Props = Omit<SelectorFieldProps, 'placeholder'> & {
		/** Callback when value changes */
		onChange?: (value: string | null) => void
	}

	let {
		name = 'language_code',
		label = m.language_code(),
		id = name,
		value = DEFAULT_LANGUAGE_CODE,
		error = undefined,
		warning = undefined,
		errorPosition = SelectorFieldDefaults.errorPosition,
		warningPosition = SelectorFieldDefaults.warningPosition,
		showLabel = SelectorFieldDefaults.showLabel,
		showErrorMessage = SelectorFieldDefaults.showErrorMessage,
		allowClear = false,
		disabled = SelectorFieldDefaults.disabled,
		hidden = false,
		width = 'min-w-32',
		contentWidth = SelectorFieldDefaults.contentWidth,
		align = SelectorFieldDefaults.align,
		onChange,
		class: className = '',
	}: Props = $props()

	const items = getLanguageOptions()
</script>

<SelectField
	{name}
	{label}
	{id}
	{value}
	{items}
	{error}
	{warning}
	{errorPosition}
	{warningPosition}
	{showLabel}
	{showErrorMessage}
	{allowClear}
	{disabled}
	{hidden}
	{width}
	{contentWidth}
	{align}
	{onChange}
	class={className}
/>
