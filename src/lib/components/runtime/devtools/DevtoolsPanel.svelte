<script lang="ts">
  import { dev } from '$app/environment'
  import { Button } from '$components/ui/button'
  import { shortcut } from '$lib/actions/shortcut.svelte'
  import { IconX } from '@tabler/icons-svelte'
  import { fly } from 'svelte/transition'
  import { getForms, getPageDetails, getPageState } from './devtools-registry.svelte'
  import { loadDevtoolsState, saveDevtoolsState } from './devtools-storage'
  import FormsTab from './tabs/FormsTab.svelte'
  import PageDetailsTab from './tabs/PageDetailsTab.svelte'
  import PageStateTab from './tabs/PageStateTab.svelte'
  import type { DevtoolsTab } from './types'

  // Load persisted state
  let persistedState = $state(loadDevtoolsState())
  let isOpen = $state(persistedState.isOpen)
  let activeTab = $state<DevtoolsTab>(persistedState.activeTab)

  // Reactive registry access - use $derived to track version changes
  let forms = $derived(getForms())
  let pageDetails = $derived(getPageDetails())
  let pageState = $derived(getPageState())
  let hasContent = $derived(forms.size > 0 || pageDetails !== null || pageState !== null)

  // Debug logging
  $effect(() => {
    // console.log('[Devtools Panel] Update:', {
    //   formsCount: forms.size,
    //   hasPageDetails: !!pageDetails,
    //   hasPageState: !!pageState,
    //   hasContent
    // })
  })

  // Persist state changes
  $effect(() => {
    saveDevtoolsState({ isOpen, activeTab })
  })

  function toggle() {
    isOpen = !isOpen
  }

  function close() {
    isOpen = false
  }

  function setTab(tab: DevtoolsTab) {
    activeTab = tab
  }

  // Determine available tabs based on registered content
  const availableTabs = $derived.by(() => {
    const tabs: { id: DevtoolsTab; label: string; count?: number }[] = []

    if (pageDetails) {
      tabs.push({ id: 'page-details', label: 'Page Details' })
    }

    if (pageState) {
      tabs.push({ id: 'page-state', label: 'Page State' })
    }

    if (forms.size > 0) {
      tabs.push({
        id: 'forms',
        label: 'Forms',
        count: forms.size,
      })
    }

    return tabs
  })

  // Auto-switch to first available tab if current tab becomes unavailable
  $effect(() => {
    const available = availableTabs
    if (available.length > 0 && !available.some(t => t.id === activeTab)) {
      activeTab = available[0].id
    }
  })

  function handleShortcut() {
    // Only toggle if in dev mode and has content
    if (dev && hasContent) {
      toggle()
    }
  }
</script>

<!-- Keyboard shortcut: Ctrl+M (Windows/Linux) / Cmd+M (Mac) -->
<svelte:window
  use:shortcut={{
    ctrl: true,
    key: 'm',
    callback: handleShortcut,
  }} />

{#if dev && hasContent}
  <!-- Floating toggle button -->
  <!-- <div class="fixed right-2 bottom-12 z-50">
    <Button
      size="icon"
      variant={isOpen ? 'default' : 'secondary'}
      class="relative z-10"
      onclick={toggle}
      title="Toggle Devtools (Ctrl+M / Cmd+M)">
      <IconBug />
    </Button>
  </div> -->

  <!-- Spacer to allow content to scroll above panel when open -->
  {#if isOpen}
    <div class="h-[35vh]" aria-hidden="true"></div>
  {/if}

  <!-- Bottom panel - only rendered when open -->
  {#if isOpen}
    <div
      class="fixed bottom-0 left-0 z-40 flex h-[35vh] w-full flex-col border-t bg-background shadow-xl"
      in:fly={{ y: 150, opacity: 1, duration: 300 }}>
      <!-- Header with tabs and close button -->
      <div class="flex h-10 shrink-0 items-center justify-between gap-4 border-b bg-muted/50 backdrop-blur">
        <!-- Tabs -->
        <div class="flex h-full items-center gap-1 px-4">
          {#each availableTabs as tab}
            <button
              class="flex h-full items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors
                 {activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'}"
              onclick={() => setTab(tab.id)}>
              {tab.label}
              {#if tab.count !== undefined}
                <span class="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Close button -->
        <Button size="icon" variant="ghost" onclick={close}>
          <IconX />
        </Button>
      </div>

      <!-- Tab content - only active tab rendered -->
      <div class="flex-1 overflow-y-auto">
        {#if activeTab === 'page-details' && pageDetails}
          <PageDetailsTab info={pageDetails} />
        {:else if activeTab === 'page-state' && pageState}
          <PageStateTab state={pageState} />
        {:else if activeTab === 'forms' && forms.size > 0}
          <FormsTab {forms} />
        {/if}
      </div>
    </div>
  {/if}
{/if}
