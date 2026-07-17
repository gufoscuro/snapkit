<script lang="ts">
  import { afterNavigate, onNavigate } from '$app/navigation'
  import { updated } from '$app/state'
  import ChatMount from '$lib/chat/components/ChatMount.svelte'
  import { chatEnabled } from '$lib/chat/enabled'
  import { chatStore } from '$lib/chat/store'
  import DevtoolsPanel from '$lib/components/runtime/devtools/DevtoolsPanel.svelte'
  import ConfirmActionDialog from '$lib/components/ui/confirm-action-dialog/confirm-action-dialog.svelte'
  import ConfirmArchiveDialog from '$lib/components/ui/confirm-archive-dialog/confirm-archive-dialog.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import { initLanguageContext } from '$lib/contexts/language'
  import { pushUrl } from '$lib/contexts/navigation-history.svelte'
  import * as m from '$lib/paraglide/messages'
  import * as StorageUtil from '$lib/utils/storage'
  import type { OnNavigate } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import type { LayoutProps } from './$types'

  let { data, children }: LayoutProps = $props()

  // Set user key for per-user localStorage storage
  $effect(() => {
    if (data.user?.id) {
      StorageUtil.setUserKey(data.user.id)
    }
  })

  // Reset chat conversation + breadcrumbs whenever the active user changes
  // (login, logout, account switch). Chat is dev-only for now.
  let lastUserId: string | null = null
  $effect(() => {
    if (!chatEnabled) return
    const currentId = data.user?.id ?? null
    if (currentId !== lastUserId) {
      chatStore.reset()
      lastUserId = currentId
    }
  })

  // Initialize language context for i18n
  initLanguageContext()

  // Notify user when a new app version is available
  $effect(() => {
    if (updated.current) {
      toast.info(m.app_update_available(), {
        duration: Infinity,
        action: {
          label: m.app_update_action(),
          onClick: () => location.reload(),
        },
      })
    }
  })

  function ignoreTransition(navigation: OnNavigate) {
    const hasScheme = navigation.to?.url.searchParams.has('scheme')

    if (!hasScheme && navigation.from?.url.pathname === navigation.to?.url.pathname) return true

    return false
  }

  function applyTransition(navigation: OnNavigate) {
    // const fromPathname = navigation.from?.url.pathname
    // const toPathname = navigation.to?.url.pathname

    // if (fromPathname?.includes('upsert') && navigation.to?.url.pathname.includes('upsert'))
    //   return setTransitionProperty('normal')
    // else if (fromPathname?.includes('upsert')) return setTransitionProperty('slide-out')
    // else if (toPathname?.includes('upsert')) return setTransitionProperty('slide-in')
    // else if (fromPathname?.includes('settings') && toPathname?.includes('settings'))
    //   return setTransitionProperty('normal')
    // else if (toPathname?.includes('settings')) return setTransitionProperty('slide-in')
    // else if (fromPathname?.includes('settings')) return setTransitionProperty('slide-out')

    return setTransitionProperty('normal')
  }

  function setTransitionProperty(effect: string) {
    document.documentElement.style.setProperty('--view-transition-effect', effect)
  }

  afterNavigate(({ to }) => {
    if (to?.url.pathname) {
      pushUrl(to.url.pathname + to.url.search + to.url.hash)
      if (chatEnabled) chatStore.pushNavigation(to.url.pathname)
    }
  })

  onNavigate(navigation => {
    if (document.startViewTransition)
      return new Promise(resolve => {
        if (ignoreTransition(navigation)) {
          resolve()
          return
        }

        applyTransition(navigation)
        document.startViewTransition(async () => {
          resolve()
          await navigation.complete
        })
      })
  })
</script>

{@render children()}

<Toaster position="top-right" swipeDirections={['right']} />
<ConfirmArchiveDialog />
<ConfirmActionDialog />
{#if chatEnabled}
  <ChatMount />
{/if}
<DevtoolsPanel />
