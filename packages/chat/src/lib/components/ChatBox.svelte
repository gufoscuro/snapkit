<script lang="ts">
  import * as Chat from '../ui/chat'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import { onDestroy, type Snippet } from 'svelte'
  import { createAttachmentDraftState, setAttachmentDraftState } from '../attachment-draft.svelte'
  import { setChatState } from '../chat-context'
  import { createChatState, type ChatState } from '../chat-state.svelte'
  import type { ChatContext, ChatMessage } from '../types'
  import ChatAgentTurn from './ChatAgentTurn.svelte'
  import ChatInput from './ChatInput.svelte'
  import ChatMessageBubble from './ChatMessageBubble.svelte'

  type RenderGroup =
    | { kind: 'user'; key: string; message: ChatMessage }
    | { kind: 'agent'; key: string; messages: ChatMessage[]; pending: boolean }

  type Props = {
    context?: ChatContext
    chatState?: ChatState
    wrapped?: boolean
    empty?: Snippet
  }

  let { context, chatState, empty, wrapped = true }: Props = $props()

  // svelte-ignore state_referenced_locally
  const chat = chatState ?? createChatState(() => context!)
  // svelte-ignore state_referenced_locally
  const ownsState = !chatState

  // svelte-ignore state_referenced_locally
  if (!context && !chatState) {
    throw new Error('<ChatBox> requires either a `context` or a `chatState` prop.')
  }

  // Un-comment this to log all chat state changes (messages, status, etc.) to the console for debugging
  // $inspect('chat', JSON.stringify(chat, null, 2))

  setChatState(chat)

  const attachmentDraft = createAttachmentDraftState(() => context?.attachments)
  setAttachmentDraftState(attachmentDraft)

  onDestroy(() => {
    if (ownsState) chat.cleanup()
  })

  const visibleMessages = $derived(chat.messages.filter(msg => msg.content.some(block => block.type !== 'tool_result')))

  // Group consecutive assistant messages into a single agent "turn" so their
  // timeline rail stays continuous across tool calls. The in-progress spinner
  // attaches to the trailing agent turn (or starts a fresh one).
  const renderGroups = $derived.by<RenderGroup[]>(() => {
    const groups: RenderGroup[] = []
    for (const message of visibleMessages) {
      if (message.role === 'user') {
        groups.push({ kind: 'user', key: message.id, message })
      } else {
        const last = groups.at(-1)
        if (last?.kind === 'agent') last.messages.push(message)
        else groups.push({ kind: 'agent', key: message.id, messages: [message], pending: false })
      }
    }

    if (chat.status === 'sending' || chat.status === 'executing_tools') {
      const last = groups.at(-1)
      if (last?.kind === 'agent') last.pending = true
      else groups.push({ kind: 'agent', key: '__pending__', messages: [], pending: true })
    }

    return groups
  })

  let dragDepth = $state(0)
  const isDraggingFiles = $derived(dragDepth > 0)

  function dragHasFiles(e: DragEvent): boolean {
    const types = e.dataTransfer?.types
    if (!types) return false
    for (let i = 0; i < types.length; i++) {
      if (types[i] === 'Files') return true
    }
    return false
  }

  function handleDragEnter(e: DragEvent) {
    if (!dragHasFiles(e)) return
    dragDepth += 1
  }

  function handleDragLeave() {
    if (dragDepth > 0) dragDepth -= 1
  }

  function handleDragOver(e: DragEvent) {
    if (!dragHasFiles(e)) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: DragEvent) {
    if (!dragHasFiles(e)) return
    e.preventDefault()
    dragDepth = 0
    const files = e.dataTransfer?.files
    if (files && files.length > 0) void attachmentDraft.addFiles(files)
  }
</script>

<div
  class="relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card"
  class:border={wrapped}
  class:rounded-lg={wrapped}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="region"
  aria-label="Chat">
  <div class="min-h-0 flex-1 overflow-hidden">
    {#if visibleMessages.length === 0 && empty}
      {@render empty()}
    {:else}
      <Chat.List>
        {#each renderGroups as group (group.key)}
          {#if group.kind === 'user'}
            <ChatMessageBubble message={group.message} />
          {:else}
            <ChatAgentTurn messages={group.messages} pending={group.pending} />
          {/if}
        {/each}
      </Chat.List>
    {/if}
  </div>

  {#if chat.errorMessage}
    <div class="px-4">
      <div
        class="rounded-t-md border-x border-t border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
        {chat.errorMessage}
      </div>
    </div>
  {/if}

  <ChatInput autofocus />

  {#if isDraggingFiles}
    <div
      class="pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
      <UploadIcon class="size-10 text-foreground" />
      <div class="text-sm font-medium text-foreground">Drop files to attach</div>
    </div>
  {/if}
</div>
