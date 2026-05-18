<script lang="ts">
	import { Button } from '../ui/button'
	import { Checkbox } from '../ui/checkbox'
	import { Label } from '../ui/label'
	import CheckIcon from '@lucide/svelte/icons/check'
	import { getChatState } from '../chat-context'
	import type { ToolUseBlock } from '../types'

	type Option = {
		id: string
		label: string
		description?: string
	}

	let { block }: { block: ToolUseBlock } = $props()

	const chat = getChatState()

	const title = $derived(typeof block.input.title === 'string' ? block.input.title : null)
	const description = $derived(
		typeof block.input.description === 'string' ? block.input.description : null
	)
	const options = $derived.by<Option[]>(() => {
		const raw = Array.isArray(block.input.options)
			? (block.input.options as Array<Partial<Option>>)
			: []
		return raw.map((opt, i) => ({
			id: typeof opt.id === 'string' && opt.id ? opt.id : `opt_${i}`,
			label: typeof opt.label === 'string' ? opt.label : `Option ${i + 1}`,
			description: typeof opt.description === 'string' ? opt.description : undefined
		}))
	})
	const minSelect = $derived(
		typeof block.input.min_select === 'number' ? (block.input.min_select as number) : 0
	)
	const maxSelect = $derived(
		typeof block.input.max_select === 'number' ? (block.input.max_select as number) : Infinity
	)
	const submitLabel = $derived(
		typeof block.input.submit_label === 'string' ? block.input.submit_label : 'Submit'
	)

	const resolvedResult = $derived(chat.findToolResult(block.id))
	const isActive = $derived(
		chat.pendingInteractive?.toolUseId === block.id && !resolvedResult
	)
	const resolvedChoices = $derived.by<Option[]>(() => {
		if (isActive || !resolvedResult) return []
		try {
			const parsed = JSON.parse(resolvedResult.content) as { choices?: string[]; error?: string }
			if (parsed.error || !parsed.choices) return []
			return parsed.choices
				.map((id) => options.find((opt) => opt.id === id))
				.filter((opt): opt is Option => !!opt)
		} catch {
			return []
		}
	})
	const wasCancelled = $derived(!isActive && resolvedResult?.is_error === true)

	let selected = $state<Record<string, boolean>>({})

	const selectedIds = $derived(
		Object.entries(selected)
			.filter(([, checked]) => checked)
			.map(([id]) => id)
	)
	const canSubmit = $derived(
		selectedIds.length >= minSelect && selectedIds.length <= maxSelect
	)
	const countHint = $derived.by(() => {
		if (minSelect > 0 && maxSelect !== Infinity) {
			return minSelect === maxSelect
				? `Pick exactly ${minSelect}`
				: `Pick ${minSelect}–${maxSelect}`
		}
		if (minSelect > 0) return `Pick at least ${minSelect}`
		if (maxSelect !== Infinity) return `Pick at most ${maxSelect}`
		return null
	})

	function toggle(id: string, checked: boolean) {
		selected = { ...selected, [id]: checked }
	}

	function handleSubmit() {
		if (!isActive || !canSubmit) return
		chat.pendingInteractive?.submit(JSON.stringify({ choices: selectedIds }))
	}

	function handleCancel() {
		chat.pendingInteractive?.cancel()
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
		<div class="flex flex-col gap-2">
			{#each options as option (option.id)}
				<Label
					for="{block.id}_{option.id}"
					class="flex cursor-pointer items-start gap-2 rounded-md border p-2 hover:bg-muted"
				>
					<Checkbox
						id="{block.id}_{option.id}"
						checked={!!selected[option.id]}
						onCheckedChange={(checked) => toggle(option.id, checked === true)}
					/>
					<span class="flex flex-col">
						<span class="text-sm">{option.label}</span>
						{#if option.description}
							<span class="text-xs text-muted-foreground">{option.description}</span>
						{/if}
					</span>
				</Label>
			{/each}
		</div>

		<div class="mt-4 flex items-center justify-between gap-2">
			{#if countHint}
				<span class="text-xs text-muted-foreground">{countHint}</span>
			{:else}
				<span></span>
			{/if}
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" onclick={handleCancel}>Cancel</Button>
				<Button size="sm" onclick={handleSubmit} disabled={!canSubmit}>
					{submitLabel}
				</Button>
			</div>
		</div>
	{:else if wasCancelled}
		<div class="text-xs text-muted-foreground italic">Cancelled by user</div>
	{:else if resolvedChoices.length > 0}
		<div class="flex flex-col gap-1">
			{#each resolvedChoices as choice (choice.id)}
				<div class="flex items-center gap-2 text-sm">
					<CheckIcon class="size-4 text-primary" />
					<span>{choice.label}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-xs text-muted-foreground italic">(no selection)</div>
	{/if}
</div>
