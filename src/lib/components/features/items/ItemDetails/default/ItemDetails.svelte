<!--
  @component ItemDetails
  @description Fetches and displays item details. Provides item data to page state
  so other snippets on the same page (e.g. sidebar) can consume it without a second request.
  @keywords item, details, form
  @api GET /api/legal-entities/{legalEntity}/items/{item} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { ItemDetailsContract as contract } from './ItemDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import CountryField from '$components/core/form/CountryField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import StatusSelector, { type StatusOption } from '$components/core/form/StatusSelector.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import CommodityCodeSelector from '$components/features/form/CommodityCodeSelector.svelte'
  import ProductFamilySelector from '$components/features/form/ProductFamilySelector.svelte'
  import ProductLineSelector from '$components/features/form/ProductLineSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Item } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    abcClassLabels,
    currencyLabels,
    dimensionUnitLabels,
    itemCategoryConfig,
    itemStatusConfig,
    toSelectItems,
    unitOfMeasureLabels,
    weightUnitLabels,
  } from '$lib/utils/enum-labels'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import { ItemDetailsContract } from './ItemDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['items'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const itemHandle = useProvides(ItemDetailsContract, 'item')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Item>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<Item>(`/legal-entities/${legalEntityId}/items/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/items`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { item_category, code, ...data }) => api.put(`/legal-entities/${legalEntityId}/items/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'item-details', params: { uuid: record.id } }),
    onFetched: data => {
      itemHandle.set(data)
      breadcrumbTitle.set(data.name || data.code)
    },
    cleanup: () => {
      itemHandle.unset()
      breadcrumbTitle.clear()
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)

  const initialValues = $derived.by(() => ({
    item_category: 'finished_good' as const,
    item_status: 'active' as const,
    code: '',
    alternative_code: '',
    name: '',
    description: '',
    image: '',
    upc_ean_code: '',
    abc_class: null,
    product_family_id: '',
    product_line_id: '',
    commodity_code_id: '',
    primary_uom: null,
    secondary_uom: null,
    uom_conversion_factor: 0,
    gross_weight: 0,
    net_weight: 0,
    weight_uom: null,
    length: 0,
    width: 0,
    height: 0,
    dimension_uom: null,
    standard_cost: 0,
    cost_currency: null,
    country_of_origin: '',
    hs_tariff_code: '',
    notes: '',
    ...(record
      ? {
          ...record,
          product_family_id: record.product_family?.id ?? '',
          product_line_id: record.product_line?.id ?? '',
          commodity_code_id: record.commodity_code?.id ?? '',
        }
      : {}),
  }))

  const categoryItems = Object.entries(itemCategoryConfig).map(([value, cfg]) => ({ value, label: cfg.label() }))

  const statusVariants: Record<string, StatusOption['variant']> = {
    active: 'active',
    inactive: 'paused',
    obsolete: 'neutral',
  }

  const itemStatuses: StatusOption[] = Object.entries(itemStatusConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label(),
    variant: statusVariants[value] ?? 'neutral',
  }))

  const abcClassItems = toSelectItems(abcClassLabels)
  const uomItems = toSelectItems(unitOfMeasureLabels)
  const weightUnitItems = toSelectItems(weightUnitLabels)
  const dimensionUnitItems = toSelectItems(dimensionUnitLabels)
  const currencyItems = toSelectItems(currencyLabels)

  const validateCreate = v
    .schema<Partial<Item>>({
      item_category: [v.required()],
      item_status: [v.required()],
      name: [v.required()],
    })
    .build()

  const validateUpdate = v.schema<Partial<Item>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      {resourceConfig}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-6 pb-breadcrumbs">
      {#snippet withContext()}
        <FormErrorMessage columnsLayout />

        <GroupTitle heading={m.item_general_information()}>
          {#snippet description()}
            {m.item_general_information_description()}
          {/snippet}

          {#snippet content()}
            <SelectField
              name="item_category"
              label={m.item_category()}
              items={categoryItems}
              class={FormFieldClass.MinWidth}
              disabled={!!record} />

            <div class={FormFieldClass.MaxWidth}>
              <StatusSelector
                name="item_status"
                label={m.status()}
                statuses={itemStatuses}
                class={FormFieldClass.MinWidth}
                allowClear={false} />
            </div>

            <TextField name="code" label={m.code()} class={FormFieldClass.MaxWidth} disabled />
            <TextField name="alternative_code" label={m.alternative_code()} class={FormFieldClass.MaxWidth} />
            <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />
            <TextField name="description" label={m.description()} class={FormFieldClass.MaxWidth} />
            <TextField name="upc_ean_code" label={m.upc_ean_code()} class={FormFieldClass.MaxWidth} />

            <RichEditorField name="notes" label={m.notes()} width={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.item_product_information()}>
          {#snippet description()}
            {m.item_product_information_description()}
          {/snippet}

          {#snippet content()}
            <ProductFamilySelector attr={record?.product_family ?? undefined} class={FormFieldClass.MaxWidth} />

            <ProductLineSelector attr={record?.product_line ?? undefined} class={FormFieldClass.MaxWidth} />

            <CommodityCodeSelector attr={record?.commodity_code ?? undefined} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.item_measurements()}>
          {#snippet description()}
            {m.item_measurements_description()}
          {/snippet}

          {#snippet content()}
            <SelectField name="abc_class" label={m.abc_class()} items={abcClassItems} class={FormFieldClass.MinWidth} />

            <SelectField name="primary_uom" label={m.primary_uom()} items={uomItems} class={FormFieldClass.MaxWidth} />
            <SelectField
              name="secondary_uom"
              label={m.secondary_uom()}
              items={uomItems}
              class={FormFieldClass.MaxWidth} />
            <NumberField
              name="uom_conversion_factor"
              label={m.uom_conversion_factor()}
              class={FormFieldClass.MaxWidth} />

            <NumberField name="gross_weight" label={m.gross_weight()} class={FormFieldClass.MaxWidth} />
            <NumberField name="net_weight" label={m.net_weight()} class={FormFieldClass.MaxWidth} />
            <SelectField
              name="weight_uom"
              label={m.weight_uom()}
              items={weightUnitItems}
              class={FormFieldClass.MaxWidth} />

            <NumberField name="length" label={m.item_length()} class={FormFieldClass.MaxWidth} />
            <NumberField name="width" label={m.item_width()} class={FormFieldClass.MaxWidth} />
            <NumberField name="height" label={m.item_height()} class={FormFieldClass.MaxWidth} />

            <SelectField
              name="dimension_uom"
              label={m.dimension_uom()}
              items={dimensionUnitItems}
              class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <GroupTitle heading={m.item_cost_information()}>
          {#snippet description()}
            {m.item_cost_information_description()}
          {/snippet}

          {#snippet content()}
            <NumberField name="standard_cost" label={m.standard_cost()} class={FormFieldClass.MaxWidth} />

            <SelectField
              name="cost_currency"
              label={m.cost_currency()}
              items={currencyItems}
              class={FormFieldClass.MinWidth} />

            <CountryField name="country_of_origin" label={m.country_of_origin()} class={FormFieldClass.MinWidth} />

            <TextField name="hs_tariff_code" label={m.hs_tariff_code()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
