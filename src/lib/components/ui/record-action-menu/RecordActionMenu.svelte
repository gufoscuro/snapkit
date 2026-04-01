<!--
  @component RecordActionMenu
  @description Dropdown menu for record actions. Renders a configurable trigger button
  with a list of actions that can optionally require confirmation.
  Actions are pure functions, reusable outside this component via executeRecordAction.
  @keywords actions, dropdown, menu, record, confirmation
  @uses DropdownMenu, Button, executeRecordAction
-->
<script lang="ts" generics="T extends RecordActionRequestOptions">
  import ActionButton from '$components/core/ActionButton.svelte'
  import { type ButtonVariant } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages.js'
  import { executeRecordAction, type RecordAction, type RecordActionRequestOptions } from '$lib/utils/record-actions'
  import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical'
  import type { Component, Snippet } from 'svelte'

  type Props = {
    /** The actions to display in the menu */
    actions: RecordAction<T>[]
    /** Options passed to each action's onAction callback */
    actionOptions: T
    /** Button label */
    label?: string
    /** Dropdown content alignment */
    align?: 'start' | 'end'
    /** Trigger button size */
    size?: 'sm' | 'default' | 'lg' | 'icon'
    /** Trigger button variant */
    buttonVariant?: ButtonVariant
    /** Custom snippet for trigger icon */
    triggerIcon?: Snippet
    /** Additional CSS class for the trigger button */
    class?: string
  }

  let {
    actions,
    actionOptions,
    align = 'end',
    size = 'icon',
    buttonVariant = 'ghost',
    label = m.quick_actions(),
    triggerIcon,
    class: className,
  }: Props = $props()

  const visibleActions = $derived(actions.filter(a => !a.visible || a.visible(actionOptions)))

  function resolveLabel(action: RecordAction<T>): string {
    return typeof action.label === 'function' ? action.label(actionOptions) : action.label
  }

  function resolveIcon(action: RecordAction<T>): Component<Record<string, any>> | undefined {
    if (action.resolveIcon) return action.resolveIcon(actionOptions)
    return action.icon
  }

  async function handleAction(action: RecordAction<T>) {
    await executeRecordAction(action, actionOptions)
  }
</script>

{#if visibleActions.length > 0}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <ActionButton variant={buttonVariant} tooltip={label} {size} class={className} {...props}>
          {#if triggerIcon}
            {@render triggerIcon()}
          {:else}
            <EllipsisVerticalIcon class="h-4 w-4" />
          {/if}
          <span class="sr-only">{m.common_actions()}</span>
        </ActionButton>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="min-w-44" {align}>
      <DropdownMenu.Label>{m.quick_actions()}</DropdownMenu.Label>
      <DropdownMenu.Separator />
      {#each visibleActions as action (action.id)}
        {@const icon = resolveIcon(action)}
        <DropdownMenu.Item disabled={action.disabled?.(actionOptions) ?? false} onclick={() => handleAction(action)}>
          {#if icon}
            {@const Icon = icon}
            <Icon class="mr-2 h-4 w-4" />
          {/if}
          {resolveLabel(action)}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
