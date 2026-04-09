<script lang="ts">
  import ActionButton from '$lib/components/core/ActionButton.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import IconSettings from '@tabler/icons-svelte/icons/settings'

  type Props = {
    originalHeader: string
    onclick: () => void
  }

  let { originalHeader, onclick }: Props = $props()
</script>

<div class="flex items-center justify-start">
  {#if originalHeader}
    <span class="flex-1">{originalHeader}</span>
  {/if}
  <ActionButton
    variant="ghost"
    size="icon"
    class="text-muted-foreground/60"
    tooltip={m.customize_columns()}
    tooltipSide="bottom"
    {onclick}>
    <IconSettings class="size-4" />
  </ActionButton>
</div>
