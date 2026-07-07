<script lang="ts">
  import { Button } from '../ui/button/index.js'
  import { IconTool } from '@tabler/icons-svelte'
  import type { ToolUseBlock } from '../types'
  import ChatActionLinksBlock from './ChatActionLinksBlock.svelte'
  import ChatStructuredDataBlock from './ChatStructuredDataBlock.svelte'
  import ChatUserChoice from './ChatUserChoice.svelte'
  import ChatUserInputForm from './ChatUserInputForm.svelte'
  import ChatUserMultiChoice from './ChatUserMultiChoice.svelte'

  let { block }: { block: ToolUseBlock } = $props()

  let showTool = $state<boolean>(false)
</script>

{#if block.name === 'show_structured_data'}
  <ChatStructuredDataBlock {block} />
{:else if block.name === 'show_action_links'}
  <ChatActionLinksBlock {block} />
{:else if block.name === 'request_user_input'}
  <ChatUserInputForm {block} />
{:else if block.name === 'request_user_choice'}
  <ChatUserChoice {block} />
{:else if block.name === 'request_user_multichoice'}
  <ChatUserMultiChoice {block} />
{:else}
  <div class="flex flex-col items-start gap-2">
    <Button
      size="sm"
      variant="ghost"
      class="cursor-pointer px-0 text-muted-foreground"
      onclick={() => (showTool = !showTool)}>
      <IconTool class="size-3" />
      <div class="text-xs font-medium">Tool: {block.name}</div>
    </Button>

    {#if Object.keys(block.input).length > 0}
      {#if showTool}
        <div
          class="max-w-full overflow-x-auto rounded-md border border-dashed bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          <pre class="mt-1 text-[11px] leading-snug"><code>{JSON.stringify(block.input, null, 2)}</code></pre>
        </div>
      {/if}
    {/if}
  </div>
{/if}
