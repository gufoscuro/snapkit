<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import '@fontsource-variable/geist'
  import type { LayoutProps } from './$types'
  import './layout.css'

  let { children }: LayoutProps = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col">
  {@render children()}
</div>
