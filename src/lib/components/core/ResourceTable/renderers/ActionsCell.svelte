<script lang="ts" generics="T extends Record<string, any>">
	import { Button } from '$lib/components/ui/button'
	import type { Action, ActionHelpers } from '../types'

	type Props = {
		row: T
		actions: Action<T>[]
		buttonSize?: 'sm' | 'default' | 'lg'
		actionHelpers: ActionHelpers<T>
	}

	let { row, actions, buttonSize = 'sm', actionHelpers }: Props = $props()

	// Filter visible actions
	const visibleActions = $derived(actions.filter((action) => !action.visible || action.visible(row)))

	// Handle action click
	async function handleActionClick(action: Action<T>) {
		await action.onClick(row, actionHelpers)
	}
</script>

{#if visibleActions.length === 1}
	<!-- Single action: render as button -->
	{@const action = visibleActions[0]}
	<Button
		variant={action.variant || 'ghost'}
		size={buttonSize}
		disabled={action.disabled?.(row)}
		onclick={() => handleActionClick(action)}
		class="p-0 h-8 w-8"
	>
		{#if action.icon}
			{@const IconComponent = action.icon}
			<IconComponent class="h-4 w-4" />
		{/if}
		{#if action.label}
			<span class="sr-only">
				{typeof action.label === 'function' ? action.label(row) : action.label}
			</span>
		{/if}
	</Button>
{:else if visibleActions.length > 1}
	<!-- TODO: Multiple actions - implement dropdown menu when needed -->
	<div class="flex gap-1">
		{#each visibleActions as action}
			<Button
				variant={action.variant || 'ghost'}
				size={buttonSize}
				disabled={action.disabled?.(row)}
				onclick={() => handleActionClick(action)}
				class="p-0 h-8 w-8"
			>
				{#if action.icon}
					{@const IconComponent = action.icon}
					<IconComponent class="h-4 w-4" />
				{/if}
			</Button>
		{/each}
	</div>
{/if}
