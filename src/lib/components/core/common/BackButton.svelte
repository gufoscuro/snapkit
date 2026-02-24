<script lang="ts">
  import { goto } from '$app/navigation'
  import { Button, type ButtonVariant } from '$lib/components/ui/button/index.js'
  import { hasPrevious, popUrl } from '$lib/contexts/navigation-history.svelte'
  import * as m from '$lib/paraglide/messages'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'

  interface Props {
    variant?: ButtonVariant
    fallback?: string
    label?: string
  }

  let { variant = 'outline', fallback, label = m.back() }: Props = $props()

  const canGoBack = $derived(hasPrevious() || !!fallback)

  function handleBack() {
    const prev = popUrl()
    if (prev) goto(prev)
    else if (fallback) goto(fallback)
  }
</script>

{#if canGoBack}
  <Button {variant} size="sm" onclick={handleBack}>
    <ArrowLeft />
    {label}
  </Button>
{/if}
