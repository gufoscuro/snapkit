<script lang="ts">
	import { Button } from '../ui/button'
	import { Checkbox } from '../ui/checkbox'
	import { Input } from '../ui/input'
	import { Label } from '../ui/label'
	import { Textarea } from '../ui/textarea'
	import CheckIcon from '@lucide/svelte/icons/check'
	import { getChatState } from '../chat-context'
	import {
		buildInitialValues,
		buildSubmitValues,
		parseInputSchema,
		validateFields,
		type SchemaField
	} from '../internal/json-schema-fields'
	import type { ToolUseBlock } from '../types'

	let { block }: { block: ToolUseBlock } = $props()

	const chat = getChatState()

	const title = $derived(typeof block.input.title === 'string' ? block.input.title : null)
	const description = $derived(
		typeof block.input.description === 'string' ? block.input.description : null
	)
	const submitLabel = $derived(
		typeof block.input.submit_label === 'string' ? block.input.submit_label : 'Submit'
	)
	const rawSchema = $derived(
		block.input.schema && typeof block.input.schema === 'object'
			? (block.input.schema as Record<string, unknown>)
			: { type: 'object', properties: {} }
	)

	const fields = $derived<SchemaField[]>(parseInputSchema(rawSchema))

	const resolvedResult = $derived(chat.findToolResult(block.id))
	const isActive = $derived(
		chat.pendingInteractive?.toolUseId === block.id && !resolvedResult
	)
	const wasCancelled = $derived(!isActive && resolvedResult?.is_error === true)

	const resolvedValues = $derived.by<Record<string, unknown> | null>(() => {
		if (isActive || !resolvedResult || resolvedResult.is_error) return null
		try {
			return JSON.parse(resolvedResult.content) as Record<string, unknown>
		} catch {
			return null
		}
	})

	let values = $state<Record<string, unknown>>({})
	let errors = $state<Record<string, string>>({})
	let touched = $state<Record<string, boolean>>({})

	$effect(() => {
		if (isActive && Object.keys(values).length === 0) {
			values = buildInitialValues(fields)
		}
	})

	function setField(name: string, value: unknown) {
		values = { ...values, [name]: value }
		if (touched[name]) {
			errors = validateFields(values, fields)
		}
	}

	function handleSubmit() {
		if (!isActive) return
		const nextErrors = validateFields(values, fields)
		errors = nextErrors
		touched = Object.fromEntries(fields.map((f) => [f.name, true]))
		if (Object.keys(nextErrors).length > 0) return

		const submitValues = buildSubmitValues(values, fields)
		chat.pendingInteractive?.submit(JSON.stringify(submitValues))
	}

	function handleCancel() {
		chat.pendingInteractive?.cancel()
	}

	function formatResolvedValue(value: unknown): string {
		if (value === undefined || value === null) return '—'
		if (typeof value === 'object') return JSON.stringify(value)
		return String(value)
	}
</script>

<div class="w-full rounded-md border bg-background p-4">
	{#if title}
		<div class="mb-1 text-sm font-medium">{title}</div>
	{/if}
	{#if description}
		<div class="mb-3 text-xs text-muted-foreground">{description}</div>
	{/if}

	{#if isActive}
		{#if fields.length === 0}
			<div class="mb-3 text-xs italic text-muted-foreground">
				Schema has no `properties` — nothing to fill in.
			</div>
		{/if}

		<div class="flex flex-col gap-3">
			{#each fields as field (field.name)}
				{@const error = errors[field.name]}
				<div class="flex flex-col gap-1">
					{#if field.type === 'boolean'}
						<Label
							for="{block.id}_{field.name}"
							class="flex cursor-pointer items-start gap-2"
						>
							<Checkbox
								id="{block.id}_{field.name}"
								checked={values[field.name] === true}
								onCheckedChange={(checked) => setField(field.name, checked === true)}
							/>
							<span class="flex flex-col">
								<span class="text-sm">
									{field.label}
									{#if field.required}
										<span class="text-destructive">*</span>
									{/if}
								</span>
								{#if field.description}
									<span class="text-xs text-muted-foreground">{field.description}</span>
								{/if}
							</span>
						</Label>
					{:else}
						<Label for="{block.id}_{field.name}" class="text-xs">
							{field.label}
							{#if field.required}
								<span class="text-destructive">*</span>
							{/if}
						</Label>
						{#if field.description}
							<span class="text-[11px] text-muted-foreground">{field.description}</span>
						{/if}
						{#if field.type === 'json'}
							<Textarea
								id="{block.id}_{field.name}"
								rows={4}
								placeholder="JSON value"
								value={(values[field.name] as string) ?? ''}
								oninput={(event) => setField(field.name, event.currentTarget.value)}
								onblur={() => {
									touched = { ...touched, [field.name]: true }
									errors = validateFields(values, fields)
								}}
								aria-invalid={!!error}
								class="font-mono text-xs"
							/>
						{:else}
							<Input
								id="{block.id}_{field.name}"
								type={field.type === 'number' ? 'number' : 'text'}
								value={(values[field.name] as string | number) ?? ''}
								oninput={(event) => setField(field.name, event.currentTarget.value)}
								onblur={() => {
									touched = { ...touched, [field.name]: true }
									errors = validateFields(values, fields)
								}}
								aria-invalid={!!error}
							/>
						{/if}
					{/if}
					{#if error}
						<span class="text-xs text-destructive">{error}</span>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-4 flex items-center justify-end gap-2">
			<Button variant="ghost" size="sm" onclick={handleCancel}>Cancel</Button>
			<Button size="sm" onclick={handleSubmit}>
				{submitLabel}
			</Button>
		</div>
	{:else if wasCancelled}
		<div class="text-xs italic text-muted-foreground">Cancelled by user</div>
	{:else if resolvedValues}
		<dl class="flex flex-col gap-1.5 text-sm">
			{#each fields as field (field.name)}
				<div class="flex items-start gap-2">
					<CheckIcon class="mt-0.5 size-3.5 shrink-0 text-primary" />
					<div class="flex flex-col">
						<dt class="text-xs text-muted-foreground">{field.label}</dt>
						<dd class="font-mono text-xs">{formatResolvedValue(resolvedValues[field.name])}</dd>
					</div>
				</div>
			{/each}
		</dl>
	{:else}
		<div class="text-xs italic text-muted-foreground">(no submission)</div>
	{/if}
</div>
