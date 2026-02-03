<script lang="ts">
	import type { FormDebugInfo } from '../types'

	type Props = {
		forms: Map<string, FormDebugInfo>
	}

	let { forms }: Props = $props()

	// Convert map to array for rendering
	let formsList = $derived(Array.from(forms.values()))

	// Selected form (default to first)
	let selectedFormId = $state<string | null>(null)

	// Auto-select first form when list changes
	$effect(() => {
		if (formsList.length > 0 && !formsList.find((f) => f.id === selectedFormId)) {
			selectedFormId = formsList[0].id
		}
	})

	// Get selected form's data (lazy - only when this tab is active)
	let selectedForm = $derived(formsList.find((f) => f.id === selectedFormId))
	let formData = $derived(selectedForm ? selectedForm.getData() : null)
</script>

<div class="flex h-full flex-col">
	<!-- Form selector (only show if multiple forms) -->
	{#if formsList.length > 1}
		<div class="shrink-0 border-b bg-muted/30 p-3">
			<label class="mb-2 block text-xs font-medium text-muted-foreground">Select Form</label>
			<select
				class="w-full rounded border bg-background px-3 py-2 text-sm"
				bind:value={selectedFormId}>
				{#each formsList as form}
					<option value={form.id}>
						{form.label}
					</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Form data display -->
	<div class="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
		{#if formData}
			<!-- Status badges -->
			<div class="flex gap-2">
				<span
					class="rounded-full px-2 py-1 text-xs {formData.isValid
						? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
						: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
					{formData.isValid ? '✓ Valid' : '✗ Invalid'}
				</span>
				<span
					class="rounded-full px-2 py-1 text-xs {formData.isDirty
						? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
						: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}">
					{formData.isDirty ? '● Dirty' : '○ Pristine'}
				</span>
				{#if formData.inflight}
					<span class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
						⟳ Submitting
					</span>
				{/if}
			</div>

			<!-- Form values -->
			<div>
				<h3 class="mb-2 font-semibold">Values</h3>
				<pre class="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(formData.values, null, 2)}</pre>
			</div>

			<!-- Errors (only if present) -->
			{#if Object.keys(formData.errors).length > 0}
				<div>
					<h3 class="mb-2 font-semibold text-red-600 dark:text-red-400">Errors</h3>
					<pre class="overflow-x-auto rounded bg-red-50 p-2 text-xs dark:bg-red-950">{JSON.stringify(formData.errors, null, 2)}</pre>
				</div>
			{/if}

			<!-- Touched fields -->
			<div>
				<h3 class="mb-2 font-semibold">Touched Fields</h3>
				<div class="flex flex-wrap gap-2">
					{#each Object.entries(formData.touched).filter(([_, touched]) => touched) as [field]}
						<span class="rounded bg-muted px-2 py-1 text-xs font-mono">
							{field}
						</span>
					{:else}
						<span class="text-xs text-muted-foreground">No fields touched yet</span>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-muted-foreground">No form selected</div>
		{/if}
	</div>
</div>
