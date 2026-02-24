<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import '@fontsource-variable/geist'
  import { ModeWatcher } from 'mode-watcher'
  import type { LayoutProps } from './$types'
  import './layout.css'

  let { children }: LayoutProps = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<div class="flex h-screen flex-col">
  {@render children()}
</div>
