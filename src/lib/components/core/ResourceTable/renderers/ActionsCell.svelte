<script lang="ts" generics="T extends Record<string, any>">
  import ActionButton from '$lib/components/core/ActionButton.svelte'
  import type { Action, ActionHelpers } from '../types'

  type Props = {
    row: T
    actions: Action<T>[]
    buttonSize?: 'sm' | 'default' | 'lg'
    actionHelpers: ActionHelpers<T>
  }

  let { row, actions, buttonSize = 'sm', actionHelpers }: Props = $props()

  // Filter visible actions
  const visibleActions = $derived(actions.filter(action => !action.visible || action.visible(row)))

  // Handle action click
  async function handleActionClick(action: Action<T>) {
    await action.onClick(row, actionHelpers)
  }

  function getLabel(action: Action<T>, row: T): string | undefined {
    if (!action.label) return undefined
    return typeof action.label === 'function' ? action.label(row) : action.label
  }
</script>

{#if visibleActions.length === 1}
  {@const action = visibleActions[0]}
  <ActionButton
    tooltip={getLabel(action, row)}
    variant={action.variant || 'ghost'}
    size={buttonSize}
    disabled={action.disabled?.(row)}
    onclick={() => handleActionClick(action)}
    class="h-8 w-8 p-0">
    {#if action.icon}
      {@const IconComponent = action.icon}
      <IconComponent class="h-4 w-4" />
    {/if}
  </ActionButton>
{:else if visibleActions.length > 1}
  <div class="flex gap-1">
    {#each visibleActions as action, index (action.label || '' + index)}
      <ActionButton
        tooltip={getLabel(action, row)}
        variant={action.variant || 'ghost'}
        size={buttonSize}
        disabled={action.disabled?.(row)}
        onclick={() => handleActionClick(action)}
        class="h-8 w-8 p-0">
        {#if action.icon}
          {@const IconComponent = action.icon}
          <IconComponent class="h-4 w-4" />
        {/if}
      </ActionButton>
    {/each}
  </div>
{/if}
