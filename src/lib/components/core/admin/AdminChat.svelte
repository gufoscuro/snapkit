<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import * as Chat from '$lib/components/ui/chat'
  import { Input } from '$lib/components/ui/input'
  import * as m from '$lib/paraglide/messages'
  import { getLocale } from '$lib/paraglide/runtime'
  import { cn } from '$lib/utils.js'
  import { renderMarkdown } from '$utils/markdown'
  import { apiRequest } from '$utils/request'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getUserInitials } from '$utils/strings'
  import SendIcon from '@lucide/svelte/icons/send'
  import Sparkles from '@tabler/icons-svelte/icons/sparkles'
  import { getContext, tick, untrack } from 'svelte'

  type AdminChatProps = {
    onAgentMessage?: (message: string) => void
  }

  const { onAgentMessage }: AdminChatProps = $props()

  const currentLocale = getLocale()
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps?.())
  const legalEntityId = $derived(snippetProps.legalEntity?.id)
  const user = $derived(snippetProps.user)

  type ChatResponse = {
    message: string
    conversation_id: string
  }

  type Message = {
    senderId: string
    message: string
    sentAt: string
    isError?: boolean
  }

  const ASSISTANT_ID = 'moddo-assistant'

  const formatShortTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  let inputRef = $state<HTMLInputElement | null>(null)
  let conversationId = $state<string | null>(null)
  let message = $state('')
  let loading = $state(false)
  const messages = $state<Message[]>([])

  async function fetchSplashMessage(entityId: string) {
    loading = true
    try {
      const response = await apiRequest<ChatResponse>({
        url: `/legal-entities/${entityId}/config/chat`,
        method: 'POST',
        data: { message: currentLocale === 'it' ? 'Ciao' : 'Hi' },
      })

      conversationId = response.conversation_id

      messages.push({
        senderId: ASSISTANT_ID,
        message: response.message,
        sentAt: formatShortTime(new Date()),
      })
    } catch {
      messages.push({
        senderId: ASSISTANT_ID,
        message: m.chat_error(),
        sentAt: formatShortTime(new Date()),
        isError: true,
      })
    } finally {
      loading = false
    }
  }

  // Reset conversation and fetch splash when legal entity changes
  $effect(() => {
    const entityId = legalEntityId
    if (!entityId) return

    untrack(() => {
      messages.length = 0
      conversationId = null
      fetchSplashMessage(entityId)
    })
  })

  async function sendMessage() {
    if (!message.trim() || loading || !legalEntityId) return

    const userMessage = message.trim()
    message = ''

    messages.push({
      senderId: user?.id || 'current-user',
      message: userMessage,
      sentAt: formatShortTime(new Date()),
    })

    loading = true

    try {
      const response = await apiRequest<ChatResponse>({
        url: `/legal-entities/${legalEntityId}/config/chat`,
        method: 'POST',
        data: {
          message: userMessage,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        },
      })

      conversationId = response.conversation_id

      messages.push({
        senderId: ASSISTANT_ID,
        message: response.message,
        sentAt: formatShortTime(new Date()),
      })

      onAgentMessage?.(response.message)
    } catch {
      messages.push({
        senderId: ASSISTANT_ID,
        message: m.chat_error(),
        sentAt: formatShortTime(new Date()),
        isError: true,
      })
    } finally {
      loading = false
      await tick()
      inputRef?.focus()
    }
  }
</script>

<div class="flex h-full w-full flex-col">
  <div class="flex shrink-0 place-items-center justify-between border-b bg-background p-2">
    <div class="flex place-items-center gap-2">
      <Avatar.Root>
        <Avatar.Fallback>
          <Sparkles class="size-5 text-brand" />
        </Avatar.Fallback>
      </Avatar.Root>

      <div class="flex flex-col">
        <span class="text-sm font-medium">
          Moddo
          <span class="text-brand">Assistant</span>
        </span>
      </div>
    </div>
  </div>

  <Chat.List class="flex-1 overflow-y-auto">
    {#each messages as msg (msg)}
      <Chat.Bubble variant={msg.senderId === ASSISTANT_ID ? 'received' : 'sent'}>
        <Chat.BubbleAvatar>
          <Chat.BubbleAvatarFallback>
            {#if msg.senderId === ASSISTANT_ID}
              <Sparkles class="size-5 text-muted-foreground" />
            {:else}
              {getUserInitials(user?.name || 'U')}
            {/if}
          </Chat.BubbleAvatarFallback>
        </Chat.BubbleAvatar>
        <Chat.BubbleMessage
          class={cn('flex flex-col gap-1', msg.isError && 'border border-destructive/30 bg-destructive/10')}>
          <div class="chat-markdown prose prose-sm max-w-none dark:prose-invert">
            {#if msg.senderId === ASSISTANT_ID}
              {@html renderMarkdown(msg.message)}
            {:else}
              <p>{msg.message}</p>
            {/if}
          </div>
          <div class="w-full text-xs group-data-[variant='sent']/chat-bubble:text-end">
            {msg.sentAt}
          </div>
        </Chat.BubbleMessage>
      </Chat.Bubble>
    {/each}

    {#if loading}
      <Chat.Bubble variant="received">
        <Chat.BubbleAvatar>
          <Chat.BubbleAvatarFallback>
            <Sparkles class="size-5 text-muted-foreground" />
          </Chat.BubbleAvatarFallback>
        </Chat.BubbleAvatar>
        <Chat.BubbleMessage typing />
      </Chat.Bubble>
    {/if}
  </Chat.List>

  <form
    onsubmit={e => {
      e.preventDefault()
      sendMessage()
    }}
    class="flex h-breadcrumbs place-items-center gap-2 p-2">
    <Input
      bind:ref={inputRef}
      bind:value={message}
      class="rounded-full"
      placeholder={m.chat_placeholder()}
      disabled={loading} />
    <Button
      type="submit"
      variant="default"
      size="icon"
      class="shrink-0 rounded-full"
      disabled={message.trim() === '' || loading}>
      <SendIcon />
    </Button>
  </form>
</div>

<style>
  :global(.chat-markdown > :first-child) {
    margin-top: 0;
  }
  :global(.chat-markdown > :last-child) {
    margin-bottom: 0;
  }
  :global(.chat-markdown table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.5em 0;
    font-size: 0.85em;
  }
  :global(.chat-markdown th) {
    text-align: left;
    font-weight: 600;
    padding: 0.35em 0.75em;
    border-bottom: 2px solid var(--border);
  }
  :global(.chat-markdown td) {
    padding: 0.35em 0.75em;
    border-bottom: 1px solid var(--border);
  }
  :global(.chat-markdown tr:last-child td) {
    border-bottom: none;
  }
  :global(.chat-markdown tbody tr:nth-child(even)) {
    background: color-mix(in oklch, var(--muted), transparent 50%);
  }
</style>
