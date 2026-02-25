<script lang="ts">
  import InfoIcon from '@lucide/svelte/icons/info'
  import Loader2Icon from '@lucide/svelte/icons/loader-2'
  import OctagonXIcon from '@lucide/svelte/icons/octagon-x'
  import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
  import CircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'

  import { mode } from 'mode-watcher'
  import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner'

  let { ...restProps }: SonnerProps = $props()
</script>

<Sonner
  theme={mode.current}
  class="toaster group"
  style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
  {...restProps}
  >{#snippet loadingIcon()}
    <Loader2Icon class="size-4 animate-spin" />
  {/snippet}
  {#snippet successIcon()}
    <CircleCheckFilled class="size-4 text-green-500" />
  {/snippet}
  {#snippet errorIcon()}
    <OctagonXIcon class="size-4 text-destructive" />
  {/snippet}
  {#snippet infoIcon()}
    <InfoIcon class="size-4" />
  {/snippet}
  {#snippet warningIcon()}
    <TriangleAlertIcon class="size-4" />
  {/snippet}
</Sonner>
