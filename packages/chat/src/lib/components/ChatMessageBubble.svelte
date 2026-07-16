<script lang="ts">
  import type { AttachmentRef, ChatMessage } from '../types'
  import * as Chat from '../ui/chat'
  import AttachmentChip from './AttachmentChip.svelte'
  import ChatTextBlock from './ChatTextBlock.svelte'
  import ChatToolBlock from './ChatToolBlock.svelte'

  // User messages only — the agent's turn is rendered as a timeline rail by
  // <ChatAgentTurn>. <ChatBox> routes by role.
  let { message }: { message: ChatMessage } = $props()

  const visibleBlocks = $derived(message.content.filter(block => block.type !== 'tool_result'))

  const imageAttachments = $derived(
    (message.attachments ?? []).filter((a): a is Extract<AttachmentRef, { kind: 'image' }> => a.kind === 'image'),
  )
</script>

<Chat.Bubble variant="sent">
  <Chat.BubbleMessage class="">
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
