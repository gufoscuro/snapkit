<script lang="ts">
  import XIcon from '@lucide/svelte/icons/x'
  import { ChatBox } from '@diaphora/chat'
  import { fly } from 'svelte/transition'
  import { chatStore, chatUi } from '$lib/chat/store'
  import { Button } from '$lib/components/ui/button'

  const VIEWPORT_MARGIN = 16

  let panelRef: HTMLElement | null = $state(null)
  let dragOffset = $state({ x: 0, y: 0 })
  let dragStart: { mx: number; my: number; ox: number; oy: number; rect: DOMRect } | null = null
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  // Return to default position on close/show cycle. We wait for the outro to finish
  // before resetting, so the panel doesn't visually jump during slide-out. On a rapid
  // re-open we cancel and snap to default immediately.
  $effect(() => {
    if (chatUi.isOpen) {
      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
        dragOffset = { x: 0, y: 0 }
      }
    } else {
      if (resetTimer) clearTimeout(resetTimer)
      resetTimer = setTimeout(() => {
        dragOffset = { x: 0, y: 0 }
        resetTimer = null
      }, 260)
    }
  })

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && chatUi.isOpen) {
      chatUi.close()
      e.stopPropagation()
    }
  }

  function onHeaderPointerDown(e: PointerEvent) {
    // Don't initiate a drag from the close button (or any future control in the header).
    if (e.target instanceof Element && e.target.closest('button')) return
    if (!panelRef) return
    const rect = panelRef.getBoundingClientRect()
    dragStart = {
      mx: e.clientX,
      my: e.clientY,
      ox: dragOffset.x,
      oy: dragOffset.y,
      rect,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onHeaderPointerMove(e: PointerEvent) {
    if (!dragStart) return
    let dx = e.clientX - dragStart.mx
    let dy = e.clientY - dragStart.my

    // Clamp so the entire panel stays inside the viewport with VIEWPORT_MARGIN on all sides.
    const r = dragStart.rect
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (r.left + dx < VIEWPORT_MARGIN) dx = VIEWPORT_MARGIN - r.left
    if (r.right + dx > vw - VIEWPORT_MARGIN) dx = vw - VIEWPORT_MARGIN - r.right
    if (r.top + dy < VIEWPORT_MARGIN) dy = VIEWPORT_MARGIN - r.top
    if (r.bottom + dy > vh - VIEWPORT_MARGIN) dy = vh - VIEWPORT_MARGIN - r.bottom

    dragOffset = { x: dragStart.ox + dx, y: dragStart.oy + dy }
  }

  function onHeaderPointerUp(e: PointerEvent) {
    if (!dragStart) return
    dragStart = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if chatUi.isOpen}
  <div
    transition:fly={{ x: 460, duration: 240, opacity: 0 }}
    class="fixed top-[calc(var(--spacing-breadcrumbs)+1rem)] right-4 bottom-[calc(var(--spacing-breadcrumbs)+1rem)] z-40 flex w-[calc(100vw-2rem)] max-h-200 max-w-110">
    <aside
      bind:this={panelRef}
      style:transform="translate({dragOffset.x}px, {dragOffset.y}px)"
      class="bg-sidebar relative flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-2xl"
      aria-label="Moddo assistant">
      <header
        onpointerdown={onHeaderPointerDown}
        onpointermove={onHeaderPointerMove}
        onpointerup={onHeaderPointerUp}
        class="flex shrink-0 cursor-grab items-center justify-between border-b px-4 py-3 select-none active:cursor-grabbing">
        <h2 class="text-sm font-semibold">Assistente</h2>
        <Button
          size="icon"
          variant="ghost"
          class="size-7"
          onclick={() => chatUi.close()}
          aria-label="Close">
          <XIcon class="size-4" />
        </Button>
      </header>
      <div class="min-h-0 flex-1 [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent">
        {#if chatStore.chat}
          <ChatBox chatState={chatStore.chat} wrapped={false} />
        {/if}
      </div>
    </aside>
  </div>
{/if}
