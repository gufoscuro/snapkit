<script lang="ts">
	import { Button } from '../ui/button'
	import { Label } from '../ui/label'
	import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
	import CheckIcon from '@lucide/svelte/icons/check'
	import { getChatState } from '../chat-context'
	import type { ToolUseBlock } from '../types'

	type Option = {
		id: string
		label: string
		description?: string
		icon?: string
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
			description: typeof opt.description === 'string' ? opt.description : undefined,
			icon: typeof opt.icon === 'string' ? opt.icon : undefined
		}))
	})
	const layout = $derived(block.input.layout === 'cards' ? 'cards' : 'radio')
	const submitLabel = $derived(
		typeof block.input.submit_label === 'string' ? block.input.submit_label : 'Submit'
	)

	const resolvedResult = $derived(chat.findToolResult(block.id))
	const isActive = $derived(
		chat.pendingInteractive?.toolUseId === block.id && !resolvedResult
	)
	const resolvedChoice = $derived.by<Option | null>(() => {
		if (isActive || !resolvedResult) return null
		try {
			const parsed = JSON.parse(resolvedResult.content) as { choice?: string; error?: string }
			if (parsed.error) return null
			const match = options.find((opt) => opt.id === parsed.choice)
			return match ?? null
		} catch {
			return null
		}
	})
	const wasCancelled = $derived(!isActive && resolvedResult?.is_error === true)

	let selected = $state<string>('')

	function handleSubmit() {
		if (!isActive || !selected) return
		chat.pendingInteractive?.submit(JSON.stringify({ choice: selected }))
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
		<RadioGroup bind:value={selected} class={layout === 'cards' ? 'gap-2' : undefined}>
			{#each options as option (option.id)}
				<Label
					for="{block.id}_{option.id}"
					class={layout === 'cards'
						? 'flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted'
						: 'flex cursor-pointer items-center gap-2'}
				>
					<RadioGroupItem value={option.id} id="{block.id}_{option.id}" />
					<span class="flex flex-col">
						<span class="text-sm">{option.label}</span>
						{#if option.description}
							<span class="text-xs text-muted-foreground">{option.description}</span>
						{/if}
					</span>
				</Label>
			{/each}
		</RadioGroup>

		<div class="mt-4 flex items-center justify-end gap-2">
			<Button variant="ghost" size="sm" onclick={handleCancel}>Cancel</Button>
			<Button size="sm" onclick={handleSubmit} disabled={!selected}>
				{submitLabel}
			</Button>
		</div>
	{:else if wasCancelled}
		<div class="text-xs text-muted-foreground italic">Cancelled by user</div>
	{:else if resolvedChoice}
		<div class="flex items-center gap-2 text-sm">
			<CheckIcon class="size-4 text-primary" />
			<span class="font-medium">{resolvedChoice.label}</span>
		</div>
	{:else}
		<div class="text-xs text-muted-foreground italic">(no selection)</div>
	{/if}
</div>
