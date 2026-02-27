<script lang="ts">
  import Logo from '$components/icons/Logo.svelte'
  import Button from '$components/ui/button/button.svelte'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  import LegalEntitySelector from '$lib/components/features/form/LegalEntitySelector.svelte'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity } from '$lib/types/api-types'
  import { pushScaffoldConfig } from '$lib/utils/admin-config'
  import { switchLegalEntity } from '$lib/utils/legal-entity'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import Database from '@tabler/icons-svelte/icons/database'
  import { setContext } from 'svelte'
  import type { PageProps } from '../$types'

  let { data, children }: PageProps & { children?: () => any } = $props()
  let { pageDetails, routeDetails, entityConfig, legalEntity, user } = $derived(data)

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

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails,
    routeDetails,
    entityConfig,
    legalEntity,
    user,
  }))
</script>

<div class="flex min-h-0 flex-1 flex-col" data-scrollable-content>
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
    </div>

    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" onclick={onScaffoldClick}>
        <Database />
      </Button>

      <LegalEntitySelector
        attr={legalEntity || undefined}
        showLabel={false}
        width="w-64"
        onChoose={onLegalEntityChoose} />
    </div>
  </header>

  <main class="flex min-h-0 flex-1">
    {@render children?.()}
  </main>
</div>
