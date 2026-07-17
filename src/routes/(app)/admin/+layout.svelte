<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import LegalEntitySelector from '$components/features/form/LegalEntitySelector.svelte'
  import ShadowModeIndicator from '$components/features/tenant/ShadowModeIndicator.svelte'
  import TenantLegalEntitySelector from '$components/features/tenant/TenantLegalEntitySelector.svelte'
  import Logo from '$components/icons/Logo.svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity } from '$lib/types/api-types'
  import { pushScaffoldConfig } from '$lib/utils/admin-config'
  import { switchLegalEntity } from '$lib/utils/legal-entity'
  import { getCurrentVanity } from '$lib/utils/tenant'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import Database from '@tabler/icons-svelte/icons/database'
  import { setContext } from 'svelte'
  import type { LayoutProps } from '../$types'

  let { data, children }: LayoutProps = $props()
  let { entityConfig, legalEntity, user, shadowing, originTenantId } = $derived(data)

  const isSuperadmin = $derived(user?.is_superadmin ?? false)
  const currentVanity = $derived(getCurrentVanity())

  async function onLegalEntityChoose(entity: LegalEntity) {
    await switchLegalEntity(entity.id)
  }

  function onScaffoldClick() {
    if (!legalEntity?.id) return

    const entityId = legalEntity.id
    confirmArchive({
      title: m.scaffold_config_confirm_title(),
      description: m.scaffold_config_confirm_description(),
      confirmText: m.scaffold_config_confirm_text(),
      cancelText: m.common_cancel(),
      loadingText: m.scaffold_config_loading_text(),
      onArchive: async () => {
        await pushScaffoldConfig(entityId)
      },
      successMessage: m.scaffold_config_success(),
      errorMessage: m.scaffold_config_error(),
    })
  }

  // Admin section is a static layout that doesn't go through the dynamic page registry,
  // so pageDetails/routeDetails aren't populated from the load. We satisfy the SnippetProps
  // shape with a cast — admin snippets don't read these fields.
  setContext<SnippetPropsGetter>(
    SNIPPET_PROPS_CONTEXT_KEY,
    () => ({ entityConfig, legalEntity, user }) as ReturnType<SnippetPropsGetter>,
  )
</script>

<div class="flex min-h-0 flex-1 flex-col" data-scrollable-content>
  <Tooltip.Provider delayDuration={0}>
    <header class="flex h-14 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div class="flex items-center gap-4">
        <div class="flex cursor-default items-center gap-2">
          <Logo class="size-5 text-brand" />
          <div>
            Moddo<span class="font-semibold text-brand">Admin</span>
          </div>
        </div>

        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">Moddo</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Page>{m.administration()}</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>

        {#if shadowing && user?.tenant && currentVanity}
          <ShadowModeIndicator
            homeTenantName={user.tenant.name}
            homeVanity={user.tenant.vanity}
            actingAsVanity={currentVanity} />
        {/if}
      </div>

      <div class="flex items-center gap-2">
        <ActionButton variant="ghost" size="icon" tooltip={m.admin_init_config()} onclick={onScaffoldClick}>
          <Database />
        </ActionButton>

        {#if isSuperadmin}
          <TenantLegalEntitySelector
            selected={legalEntity}
            {originTenantId}
            class="w-64"
            onChooseLocal={onLegalEntityChoose} />
        {:else}
          <LegalEntitySelector
            attr={legalEntity || undefined}
            showLabel={false}
            width="w-64"
            onChoose={onLegalEntityChoose} />
        {/if}
      </div>
    </header>

    <main class="flex min-h-0 flex-1">
      {@render children?.()}
    </main>
  </Tooltip.Provider>
</div>
