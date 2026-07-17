<!--
  @component DashboardEditor
  @description Three-column editor for a legal entity configuration: the config tree,
  the selected node's form (or the raw JSON view), and the docked admin assistant.
  @keywords admin, legal entity, configuration, editor, dashboard, chat, assistant
  @uses Resizable, CodeMirrorField, NodeForm, ChatBox
-->
<script lang="ts">
  import CodeMirrorField from '$components/core/form/CodeMirrorField.svelte'
  import * as Resizable from '$components/ui/resizable'
  import { chatEnabled } from '$lib/chat/enabled'
  import { usePageChat } from '$lib/chat/hooks/usePageChat'
  import { chatStore, chatUi } from '$lib/chat/store'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
  import type { LegalEntity } from '$lib/types/api-types'
  import { getAtPath, getKind, updateAtPath } from '$lib/utils/config-tree'
  import { json } from '@codemirror/lang-json'
  import { ChatBox } from '@diaphora/chat'
  import { untrack } from 'svelte'
  import { formatConfigSummary, formatLegalEntity, formatSelection } from './admin-chat'
  import NodeForm from './forms/NodeForm.svelte'
  import MenusSection from './tree/MenusSection.svelte'
  import PagesSection from './tree/PagesSection.svelte'
  import PoliciesSection from './tree/PoliciesSection.svelte'
  import RawRootLink from './tree/RawRootLink.svelte'
  import ResourcesSection from './tree/ResourcesSection.svelte'
  import type { Path, Selection } from './types'

  const DOCK_ID = 'admin-dashboard-editor'

  type Props = {
    config: LegalEntityConfigResponse
    /** The entity being configured. Named in the assistant's context so it knows what it's editing. */
    legalEntity?: LegalEntity | null
    onchange?: (updated: LegalEntityConfigResponse) => void
  }

  let { config, legalEntity = null, onchange }: Props = $props()

  let selection = $state<Selection | null>(null)

  // Edits are applied locally first so the tree and the raw view stay in step with
  // each other between saves; `lastExternalJson` distinguishes our own echo (the
  // parent handing back what we just sent it) from a genuinely new config arriving
  // from the server, which must replace local state.
  // `untrack`: seeding from the prop's initial value is the intent — the $effect
  // below owns every subsequent sync.
  let liveConfig = $state<LegalEntityConfigResponse>(untrack(() => config))
  let lastExternalJson = $state(untrack(() => JSON.stringify(config)))

  $effect(() => {
    const currentJson = JSON.stringify(config)
    if (currentJson !== lastExternalJson) {
      lastExternalJson = currentJson
      liveConfig = config
    }
  })

  const jsonValue = $derived(JSON.stringify(liveConfig, null, 2))
  const selectedPath = $derived<Path | null>(selection?.type === 'node' ? selection.path : null)
  const selectedKind = $derived(selectedPath ? getKind(selectedPath) : null)
  const selectedNode = $derived(selectedPath ? getAtPath(liveConfig, selectedPath) : null)

  function handleSelect(path: Path) {
    selection = { type: 'node', path }
  }

  function handleNodeChange(newValue: unknown) {
    if (!selectedPath) return
    const updated = updateAtPath(liveConfig, selectedPath, () => newValue)
    liveConfig = updated
    lastExternalJson = JSON.stringify(updated)
    onchange?.(updated)
  }

  // Claim the assistant's server-side prompt while this editor is mounted, and feed
  // it the config it's talking about. `vars` is re-read on every send, so the model
  // always sees the current tree and selection rather than a mount-time snapshot.
  usePageChat({
    id: DOCK_ID,
    serverContextId: 'admin-assistant',
    vars: () => ({
      LEGAL_ENTITY: formatLegalEntity(legalEntity),
      CONFIG_SUMMARY: formatConfigSummary(liveConfig),
      SELECTION: formatSelection(selection),
    }),
  })

  // Render the conversation inline instead of floating. ChatMount watches the dock
  // owner and stands the floating surface down while we hold it.
  $effect(() => {
    if (!chatEnabled) return
    chatUi.claimDock(DOCK_ID)
    return () => chatUi.releaseDock(DOCK_ID)
  })
</script>

<Resizable.PaneGroup direction="horizontal" class="h-full min-h-96">
  <Resizable.Pane defaultSize={22} minSize={15}>
    <div class="h-full overflow-auto bg-muted/20 p-2">
      <RawRootLink selected={selection?.type === 'raw'} onSelect={() => (selection = { type: 'raw' })} />
      <PagesSection pages={liveConfig.dashboard.pages} {selectedPath} onSelect={handleSelect} />
      <MenusSection menus={liveConfig.dashboard.menus} {selectedPath} onSelect={handleSelect} />
      <ResourcesSection resources={liveConfig.resources} {selectedPath} onSelect={handleSelect} />
      <PoliciesSection policies={liveConfig.policies} {selectedPath} onSelect={handleSelect} />
    </div>
  </Resizable.Pane>

  <Resizable.Handle withHandle />

  <Resizable.Pane defaultSize={chatEnabled ? 48 : 78}>
    <div class="h-full overflow-auto p-4">
      {#if selection?.type === 'raw'}
        <CodeMirrorField
          readonly
          name="legal-entity-config-raw"
          label={m.admin_raw_root()}
          showLabel={false}
          value={jsonValue}
          lang={json()}
          minHeight="min-h-full"
          lineWrapping />
      {:else if selectedPath && selectedKind}
        <NodeForm path={selectedPath} kind={selectedKind} node={selectedNode} onChange={handleNodeChange} />
      {:else}
        <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
          {m.admin_editor_empty()}
        </div>
      {/if}
    </div>
  </Resizable.Pane>

  {#if chatEnabled}
    <Resizable.Handle withHandle />

    <Resizable.Pane defaultSize={30} minSize={20}>
      <div class="h-full border-l">
        {#if chatStore.chat}
          <ChatBox chatState={chatStore.chat} wrapped={false}>
            {#snippet empty()}
              <div class="flex h-full items-center justify-center px-10 text-center text-sm text-muted-foreground">
                {m.admin_assistant_welcome()}
              </div>
            {/snippet}
          </ChatBox>
        {/if}
      </div>
    </Resizable.Pane>
  {/if}
</Resizable.PaneGroup>
