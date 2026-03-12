<!--
  @component WarehouseZoneDetails
  @description Fetches and displays warehouse zone details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords warehouse, zone, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone} (Moddo API)
-->
<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntity, WarehouseZone } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { toSelectItems, zoneTypeLabels } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'

  let {
    legalEntity,
    warehouseId,
    tid,
  }: { legalEntity?: LegalEntity | null; warehouseId?: string; tid?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const zoneTypeItems = toSelectItems(zoneTypeLabels)

  const detail = useDetailRecord<WarehouseZone>({
    getUuid: () => tid,
    fetch: (id) =>
      api.safe.get<WarehouseZone>(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones/${id}`),
    create: (data) => api.post(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones`, { data }),
    update: (id, data) =>
      api.put(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones/${id}`, { data }),
    getDetailRoute: (record) => `/settings/warehouses/upsert/${warehouseId}/zones/upsert/${record.id}`,
    onFetched: (data) => {
      breadcrumbTitle.set(data.description)
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
    description: '',
    zone_type: 'storage' as WarehouseZone['zone_type'],
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<WarehouseZone>>({
      code: [v.required(), v.maxLength(50)],
      description: [v.required(), v.maxLength(255)],
      zone_type: [v.required()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<WarehouseZone>>({
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
          name="zone_type"
          label={m.zone_type()}
          items={zoneTypeItems}
          class={FormFieldClass.MinWidth} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
