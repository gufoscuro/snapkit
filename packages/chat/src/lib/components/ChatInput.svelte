<script lang="ts">
  import { Button } from '../ui/button'
  import * as DropdownMenu from '../ui/dropdown-menu'
  import { Textarea } from '../ui/textarea'
  import PaperclipIcon from '@lucide/svelte/icons/paperclip'
  import SendIcon from '@lucide/svelte/icons/send-horizontal'
  import { onMount } from 'svelte'
  import { getAttachmentDraftState } from '../attachment-draft.svelte'
  import { getChatState } from '../chat-context'
  import type { AttachmentMenuItem, ChatCommand } from '../types'
  import AttachmentChip from './AttachmentChip.svelte'
  import ChatCommandMenu from './ChatCommandMenu.svelte'

  const { autofocus = false }: { autofocus?: boolean } = $props()

  const chat = getChatState()
  const draft = getAttachmentDraftState()

  let value = $state('')
  let textareaRef = $state<HTMLTextAreaElement | null>(null)
  let fileInputRef: HTMLInputElement | null = null
  let customInputRef: HTMLInputElement | null = null
  let pendingCustomItem = $state<AttachmentMenuItem | null>(null)
  let menuOpen = $state(false)
  let commandError = $state<string | null>(null)

  const canSend = $derived((value.trim().length > 0 || draft.items.length > 0) && !chat.isBusy)

  // Input-level command shortcut. Resolved inline in pickCommand because the file
  // picker lives on this component's DOM ref, not on chat-state's command API.
  const attachCommand: ChatCommand = {
    name: 'attach',
    description: 'Attach a file',
    handler: () => {},
  }

  const menuCommands = $derived(
    chat.isWaitingUser || draft.isFull || chat.commands.some(c => c.name === attachCommand.name)
      ? chat.commands
      : [attachCommand, ...chat.commands],
  )

  async function submit() {
    if (!canSend) return
    const text = value
    const attachments = draft.snapshot()
    value = ''
    commandError = null
    draft.clear()
    try {
      await chat.send(text, attachments)
    } finally {
      textareaRef?.focus()
    }
  }

  function pickCommand(cmd: ChatCommand) {
    commandError = null
    if (cmd === attachCommand) {
      fileInputRef?.click()
      textareaRef?.focus()
      return
    }
    if (cmd.hasArgs) {
      value = `/${cmd.name} `
      textareaRef?.focus()
      return
    }
    void chat.executeCommand(`/${cmd.name}`).then(result => {
      if (!result.ok) commandError = result.error
      textareaRef?.focus()
    })
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === '/' && value.length === 0 && !chat.isWaitingUser) {
      event.preventDefault()
      menuOpen = true
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items
    if (!items) return
    const imageFiles: File[] = []
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      event.preventDefault()
      void draft.addFiles(imageFiles)
    }
  }

  function handleFilePick(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    void draft.addFiles(input.files)
    input.value = ''
  }

  function pickAttachmentMenuItem(item: AttachmentMenuItem) {
    pendingCustomItem = item
    customInputRef?.click()
  }

  function handleCustomFilePick(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const item = pendingCustomItem
    pendingCustomItem = null
    if (!input.files || input.files.length === 0 || !item) {
      input.value = ''
      return
    }
    // Snapshot the FileList into a stable array BEFORE resetting `input.value`
    // — resetting the input clears its live FileList, which would empty the
    // reference we pass to the handler.
    const files = Array.from(input.files)
    input.value = ''
    void chat.invokeAttachmentMenuItem(item.id, files)
  }

  onMount(() => {
    if (autofocus) textareaRef?.focus()
  })
</script>

<div class="flex flex-col">
  {#if draft.lastError}
    <div class={commandError ? 'px-8' : 'px-4'}>
      <div
        class="rounded-t-md border-x border-t border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
        <span>{draft.lastError || 'Some error occurred'}</span>
        <button type="button" class="ml-2 underline hover:no-underline" onclick={() => draft.clearError()}>
          Dismiss
        </button>
      </div>
    </div>
  {/if}

  {#if commandError}
    <div class="px-4">
      <div
        class="rounded-t-md border-x border-t border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
        {commandError}
      </div>
    </div>
  {/if}

  <div class="px-2 pb-2">
    <form
      class="flex flex-col rounded-md border bg-input/30 ring-ring/50 has-[textarea:focus]:border-primary"
      onsubmit={event => {
        event.preventDefault()
        void submit()
      }}>
      {#if draft.items.length > 0}
        <div class="flex flex-wrap gap-1.5 px-3 py-2">
          {#each draft.items as item (item.id)}
            <AttachmentChip attachment={item} onRemove={() => draft.remove(item.id)} />
          {/each}
        </div>
      {/if}

      <Textarea
        bind:ref={textareaRef}
        bind:value
        placeholder={chat.isWaitingUser ? 'Please respond to the prompt above to continue.' : 'Type a message...'}
        disabled={chat.isWaitingUser}
        rows={1}
        class="max-h-40 min-h-12 resize-none rounded-none border-0 bg-transparent! px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        onkeydown={handleKeydown}
        onpaste={handlePaste} />

      <input
        {@attach node => {
          fileInputRef = node as HTMLInputElement
        }}
        type="file"
        multiple
        class="hidden"
        onchange={handleFilePick} />

      <input
        {@attach node => {
          customInputRef = node as HTMLInputElement
        }}
        type="file"
        accept={pendingCustomItem?.accept ?? ''}
        multiple={pendingCustomItem?.multiple ?? false}
        class="hidden"
        onchange={handleCustomFilePick} />

      <div class="flex items-center justify-between gap-2 px-2 py-1.5">
        <div class="flex items-center gap-1">
          {#if chat.attachmentMenuItems.length === 0}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              class="size-8"
              disabled={chat.isWaitingUser || draft.isFull}
              aria-label="Attach files"
              onclick={() => fileInputRef?.click()}>
              <PaperclipIcon class="size-4" />
            </Button>
          {:else}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="size-8"
                    disabled={chat.isWaitingUser}
                    aria-label="Open attachment menu"
                    {...props}>
                    <PaperclipIcon class="size-4" />
                  </Button>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content side="top" align="start" class="w-64">
                <DropdownMenu.Item
                  disabled={draft.isFull}
                  onSelect={() => fileInputRef?.click()}>
                  <PaperclipIcon class="size-4" />
                  <span>Attach file</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                {#each chat.attachmentMenuItems as item (item.id)}
                  {@const Icon = item.icon}
                  <DropdownMenu.Item onSelect={() => pickAttachmentMenuItem(item)}>
                    {#if Icon}
                      <Icon class="size-4" />
                    {/if}
                    <div class="flex flex-col">
                      <span>{item.label}</span>
                      {#if item.description}
                        <span class="text-xs text-muted-foreground">{item.description}</span>
                      {/if}
                    </div>
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          {/if}

          <ChatCommandMenu bind:open={menuOpen} commands={menuCommands} onPick={pickCommand}>
            {#snippet trigger(props)}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                class="size-8"
                disabled={chat.isWaitingUser}
                aria-label="Open commands menu"
                {...props}>
                /
              </Button>
            {/snippet}
          </ChatCommandMenu>
        </div>

        <Button type="submit" size="icon" class="size-8" disabled={!canSend} aria-label="Send message">
          <SendIcon class="size-4 -rotate-90" />
        </Button>
      </div>
    </form>
  </div>
</div>
