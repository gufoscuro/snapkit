<script lang="ts">
	import type { FormFieldMessagePosition } from './form';
	import type { Snippet } from 'svelte';
	import FormFieldWarningMessage from './FormFieldWarningMessage.svelte';
	import FormFieldErrorMessage from './FormFieldErrorMessage.svelte';

	type Props = {
		id: string;
		error?: string;
		warning?: string;
		warningPosition?: FormFieldMessagePosition;
		errorPosition?: FormFieldMessagePosition;
		showErrorMessage?: boolean;
		children: Snippet<[{ aria: Record<string, unknown> }]> | Snippet;
	};

	let {
		id,
		error = undefined,
		warning = undefined,
		warningPosition = 'bottom',
		errorPosition = 'bottom',
		showErrorMessage = true,
		children
	}: Props = $props();

	const messageId = $derived(error ? `error-${id}` : warning ? `warning-${id}` : undefined);
	const aria = $derived({
		'aria-invalid': !!error,
		...(messageId ? { 'aria-describedby': messageId } : {})
	});
</script>

<div class="group/message relative">
	{#if !error && warning && (warningPosition === 'top' || warningPosition === 'floating-top')}
		<FormFieldWarningMessage {id} message={warning} position={warningPosition} />
	{/if}

	{#if showErrorMessage && !!error && (errorPosition === 'floating-top' || errorPosition === 'top')}
		<FormFieldErrorMessage {id} message={error} position={errorPosition} />
	{/if}

	{@render children({ aria })}

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
