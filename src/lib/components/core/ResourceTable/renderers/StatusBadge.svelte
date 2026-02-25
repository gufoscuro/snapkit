<script lang="ts">
  import Spinner from '$components/ui/spinner/spinner.svelte'
  import { Badge } from '$lib/components/ui/badge'
  import CircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'
  import ClockPause from '@tabler/icons-svelte/icons/clock-pause'
  import Forbid2Filled from '@tabler/icons-svelte/icons/forbid-2-filled'
  import Loader from '@tabler/icons-svelte/icons/loader'

  export type StatusVariant = 'active' | 'in-progress' | 'loading' | 'paused' | 'blocked' | 'neutral'

  let { variant, label }: { variant: StatusVariant; label: string } = $props()
</script>

<Badge variant="outline" class="px-1.5 text-muted-foreground">
  {#if variant === 'active'}
    <CircleCheckFilled class="size-3.5 fill-green-500 dark:fill-green-400" />
  {:else if variant === 'in-progress'}
    <Loader class="size-3.5" />
  {:else if variant === 'loading'}
    <Spinner class="size-3.5" />
  {:else if variant === 'paused'}
    <ClockPause class="size-3.5" />
  {:else if variant === 'blocked'}
    <Forbid2Filled class="size-3.5 fill-red-500 dark:fill-red-400" />
  {/if}
  {label}
</Badge>
