<!--
  @component WarehouseBinDetails
  @description Fetches and displays warehouse bin details for create/edit.
  Uses useDetailRecord for lifecycle management and FormUtil for form state.
  @keywords warehouse, bin, zone, details, form, settings
  @api GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins/{bin} (Moddo API)
  @api POST /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins (Moddo API)
  @api PUT /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins/{bin} (Moddo API)
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
  import type { LegalEntity, WarehouseBin } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { binLocationTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'

  let {
    legalEntity,
    warehouseId,
    zoneId,
    bid,
  }: { legalEntity?: LegalEntity | null; warehouseId?: string; zoneId?: string; bid?: string } = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const breadcrumbTitle = useBreadcrumbTitle()

  const locationTypeItems = toSelectItems(binLocationTypeLabels)

  const detail = useDetailRecord<WarehouseBin>({
    getUuid: () => bid,
    fetch: (id) =>
      api.safe.get<WarehouseBin>(
        `/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones/${zoneId}/bins/${id}`,
      ),
    create: (data) =>
      api.post(`/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones/${zoneId}/bins`, { data }),
    update: (id, data) =>
      api.put(
        `/legal-entities/${legalEntityId}/warehouses/${warehouseId}/zones/${zoneId}/bins/${id}`,
        { data },
      ),
    getDetailRoute: (record) =>
      `/settings/warehouses/upsert/${warehouseId}/zones/${zoneId}/bins/upsert/${record.id}`,
    onFetched: (data) => {
      breadcrumbTitle.set(data.code)
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
    location_type: 'shelf' as WarehouseBin['location_type'],
    max_weight_kg: 0,
    max_volume_m3: 0,
    is_active: true,
    is_default: false,
    ...(record ?? {}),
  }))

  const validateCreate = v
    .schema<Partial<WarehouseBin>>({
      code: [v.required(), v.maxLength(50)],
      location_type: [v.required()],
    })
    .build()

  const validateUpdate = v
    .schema<Partial<WarehouseBin>>({
      code: [v.maxLength(50)],
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
          name="location_type"
          label={m.location_type()}
          items={locationTypeItems}
          class={FormFieldClass.MinWidth} />
        <TextField name="max_weight_kg" label={m.max_weight_kg()} class={FormFieldClass.MinWidth} />
        <TextField name="max_volume_m3" label={m.max_volume_m3()} class={FormFieldClass.MinWidth} />
        <SwitchField name="is_active" label={m.is_active()} />
        <SwitchField name="is_default" label={m.is_default()} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
