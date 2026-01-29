<!--
  @component BusyButton
  @description Button that integrates with FormUtil context for loading states.
  Shows spinner only when clicked while form is inflight or manually busy.
-->
<script lang="ts">
  import { getFormContextOptional } from '$components/core/form/form-context'
  import { Button, type ButtonProps } from '$components/ui/button'
  import { Spinner } from '$components/ui/spinner'
  import * as m from '$lib/paraglide/messages'
  import type { Snippet } from 'svelte'

  type Props = Omit<ButtonProps, 'loading' | 'children'> & {
    busy?: boolean
    busyLabel?: string
    children: Snippet
  }

  let {
    busy = false,
    busyLabel = m.common_loading(),
    disabled = false,
    onclick,
    children,
    ...restProps
  }: Props = $props()

  const form = getFormContextOptional()

  // Track if this specific button was clicked
  let activated = $state(false)

  // Combined busy state: manual prop OR form inflight
  const isBusy = $derived(busy || (form?.inflight ?? false))

  // Show spinner only if this button was activated AND is busy
  const showSpinner = $derived(activated && isBusy)

  // Disabled if prop disabled OR any busy state
  const isDisabled = $derived(disabled || isBusy)

  // Reset activated state when busy ends
  $effect(() => {
    if (!isBusy && activated) {
      // Small delay to allow spinner exit animation
      const timer = setTimeout(() => {
        activated = false
      }, 300)
      return () => clearTimeout(timer)
    }
  })

  function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    activated = true
    onclick?.(e)
  }
</script>

<Button {...restProps} disabled={isDisabled} onclick={handleClick}>
  {#if showSpinner}
    <Spinner />
    {#if busyLabel}
      <span>{busyLabel}</span>
    {/if}
  {:else}
    {@render children()}
  {/if}
</Button>
