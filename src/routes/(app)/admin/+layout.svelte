<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import LegalEntitySelector from '$components/features/form/LegalEntitySelector.svelte'
  import TenantLegalEntitySelector from '$components/features/tenant/TenantLegalEntitySelector.svelte'
  import Logo from '$components/icons/Logo.svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity } from '$lib/types/api-types'
  import { pushScaffoldConfig } from '$lib/utils/admin-config'
  import { switchLegalEntity } from '$lib/utils/legal-entity'
  import { buildVanityOrigin } from '$lib/utils/tenant'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import Database from '@tabler/icons-svelte/icons/database'
  import { setContext } from 'svelte'
  import type { LayoutProps } from '../$types'

  let { data, children }: LayoutProps = $props()
  let { entityConfig, legalEntity, user, shadowing, originTenantId } = $derived(data)

  const isSuperadmin = $derived(user?.is_superadmin ?? false)

  async function onLegalEntityChoose(entity: LegalEntity) {
    await switchLegalEntity(entity.id)
  }

  // Leaving shadow mode is a plain origin change: the tenant lives in the host, so
  // going home is going to the home host. Nothing to unset — the cookies belong to
  // the origin we're leaving behind.
  function exitShadow() {
    const homeVanity = user?.tenant?.vanity
    if (!homeVanity) return
    window.location.href = buildVanityOrigin(homeVanity, window.location)
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
        <!-- In shadow mode the logo turns alert-amber instead of brand-blue: a quiet,
             always-present signal that replaces the old banner without taking room.
             It also becomes the way back — click to return to the home tenant, with a
             tooltip spelling that out since the affordance isn't obvious on its own. -->
        <div class="flex items-center gap-2">
          {#if shadowing && user?.tenant}
            {@const homeName = user.tenant.name}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <button
                    {...props}
                    type="button"
                    onclick={exitShadow}
                    aria-label={m.shadow_mode_return({ home: homeName })}
                    class="flex items-center rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
                    <Logo class="size-5 text-amber-500" />
                  </button>
                {/snippet}
              </Tooltip.Trigger>
              <Tooltip.Content>{m.shadow_mode_return({ home: homeName })}</Tooltip.Content>
            </Tooltip.Root>
          {:else}
            <Logo class="size-5 text-brand" />
          {/if}
          <div class="cursor-default">
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
