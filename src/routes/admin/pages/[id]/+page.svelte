<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { adminPagesRoute } from '$lib/admin/routes'
  import { saveAdminConfig } from '$lib/admin/save'
  import { adminStore } from '$lib/admin/store.svelte'
  import { Button } from '$lib/components/ui/button'
  import { confirmDelete } from '$lib/components/ui/confirm-delete-dialog/confirm-delete-dialog.svelte'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import Save from '@lucide/svelte/icons/save'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { toast } from 'svelte-sonner'

  const pageId = $derived(page.params.id)
  const currentPage = $derived(adminStore.state.pages.find(p => p.$id === pageId))
  let isSaving = $state(false)
  let iframeHeight = $state(800)

  // Select page from URL param
  $effect(() => {
    if (pageId && adminStore.state.selection.id !== pageId) {
      adminStore.selectPage(pageId)
    }
  })

  // Build the tenant-based URL for the page
  function buildTenantPageUrl(): string | null {
    if (!currentPage) return null
    const tenant = adminStore.state.tenants.find(t => t.id === currentPage.tenantId)
    if (!tenant) return null

    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port

    const parts = hostname.split('.')
    const baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname

    const portSuffix = port ? `:${port}` : ''
    const url = `${protocol}//${tenant.vanity}.${baseDomain}${portSuffix}${currentPage.route}`
    return url
  }

  // Build preview URL for iframe
  function buildPreviewUrl(): string | null {
    if (!currentPage) return null
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port
    const portSuffix = port ? `:${port}` : ''
    return `${protocol}//${hostname}${portSuffix}/admin/preview/page/${currentPage.$id}`
  }

  const tenantPageUrl = $derived(buildTenantPageUrl())
  const previewUrl = $derived(buildPreviewUrl())

  async function handleSave() {
    isSaving = true
    const result = await saveAdminConfig()
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    isSaving = false
  }

  function handleDeletePage() {
    if (!currentPage) return
    const pageTitle = currentPage.title
    confirmDelete({
      title: 'Delete Page',
      description: `Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`,
      confirm: {
        text: 'Delete Page',
      },
      onConfirm: async () => {
        adminStore.deletePage(currentPage.$id)
        toast.success(`Page "${pageTitle}" deleted successfully`)
        await goto(adminPagesRoute())
      },
    })
  }

  // Listen for height updates from iframe
  function handleMessage(event: MessageEvent) {
    if (event.data?.type === 'preview-height' && typeof event.data.height === 'number') {
      iframeHeight = Math.max(600, event.data.height + 40) // Add some padding
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

{#if !currentPage}
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <h3 class="mb-2 text-lg font-semibold">Page not found</h3>
    <p class="mb-4 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been removed.</p>
    <Button onclick={() => goto(adminPagesRoute())}>
      <ArrowLeft class="mr-2 size-4" />
      Back to pages
    </Button>
  </div>
{:else}
  <div class="-m-6 flex h-full flex-col">
    <div class="flex items-center justify-between border-b bg-white px-6 py-4">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold">{currentPage.title}</h1>
      </div>
      <div class="flex gap-2">
        {#if tenantPageUrl}
          <Button variant="ghost" size="icon" onclick={() => window.open(tenantPageUrl, '_blank')} title="View page">
            <ExternalLink class="size-4" />
          </Button>
        {/if}
        <Button
          variant="ghost"
          size="icon"
          class="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onclick={handleDeletePage}
          title="Delete page">
          <Trash2 class="size-4" />
        </Button>
        <Button size="sm" onclick={handleSave} disabled={isSaving}>
          <Save class="mr-2 size-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>

    <!-- Preview area -->
    <div class="flex-1 overflow-auto bg-gray-50 p-6">
      <div class="mx-auto">
        {#if previewUrl}
          <div class="rounded-lg bg-white">
            <iframe src={previewUrl} title="Page Preview" class="w-full border-0" style="height: {iframeHeight}px;"
            ></iframe>
          </div>
        {:else}
          <div class="flex items-center justify-center rounded-lg border bg-white p-12">
            <p class="text-muted-foreground">Preview not available</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
