<!--
  @component SupplierContactDetails
  @description Fetches and displays supplier contact details. Handles both create and update.
  Provides supplier data to page state so other snippets (e.g. SupplierSidebar) can consume it.
  @keywords supplier, contact, details, form, upsert
  @api GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/contacts/{contact} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/suppliers/{supplier}/contacts (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/suppliers/{supplier}/contacts/{contact} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierContactDetailsContract as contract } from './SupplierContactDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Supplier, SupplierContact } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { supplierContactTypeConfig } from '$lib/utils/enum-labels'
  import { api } from '$utils/request.js'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { SupplierContactDetailsContract } from './SupplierContactDetails.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const uuid = $derived(pageDetails.params.cid)
  const supplierId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const supplierHandle = useProvides(SupplierContactDetailsContract, 'supplier')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && supplierId) {
      const supplier = await api.get<Supplier>(`/legal-entities/${legalEntityId}/suppliers/${supplierId}`)
      supplierHandle.set(supplier)
    }
  })

  onDestroy(() => supplierHandle.unset())

  const detail = useDetailRecord<SupplierContact>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<SupplierContact>(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/contacts/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/contacts`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/suppliers/${supplierId}/contacts/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'supplier-contact-details', params: { uuid: record.id } }),
    onFetched: data => {
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
    type: 'primary' as const,
    name: '',
    job_title: '',
    phone: '',
    mobile_phone: '',
    email: '',
    ...(record ?? {}),
  }))

  const typeItems = Object.entries(supplierContactTypeConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))

  const validateCreate = v
    .schema<Partial<SupplierContact>>({
      type: [v.required()],
      name: [v.required()],
      job_title: [v.required()],
      phone: [v.required()],
      email: [v.required(), v.email()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<SupplierContact>>({
      email: [v.email()],
    })
    .build()

  const validate = $derived(!record ? validateCreate : validateUpdate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-4 pb-breadcrumbs">
      {#snippet withContext()}
        <FormErrorMessage />

        <SelectField
          name="type"
          label={m.type()}
          items={typeItems}
          class={FormFieldClass.MinWidth} />

        <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="job_title" label={m.job_title()} class={FormFieldClass.MaxWidth} />
        <TextField name="email" label={m.email()} class={FormFieldClass.MaxWidth} />
        <TextField name="phone" label={m.phone()} class={FormFieldClass.MaxWidth} />
        <TextField name="mobile_phone" label={m.mobile_phone()} class={FormFieldClass.MaxWidth} />
      {/snippet}

      {#snippet bottom()}
        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
