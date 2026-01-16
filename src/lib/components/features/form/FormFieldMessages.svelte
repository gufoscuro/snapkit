<script lang="ts">
	import type { FormFieldMessagePosition } from '$components/features/form/form'
	import FormFieldWarningMessage from '$components/features/form/FormFieldWarningMessage.svelte'
	import FormFieldErrorMessage from './FormFieldErrorMessage.svelte'

	export let id: string
	export let error: string | undefined = undefined
	export let warning: string | undefined = undefined
	export let warningPosition: FormFieldMessagePosition = 'bottom'
	export let errorPosition: FormFieldMessagePosition = 'bottom'
	export let showErrorMessage: boolean = true

	$: messageId = error ? `error-${id}` : warning ? `warning-${id}` : undefined
	$: aria = {
		'aria-invalid': !!error,
		...(messageId ? { 'aria-describedby': messageId } : {})
	}
</script>

<div class="group/message relative">
	{#if !error && warning && (warningPosition === 'top' || warningPosition === 'floating-top')}
		<FormFieldWarningMessage {id} message={warning} position={warningPosition} />
	{/if}

	{#if showErrorMessage && !!error && (errorPosition === 'floating-top' || errorPosition === 'top')}
		<FormFieldErrorMessage {id} message={error} position={errorPosition} />
	{/if}

	<slot {aria} />

	{#if !error && warning && (warningPosition === 'bottom' || warningPosition === 'floating-bottom')}
		<FormFieldWarningMessage {id} message={warning} position={warningPosition} />
	{/if}

	{#if showErrorMessage && !!error && errorPosition === 'floating-bottom'}
		<FormFieldErrorMessage {id} message={error} position={errorPosition} />
	{/if}

	{#if showErrorMessage && !!error && errorPosition === 'bottom'}
		<div
			id="error-{id}"
			class="text-destructive mt-1 flex items-center gap-1 text-xs font-semibold"
		>
			{error}
		</div>
	{/if}
</div>
