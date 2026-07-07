<script lang="ts">
  import { cn } from '../../utils.js'
  import LoadingDots from './loading-dots.svelte'
  import type { ChatBubbleMessageProps } from './types'

  let { ref = $bindable(null), typing = false, class: className, children, ...rest }: ChatBubbleMessageProps = $props()
</script>

<div
  {...rest}
  bind:this={ref}
  class={cn(
    "order-2 rounded-lg border border-border/70 bg-secondary px-4 py-1.5 text-sm text-secondary-foreground group-data-[variant='received']/chat-bubble:rounded-bl-none group-data-[variant='sent']/chat-bubble:order-1 group-data-[variant='sent']/chat-bubble:rounded-br-none",
    className,
  )}>
  {#if typing}
    <div class="flex size-full place-items-center justify-center">
      <LoadingDots />
    </div>
  {:else}
    {@render children?.()}
  {/if}
</div>
