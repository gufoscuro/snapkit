<script lang="ts">
  import { adminStore } from '$lib/admin/stores/admin-store.svelte'
  import AdminLayout from '$lib/components/core/admin/AdminLayout.svelte'
  import { setAdminPanelContext } from '$lib/contexts/admin-panel.svelte'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import type { LayoutData } from './$types'

  interface Props {
    data: LayoutData
    children: Snippet
  }

  const { data, children }: Props = $props()

  // Set admin panel context
  setAdminPanelContext(true)

  // Initialize admin store with saved configuration and restore tenant from localStorage
  // Use untrack to prevent infinite loops when loadState modifies the store
  $effect(() => {
    if (data.adminConfig) {
      untrack(() => {
        adminStore.loadState(data.adminConfig)
        adminStore.initializeTenantFromStorage()
      })
    }
  })
</script>

<AdminLayout user={data.user}>
  {@render children()}
</AdminLayout>
