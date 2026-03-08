<!--
  @component ProductFamilyDetails
  @description Fetches and displays product family details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords product-family, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/product-families/{productFamily} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/product-families (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/product-families/{productFamily} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import TextareaField from '$components/core/form/TextareaField.svelte'
  import { v } from '$components/core/form/validation'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, ProductFamily } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { api } from '$lib/utils/request'

  let { legalEntity, uuid }: { legalEntity?: LegalEntity | null; uuid?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<ProductFamily>({
    getUuid: () => uuid,
    fetch: (id) => api.safe.get<ProductFamily>(`/legal-entities/${legalEntityId}/product-families/${id}`),
    create: (data) => api.post(`/legal-entities/${legalEntityId}/product-families`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/product-families/${id}`, { data }),
    getDetailRoute: (record) => `/settings/product-families/upsert/${record.id}`,
    onFetched: (data) => {
      breadcrumbTitle.set(data.name)
    },
    cleanup: () => {
      breadcrumbTitle.clear()
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    code: '',
    name: '',
    description: '',
    is_active: true,
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<ProductFamily>>({
      code: [v.required(), v.maxLength(255)],
      name: [v.required(), v.maxLength(255)],
      description: [v.maxLength(255)],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<ProductFamily>>({
      code: [v.maxLength(255)],
      name: [v.maxLength(255)],
      description: [v.maxLength(255)],
    })
    .build()

  const validate = $derived(!!record ? validateUpdate : validateCreate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="flex flex-col gap-4">
      {#snippet withContext()}
        <FormErrorMessage />

        <TextField name="code" label={m.code()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} />
        <TextareaField name="description" label={m.description()} class={FormFieldClass.MaxWidth} rows={3} />
        <SwitchField name="is_active" label={m.active()} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
