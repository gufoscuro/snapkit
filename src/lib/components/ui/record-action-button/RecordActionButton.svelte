<!--
  @component RecordActionButton
  @description Standalone button for a single record action. Uses the same action definition
  as RecordActionMenu but renders as a button instead of a dropdown item.
  Respects visible() and disabled() from the action definition.
  @keywords action, button, record, confirmation
  @uses Button, executeRecordAction
-->
<script lang="ts" generics="T extends RecordActionRequestOptions">
  import Button from '$lib/components/ui/button/button.svelte'
  import { type ButtonVariant } from '$lib/components/ui/button'
  import { executeRecordAction, type RecordAction, type RecordActionRequestOptions } from '$lib/utils/record-actions'
  import type { Snippet } from 'svelte'

  type Props = {
    /** The action to execute */
    action: RecordAction<T>
    /** Options passed to the action's callbacks */
    actionOptions: T
    /** Button variant */
    variant?: ButtonVariant
    /** Button size */
    size?: 'sm' | 'default' | 'lg' | 'icon'
    /** Additional CSS class */
    class?: string
    /** Custom button content (overrides label) */
    children?: Snippet
  }

  let {
    action,
    actionOptions,
    variant = 'default',
    size = 'default',
    class: className = '',
    children,
  }: Props = $props()

  const isVisible = $derived(!action.visible || action.visible(actionOptions))
  const isDisabled = $derived(action.disabled?.(actionOptions) ?? false)

  function resolveLabel(): string {
    return typeof action.label === 'function' ? action.label(actionOptions) : action.label
  }

  async function handleClick() {
    await executeRecordAction(action, actionOptions)
  }
</script>

{#if isVisible}
  <Button {variant} {size} class={className} disabled={isDisabled} onclick={handleClick}>
    {#if children}
      {@render children()}
    {:else}
      {resolveLabel()}
    {/if}
  </Button>
{/if}
