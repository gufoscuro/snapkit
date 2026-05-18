<script lang="ts">
  import * as Chat from '../ui/chat'
  import type { AttachmentRef, ChatMessage } from '../types'
  import AttachmentChip from './AttachmentChip.svelte'
  import ChatTextBlock from './ChatTextBlock.svelte'
  import ChatToolBlock from './ChatToolBlock.svelte'

  let { message }: { message: ChatMessage } = $props()

  const variant = $derived(message.role === 'user' ? 'sent' : 'received')

  const visibleBlocks = $derived(message.content.filter(block => block.type !== 'tool_result'))

  const imageAttachments = $derived(
    (message.attachments ?? []).filter((a): a is Extract<AttachmentRef, { kind: 'image' }> => a.kind === 'image')
  )
</script>

<Chat.Bubble {variant}>
  <Chat.BubbleMessage class="py-2">
    <div class="flex flex-col gap-2">
      {#if imageAttachments.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each imageAttachments as att (att.name + att.size)}
            <img
              src="data:{att.mimeType};base64,{att.base64}"
              alt={att.name}
              class="max-h-48 max-w-full rounded border object-cover" />
          {/each}
        </div>
      {/if}

      {#if message.attachments && message.attachments.length > 0}
        <div class="flex flex-wrap gap-1.5">
          {#each message.attachments as att (att.name + att.size)}
            <AttachmentChip attachment={att} />
          {/each}
        </div>
      {/if}

      {#each visibleBlocks as block, index (index)}
        {#if block.type === 'text'}
          <ChatTextBlock {block} />
        {:else if block.type === 'tool_use'}
          <ChatToolBlock {block} />
        {/if}
      {/each}
    </div>
  </Chat.BubbleMessage>
</Chat.Bubble>
