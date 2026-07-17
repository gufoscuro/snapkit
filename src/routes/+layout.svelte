<script lang="ts">
  import { replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import favicon from '$lib/assets/favicon.svg'
  import { LEGAL_ENTITY_HANDOFF_PARAM, TENANT_HANDOFF_PARAM } from '$lib/fixtures/constants'
  import * as m from '$lib/paraglide/messages'
  import '@fontsource-variable/geist'
  import Bug from '@lucide/svelte/icons/bug'
  import { ModeWatcher } from 'mode-watcher'
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { LayoutProps } from './$types'
  import './layout.css'

  let { children }: LayoutProps = $props()
  let uncaughtError = $state<Error | null>(null)

  // The load has already consumed these into cookies by the time we mount, so drop
  // them: what's left in the address bar is then the clean, shareable URL whose
  // meaning comes from the origin alone. Cosmetic — `replaceState` also keeps the
  // spent params out of the history.
  onMount(() => {
    const url = new URL(page.url)
    if (!url.searchParams.has(TENANT_HANDOFF_PARAM) && !url.searchParams.has(LEGAL_ENTITY_HANDOFF_PARAM)) return
    url.searchParams.delete(TENANT_HANDOFF_PARAM)
    url.searchParams.delete(LEGAL_ENTITY_HANDOFF_PARAM)
    // Not a route to resolve — it's the URL we're already on, minus two spent params.
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    replaceState(url, page.state)
  })

  onMount(() => {
    function handleError(event: ErrorEvent) {
      uncaughtError = event.error ?? new Error(event.message)
      console.error('Uncaught error:', uncaughtError)

      event.preventDefault()
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      uncaughtError = reason instanceof Error ? reason : new Error(String(reason))
      console.error('Unhandled promise rejection:', uncaughtError)
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<div class="flex h-screen flex-col antialiased">
  {@render children()}
</div>

{#if uncaughtError}
  <div
    class="fixed inset-0 z-20 flex h-full w-full cursor-default items-center justify-center bg-background/70 backdrop-blur-sm"
    in:fade={{ duration: 300 }}>
    <div>
      <div class="flex justify-center">
        <div>
          <div class="mt-1 flex items-center gap-1">
            <Bug class="size-5 rotate-12 text-destructive" />
            <Bug class="size-5 -rotate-45 text-destructive" />
          </div>
        </div>
      </div>
      <h2 class="mt-2 flex justify-center text-center text-lg font-semibold">{m.unexpected_error_title()}</h2>
      <p class="max-w-xl pb-16 text-center text-sm text-muted-foreground">{m.unexpected_error_message()}</p>
    </div>
  </div>
{/if}
