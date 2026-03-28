<!--
  @component WarehouseDetails
  @description Fetches and displays warehouse details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords warehouse, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/warehouses (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/warehouses/{warehouse} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, LegalEntityWarehouse } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { toSelectItems, valuationMethodLabels, warehouseTypeLabels } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'

  let { legalEntity, uuid, pageId }: { legalEntity?: LegalEntity | null; uuid?: string; pageId?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const warehouseTypeItems = toSelectItems(warehouseTypeLabels)
  const valuationMethodItems = toSelectItems(valuationMethodLabels)

  const detail = useDetailRecord<LegalEntityWarehouse>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<LegalEntityWarehouse>(`/legal-entities/${legalEntityId}/warehouses/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/warehouses`, { data }),
    update: (id, data) => api.put(`/legal-entities/${legalEntityId}/warehouses/${id}`, { data }),
    getDetailRoute: record => `/settings/warehouses/upsert/${record.id}`,
    onFetched: data => {
      if (pageId) breadcrumbTitle.setLabel(pageId, data.code)
    },
    cleanup: () => {
      if (pageId) breadcrumbTitle.clearLabel(pageId)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    code: '',
    description: '',
    warehouse_type: 'main' as LegalEntityWarehouse['warehouse_type'],
    is_negative_allowed: false,
    valuation_method: 'weighted_average' as LegalEntityWarehouse['valuation_method'],
    is_active: true,
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<LegalEntityWarehouse>>({
      code: [v.required(), v.maxLength(50)],
      description: [v.required(), v.maxLength(255)],
      warehouse_type: [v.required()],
      valuation_method: [v.required()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<LegalEntityWarehouse>>({
      code: [v.maxLength(50)],
      description: [v.maxLength(255)],
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
      class="flex flex-col gap-4">
      {#snippet withContext()}
        <FormErrorMessage />

        <TextField name="code" label={m.code()} class={FormFieldClass.MaxWidth} focus={!record} />
        <TextField name="description" label={m.description()} class={FormFieldClass.MaxWidth} />
        <SelectField
          name="warehouse_type"
          label={m.warehouse_type()}
          items={warehouseTypeItems}
          class={FormFieldClass.MinWidth} />
        <SelectField
          name="valuation_method"
          label={m.valuation_method()}
          items={valuationMethodItems}
          class={FormFieldClass.MinWidth} />
        <SwitchField name="is_negative_allowed" label={m.is_negative_allowed()} />
        <SwitchField name="is_active" label={m.is_active()} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
