<script lang="ts">
  import { IconLoader2 } from '@tabler/icons-svelte'
  import type { ChatMessage } from '../types'
  import ChatTextBlock from './ChatTextBlock.svelte'
  import ChatToolBlock from './ChatToolBlock.svelte'

  // A single agent "turn" = one or more consecutive assistant messages (the
  // tool_result messages in between are filtered out upstream). They share one
  // continuous timeline rail so the line never breaks across tool calls.
  let { messages, pending = false }: { messages: ChatMessage[]; pending?: boolean } = $props()

  const blocks = $derived(
    messages.flatMap(message => message.content.filter(block => block.type !== 'tool_result')),
  )
</script>

<div class="flex w-full flex-col">
  {#each blocks as block, index (index)}
    <div class="group/step relative flex gap-3">
      <!-- rail column: connecting line + dot -->
      <div class="relative flex w-3 flex-none justify-center pt-2">
        <span class="absolute top-5.5 bottom-0 w-px bg-border/70 group-last/step:hidden" aria-hidden="true"></span>
        <span
          class="relative z-10 mt-0 size-1.5 rounded-full bg-muted-foreground/40 ring-4 ring-background"
          aria-hidden="true"></span>
      </div>

      <!-- step content -->
      <div class="min-w-0 flex-1 pb-4">
        {#if block.type === 'text'}
          <ChatTextBlock {block} />
        {:else if block.type === 'tool_use'}
          <ChatToolBlock {block} />
        {/if}
      </div>
    </div>
  {/each}

  {#if pending}
    <!-- in-progress step: a spinner orbiting the rail dot, GitHub Actions style -->
    <div class="group/step relative flex gap-3">
      <div class="relative flex w-3 flex-none justify-center pt-2">
        <span class="relative z-10 mt-0 flex size-1.5 items-center justify-center">
          <span class="size-1.5 rounded-full bg-muted-foreground/60" aria-hidden="true"></span>
          <IconLoader2
            class="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted-foreground/50"
            aria-hidden="true" />
        </span>
      </div>
      <div class="min-w-0 flex-1 pb-4"></div>
    </div>
  {/if}
</div>
