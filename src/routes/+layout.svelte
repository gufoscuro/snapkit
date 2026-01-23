<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { initLanguageContext } from '$lib/contexts/language'
  import type { TenantInterfaceDetails } from '$utils/customer-registry'
  import '@fontsource-variable/geist'
  import { setContext } from 'svelte'
  import type { LayoutProps } from './$types'
  import { Toaster } from '$lib/components/ui/sonner'
  import './layout.css'

  let { children, data }: LayoutProps = $props()

  setContext<TenantInterfaceDetails>('tenantInterfaceDetails', data.tenantInterfaceDetails)

  // Initialize language context for i18n
  initLanguageContext()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col">
  {@render children()}
</div>

<Toaster />
