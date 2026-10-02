<!--
  @component DashboardOverridesPanel
  @description Admin panel for the dashboard overrides of a legal entity (`dashboard.overrides`
  in its config): lists each override with whether it still applies to the current default
  scaffold — i.e. what the next "initialize configuration" push will do — and lets superadmins
  edit them as JSON, with completion (keys, page $ids, slots, component keys, templates) and
  inline validation. Edits are validated (shape + known component keys) before saving; "save and
  apply" also pushes the scaffold, behind the same confirmation as the header action.
  @keywords admin, overrides, scaffold, configuration, customization, dashboard, legal entity, json
-->
<script lang="ts">
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CodeMirrorField from '$components/core/form/CodeMirrorField.svelte'
  import { Badge } from '$components/ui/badge'
  import { Button } from '$components/ui/button'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  import {
    applyOverrides,
    describeOverride,
    getStoredOverrides,
    type OverrideError,
    parseOverrides,
    UnresolvedReason,
  } from '$lib/config/dashboard-overrides'
  // Direct import, not the barrel: keeps CodeMirror out of everything that imports admin-config.
  import { overridesEditorExtensions } from '$lib/config/dashboard-overrides/editor'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import {
    notifyUnresolvedOverrides,
    pushScaffoldConfig,
    saveDashboardOverrides,
    scaffoldDashboardStructure,
  } from '$lib/utils/admin-config'
  import { json } from '@codemirror/lang-json'
  import { toast } from 'svelte-sonner'

  let { config, legalEntityId }: { config: LegalEntityConfigResponse | null; legalEntityId?: string } = $props()

  const reasonLabels: Record<UnresolvedReason, () => string> = {
    [UnresolvedReason.PageNotFound]: m.dashboard_overrides_reason_page_not_found,
    [UnresolvedReason.SlotNotFound]: m.dashboard_overrides_reason_slot_not_found,
    [UnresolvedReason.PageExists]: m.dashboard_overrides_reason_page_exists,
  }

  const overrides = $derived(getStoredOverrides(config))

  // The scaffold is static code: computed once, it is both what overrides are checked
  // against and the vocabulary the editor completes from (page $ids, slots).
  const scaffold = scaffoldDashboardStructure().dashboard
  const editorExtensions = overridesEditorExtensions(scaffold)

  // Checked against the scaffold, not the stored pages: what matters is whether the next
  // push can still apply each override. `unresolved` keeps the original objects, so they
  // can be matched back by identity.
  const unresolvedReasons = $derived(
    new Map(applyOverrides(scaffold, overrides).unresolved.map(u => [u.override, u.reason] as const)),
  )

  let editing = $state(false)
  let draft = $state('')
  let errors = $state<OverrideError[]>([])
  let saving = $state(false)

  function startEditing() {
    draft = JSON.stringify(overrides, null, 2)
    errors = []
    editing = true
  }

  async function save(apply: boolean) {
    if (!legalEntityId) return
    const parsed = parseOverrides(draft)
    if (!parsed.ok) {
      errors = parsed.errors
      toast.error(m.dashboard_overrides_invalid())
      return
    }
    errors = []

    saving = true
    try {
      await saveDashboardOverrides(legalEntityId, parsed.overrides)
    } catch {
      toast.error(m.dashboard_overrides_save_error())
      return
    } finally {
      saving = false
    }
    editing = false

    if (!apply) {
      toast.success(m.dashboard_overrides_saved(), { description: m.dashboard_overrides_pending_hint() })
      return
    }
    // Same operation as the header's "initialize configuration": same confirmation.
    const entityId = legalEntityId
    confirmArchive({
      title: m.scaffold_config_confirm_title(),
      description: m.scaffold_config_confirm_description(),
      confirmText: m.scaffold_config_confirm_text(),
      cancelText: m.common_cancel(),
      loadingText: m.scaffold_config_loading_text(),
      onArchive: async () => {
        notifyUnresolvedOverrides(await pushScaffoldConfig(entityId))
      },
      successMessage: m.scaffold_config_success(),
      errorMessage: m.scaffold_config_error(),
    })
  }
</script>

<section class="space-y-3 border-b p-4">
  <div class="flex items-start justify-between gap-4">
    <div class="space-y-1">
      <h2 class="text-sm font-semibold">{m.dashboard_overrides_title()}</h2>
      <p class="text-xs text-muted-foreground">{m.dashboard_overrides_description()}</p>
    </div>
    {#if !editing && legalEntityId}
      <Button variant="outline" size="sm" onclick={startEditing}>{m.dashboard_overrides_edit()}</Button>
    {/if}
  </div>

  {#if editing}
    <CodeMirrorField
      name="dashboard-overrides-editor"
      label={m.dashboard_overrides_title()}
      showLabel={false}
      bind:value={draft}
      lang={json()}
      extensions={editorExtensions}
      lineWrapping
      minHeight="min-h-40 max-h-96 overflow-y-auto" />

    {#if errors.length > 0}
      <ul class="space-y-0.5 text-xs text-destructive">
        {#each errors as error, index (index)}
          <li class="font-mono">{error.path || '/'}: {error.message}</li>
        {/each}
      </ul>
    {/if}

    <div class="flex justify-end gap-2">
      <Button variant="outline" size="sm" onclick={() => (editing = false)}>{m.cancel()}</Button>
      <BusyButton type="button" variant="outline" size="sm" busy={saving} onclick={() => save(false)}>
        {m.dashboard_overrides_save()}
      </BusyButton>
      <BusyButton type="button" size="sm" busy={saving} onclick={() => save(true)}
        >{m.dashboard_overrides_save_apply()}</BusyButton>
    </div>
  {:else if overrides.length === 0}
    <p class="text-sm text-muted-foreground">{m.dashboard_overrides_empty()}</p>
  {:else}
    <ul class="divide-y rounded-xl border bg-card">
      {#each overrides as override, index (index)}
        {@const reason = unresolvedReasons.get(override)}
        <li class="flex items-start justify-between gap-3 px-4 py-2.5">
          <div class="min-w-0 space-y-0.5">
            <p class="truncate font-mono text-xs">{describeOverride(override)}</p>
            {#if override.reason}
              <p class="text-xs text-muted-foreground">{override.reason}</p>
            {/if}
          </div>
          {#if reason}
            <Badge variant="destructive">{reasonLabels[reason]()}</Badge>
          {:else}
            <Badge variant="secondary">{m.dashboard_overrides_status_ok()}</Badge>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
