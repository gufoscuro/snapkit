<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Chat from '$lib/components/ui/chat'
  import * as EmojiPicker from '$lib/components/ui/emoji-picker'
  import { Input } from '$lib/components/ui/input'
  import * as Popover from '$lib/components/ui/popover'
  import * as m from '$lib/paraglide/messages'
  import { cn } from '$lib/utils.js'
  import { apiRequest } from '$utils/request'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getUserInitials } from '$utils/strings'
  import SendIcon from '@lucide/svelte/icons/send'
  import SmilePlusIcon from '@lucide/svelte/icons/smile-plus'
  import Sparkles from '@tabler/icons-svelte/icons/sparkles'
  import { getContext, tick, untrack } from 'svelte'

  type AdminChatProps = {
    onAgentMessage?: (message: string) => void
  }

  const { onAgentMessage }: AdminChatProps = $props()

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
  let open = $state(false)
  const messages = $state<Message[]>([])

  async function fetchSplashMessage(entityId: string) {
    loading = true
    try {
      const response = await apiRequest<ChatResponse>({
        url: `/legal-entities/${entityId}/config/chat`,
        method: 'POST',
        data: { message: 'Hi' },
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
          <p>{msg.message}</p>
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
    <EmojiPicker.Root
      showRecents
      recentsKey="emoji-picker-recents"
      disableInitialScroll
      onSelect={selected => {
        open = false
        message += selected.emoji
      }}>
      <Popover.Root bind:open>
        <Popover.Trigger class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'shrink-0 rounded-full')}>
          <SmilePlusIcon />
        </Popover.Trigger>
        <Popover.Content class="w-auto p-0" side="top" align="start">
          <EmojiPicker.Search />
          <EmojiPicker.List class="h-[175px]" />
          <EmojiPicker.Footer class="relative flex max-w-[232px] place-items-center gap-2 px-2">
            {#snippet children({ active })}
              <div class="flex w-[calc(100%-40px)] items-center gap-2">
                <span class="text-lg">{active?.emoji}</span>
                <span class="truncate text-xs text-muted-foreground">
                  {active?.data.name}
                </span>
              </div>
              <EmojiPicker.SkinToneSelector />
            {/snippet}
          </EmojiPicker.Footer>
        </Popover.Content>
      </Popover.Root>
    </EmojiPicker.Root>
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
