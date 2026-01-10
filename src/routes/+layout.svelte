<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import type { TenantInterfaceDetails } from '$utils/customer-registry'
  import '@fontsource-variable/geist'
  import { setContext } from 'svelte'
  import type { LayoutProps } from './$types'
  import './layout.css'

  let { children, data }: LayoutProps = $props()

  setContext<TenantInterfaceDetails>('tenantInterfaceDetails', data.tenantInterfaceDetails)
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col">
  {@render children()}
</div>
