<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import IconCircleX from '@tabler/icons-svelte/icons/circle-x'

  export type StateIndicatorVariant = 'default' | 'success' | 'error'

  let { variant, label, compact = true }: { variant: StateIndicatorVariant; label: string; compact: boolean } = $props()
</script>

{#snippet icon()}
  {#if variant === 'success'}
    <IconCircleCheck class="size-4 text-green-500 dark:text-green-400" />
  {:else if variant === 'error'}
    <IconCircleX class="size-4 text-red-500 dark:text-red-400" />
  {:else}
    <IconCircleDashed class="size-4 text-muted-foreground" />
  {/if}
{/snippet}

{#if compact}
  <div class="flex w-8 items-center justify-center">
    <Tooltip.Root>
      <Tooltip.Trigger class="flex items-center justify-center">
        {@render icon()}
      </Tooltip.Trigger>
      <Tooltip.Content>
        {label}
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
{:else}
  <Badge variant="outline" class="px-1.5 text-muted-foreground">
    {@render icon()}
    {label}
  </Badge>
{/if}
