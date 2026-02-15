<script lang="ts">
  import { onNavigate } from '$app/navigation'
  import DevtoolsPanel from '$lib/components/runtime/devtools/DevtoolsPanel.svelte'
  import ConfirmArchiveDialog from '$lib/components/ui/confirm-archive-dialog/confirm-archive-dialog.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import { initLanguageContext } from '$lib/contexts/language'
  import type { OnNavigate } from '@sveltejs/kit'
  import type { LayoutProps } from './$types'

  let { children, data }: LayoutProps = $props()

  // setContext<TenantInterfaceDetails>('tenantInterfaceDetails', data.tenantInterfaceDetails)

  // Initialize language context for i18n
  initLanguageContext()

  function ignoreTransition(navigation: OnNavigate) {
    const hasScheme = navigation.to?.url.searchParams.has('scheme')

    if (!hasScheme && navigation.from?.url.pathname === navigation.to?.url.pathname) return true

    return false
  }

  function applyTransition(navigation: OnNavigate) {
    const fromPathname = navigation.from?.url.pathname
    const toPathname = navigation.to?.url.pathname

    if (toPathname?.includes('login')) return setTransitionProperty('zoom-out')
    else if (fromPathname?.includes('login')) return setTransitionProperty('zoom-out')
    else if (fromPathname?.includes('upsert') && navigation.to?.url.pathname.includes('upsert'))
      return setTransitionProperty('normal')
    else if (fromPathname?.includes('upsert')) return setTransitionProperty('slide-out')
    else if (toPathname?.includes('upsert')) return setTransitionProperty('slide-in')
    else if (fromPathname?.includes('settings') && toPathname?.includes('settings'))
      return setTransitionProperty('normal')
    else if (toPathname?.includes('settings')) return setTransitionProperty('slide-in')
    else if (fromPathname?.includes('settings')) return setTransitionProperty('slide-out')

    return setTransitionProperty('normal')
  }

  function setTransitionProperty(effect: string) {
    document.documentElement.style.setProperty('--view-transition-effect', effect)
  }

  onNavigate(navigation => {
    if (document.startViewTransition)
      return new Promise(resolve => {
        if (ignoreTransition(navigation)) {
          resolve()
          return
        }

        applyTransition(navigation)
        document.startViewTransition &&
          document.startViewTransition(async () => {
            resolve()
            await navigation.complete
          })
      })
  })
</script>

{@render children()}

<Toaster />
<ConfirmArchiveDialog />
<DevtoolsPanel />
