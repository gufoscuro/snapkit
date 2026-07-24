<!--
  @component BrandingSettings
  @description Edits a legal entity's branding — logo and primary color — which the
  backend applies to the header of every generated PDF. Reads via the branding GET,
  writes the color with an optimistic-locked PUT, and uploads/removes the logo via
  the dedicated multipart POST / DELETE (PHP can't read multipart on PUT).
  @keywords branding, logo, color, settings, legal entity, pdf
  @api GET /api/legal-entities/{legalEntity}/branding (Moddo API) -> LegalEntityBranding
  @api PUT /api/legal-entities/{legalEntity}/branding (Moddo API)
  @api GET /api/legal-entities/{legalEntity}/branding/logo (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/branding/logo (Moddo API)
  @api DELETE /api/legal-entities/{legalEntity}/branding/logo (Moddo API)
-->
<script lang="ts">
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import { Button } from '$components/ui/button'
  import * as FileDropZone from '$components/ui/file-drop-zone'
  import type { FileRejectedReason } from '$components/ui/file-drop-zone/types'
  import Separator from '$components/ui/separator/separator.svelte'
  import { Spinner } from '$components/ui/spinner'
  import * as m from '$lib/paraglide/messages'
  import type {
    LegalEntity,
    LegalEntityBranding,
    UpdateLegalEntityBrandingBody,
    UserResource,
  } from '$lib/types/api-types'
  import { prepareLogoUpload, type LogoPrepError } from '$lib/utils/logo-image'
  import { ApiError, api, apiFetchBlob } from '$lib/utils/request'
  import Check from '@lucide/svelte/icons/check'
  import ImageIcon from '@lucide/svelte/icons/image'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import { onDestroy } from 'svelte'
  import { toast } from 'svelte-sonner'

  let { legalEntity, user }: { legalEntity?: LegalEntity | null; user?: UserResource | null } = $props()

  /** Platform default when no color is set — mirrors the backend fallback. */
  const DEFAULT_COLOR = '#2563eb'

  /** Curated brand palette (lowercase `#rrggbb`); the default blue is rendered separately. */
  const PRESET_COLORS = [
    '#4f46e5',
    '#7c3aed',
    '#0ea5e9',
    '#06b6d4',
    '#14b8a6',
    '#16a34a',
    '#65a30d',
    '#ca8a04',
    '#ea580c',
    '#dc2626',
    '#e11d48',
    '#db2777',
    '#475569',
    '#0f172a',
  ]

  const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/avif'
  /** Reject absurdly large files before we even try to decode them. */
  const MAX_SOURCE_BYTES = 15 * 1024 * 1024

  const legalEntityId = $derived(legalEntity?.id)
  const canEdit = $derived(
    (user?.is_superadmin ?? false) || (user?.all_permissions?.includes('edit-legal-entities') ?? false),
  )

  let loading = $state(true)
  let loadError = $state(false)
  let version = $state(1)
  /** The color explicitly set on the entity (`null` = use the platform default). */
  let selectedColor = $state<string | null>(null)
  let logoUrl = $state<string | null>(null)

  let savingColor = $state(false)
  let uploadingLogo = $state(false)
  let removingLogo = $state(false)

  const busy = $derived(savingColor || uploadingLogo || removingLogo)

  // Custom stored color that isn't in the preset list — surface it so it shows selected.
  const customColor = $derived(
    selectedColor && selectedColor !== DEFAULT_COLOR && !PRESET_COLORS.includes(selectedColor) ? selectedColor : null,
  )

  function revokeLogo() {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
      logoUrl = null
    }
  }

  function applyBranding(b: LegalEntityBranding) {
    version = Number(b.version)
    selectedColor = b.primary_color ? b.primary_color.toLowerCase() : null
  }

  async function loadLogo(url: string | undefined) {
    revokeLogo()
    if (!url || !legalEntityId) return
    try {
      const blob = await apiFetchBlob({ url: `/legal-entities/${legalEntityId}/branding/logo` })
      if (blob) logoUrl = URL.createObjectURL(blob)
    } catch {
      // Non-fatal: the color editor still works without the logo preview.
    }
  }

  async function load() {
    if (!legalEntityId) return
    loading = true
    loadError = false
    const { data, error } = await api.safe.get<LegalEntityBranding>(`/legal-entities/${legalEntityId}/branding`)
    if (error || !data) {
      loadError = true
      loading = false
      return
    }
    applyBranding(data)
    await loadLogo(data.logo_url)
    loading = false
  }

  $effect(() => {
    if (legalEntityId) load()
  })

  onDestroy(revokeLogo)

  async function saveColor(color: string | null) {
    if (!canEdit || !legalEntityId || busy) return
    const previous = selectedColor
    selectedColor = color
    savingColor = true
    try {
      const updated = await api.put<LegalEntityBranding, UpdateLegalEntityBrandingBody>(
        `/legal-entities/${legalEntityId}/branding`,
        { data: { primary_color: color, version } },
      )
      applyBranding(updated)
      toast.success(m.branding_color_saved_success())
    } catch (err) {
      selectedColor = previous
      if (err instanceof ApiError && err.status === 409) {
        toast.error(m.branding_conflict_error())
        await load()
      } else {
        toast.error(m.branding_save_error())
      }
    } finally {
      savingColor = false
    }
  }

  const LOGO_ERROR_MESSAGES: Record<LogoPrepError, () => string> = {
    'not-raster': m.branding_logo_error_not_raster,
    'decode-failed': m.branding_logo_error_decode,
    'too-large': m.branding_logo_error_too_large,
  }

  async function handleLogoPicked(files: File[]) {
    if (!canEdit || !legalEntityId || busy) return
    const file = files[0]
    if (!file) return

    const prepared = await prepareLogoUpload(file)
    if (!prepared.ok) {
      toast.error(LOGO_ERROR_MESSAGES[prepared.reason]())
      return
    }

    uploadingLogo = true
    try {
      const body = new FormData()
      body.append('logo', prepared.blob, prepared.filename)
      const updated = await api.upload<LegalEntityBranding>(`/legal-entities/${legalEntityId}/branding/logo`, { body })
      applyBranding(updated)
      await loadLogo(updated.logo_url)
      toast.success(m.branding_logo_uploaded_success())
    } catch {
      toast.error(m.branding_logo_upload_error())
    } finally {
      uploadingLogo = false
    }
  }

  function handleFileRejected({ reason }: { reason: FileRejectedReason; file: File }) {
    toast.error(
      reason === 'Maximum file size exceeded' ? m.branding_logo_error_too_large() : m.branding_logo_error_not_raster(),
    )
  }

  async function removeLogo() {
    if (!canEdit || !legalEntityId || busy) return
    removingLogo = true
    try {
      await api.delete(`/legal-entities/${legalEntityId}/branding/logo`)
      revokeLogo()
      // DELETE returns no body; resync version/effective color from a fresh read.
      await load()
      toast.success(m.branding_logo_removed_success())
    } catch {
      toast.error(m.branding_logo_remove_error())
    } finally {
      removingLogo = false
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-center py-12">
    <Spinner />
  </div>
{:else if loadError}
  <p class="py-8 text-sm text-muted-foreground">{m.branding_load_error()}</p>
{:else}
  <div class="flex flex-col gap-6">
    {#if !canEdit}
      <p class="text-sm text-muted-foreground">{m.branding_readonly_hint()}</p>
    {/if}

    <GroupTitle heading={m.branding_logo()}>
      {#snippet description()}
        {m.branding_logo_description()}
      {/snippet}
      {#snippet content()}
        {#if logoUrl}
          <div class="flex flex-col gap-3">
            <div class="flex h-32 w-full max-w-md items-center justify-center rounded-lg border bg-muted/30 p-4">
              <img src={logoUrl} alt={m.branding_logo()} class="max-h-full max-w-full object-contain" />
            </div>
            {#if canEdit}
              <div class="flex gap-2">
                <FileDropZone.Root
                  onUpload={handleLogoPicked}
                  onFileRejected={handleFileRejected}
                  accept={ACCEPTED_TYPES}
                  maxFiles={1}
                  maxFileSize={MAX_SOURCE_BYTES}
                  disabled={busy}>
                  <FileDropZone.Trigger>
                    <Button variant="outline" size="sm" disabled={busy}>
                      <ImageIcon class="size-4" />
                      {m.branding_logo_replace()}
                    </Button>
                  </FileDropZone.Trigger>
                </FileDropZone.Root>
                <Button variant="outline" size="sm" onclick={removeLogo} disabled={busy}>
                  {#if removingLogo}
                    <Spinner class="size-4" />
                  {:else}
                    <Trash2 class="size-4" />
                  {/if}
                  {m.branding_logo_remove()}
                </Button>
              </div>
            {/if}
          </div>
        {:else if canEdit}
          <div class="max-w-md">
            <FileDropZone.Root
              onUpload={handleLogoPicked}
              onFileRejected={handleFileRejected}
              accept={ACCEPTED_TYPES}
              maxFiles={1}
              maxFileSize={MAX_SOURCE_BYTES}
              disabled={busy}>
              <FileDropZone.Trigger />
            </FileDropZone.Root>
          </div>
        {:else}
          <p class="text-sm text-muted-foreground">{m.branding_logo_empty()}</p>
        {/if}
      {/snippet}
    </GroupTitle>

    <Separator />

    <GroupTitle heading={m.branding_color()}>
      {#snippet description()}
        {m.branding_color_description()}
      {/snippet}
      {#snippet content()}
        <div class="flex flex-wrap items-center gap-3">
          <!-- Default: sends primary_color = null so the backend uses its own blue. -->
          <button
            type="button"
            title={m.branding_color_default()}
            aria-label={m.branding_color_default()}
            aria-pressed={selectedColor === null}
            disabled={!canEdit || busy}
            onclick={() => saveColor(null)}
            class="relative flex size-7 items-center justify-center rounded-md ring-offset-2 ring-offset-background transition-shadow disabled:cursor-not-allowed disabled:opacity-60 {selectedColor ===
            null
              ? 'ring-2 ring-ring'
              : 'ring-1 ring-border hover:ring-ring/60'}"
            style="background-color: {DEFAULT_COLOR}">
            {#if selectedColor === null}
              <Check class="size-3.5 text-white" />
            {/if}
          </button>

          <div class="h-5 w-px bg-border"></div>

          {#each PRESET_COLORS as color (color)}
            <button
              type="button"
              title={color}
              aria-label={color}
              aria-pressed={selectedColor === color}
              disabled={!canEdit || busy}
              onclick={() => saveColor(color)}
              class="relative flex size-7 items-center justify-center rounded-md ring-offset-2 ring-offset-background transition-shadow disabled:cursor-not-allowed disabled:opacity-60 {selectedColor ===
              color
                ? 'ring-2 ring-ring'
                : 'ring-1 ring-border hover:ring-ring/60'}"
              style="background-color: {color}">
              {#if selectedColor === color}
                <Check class="size-3.5 text-white" />
              {/if}
            </button>
          {/each}

          {#if customColor}
            <button
              type="button"
              title={customColor}
              aria-label={customColor}
              aria-pressed={true}
              disabled={!canEdit || busy}
              onclick={() => saveColor(customColor)}
              class="relative flex size-7 items-center justify-center rounded-md ring-2 ring-ring ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              style="background-color: {customColor}">
              <Check class="size-3.5 text-white" />
            </button>
          {/if}

          {#if savingColor}
            <Spinner class="size-4 text-muted-foreground" />
          {/if}
        </div>
      {/snippet}
    </GroupTitle>
  </div>
{/if}
