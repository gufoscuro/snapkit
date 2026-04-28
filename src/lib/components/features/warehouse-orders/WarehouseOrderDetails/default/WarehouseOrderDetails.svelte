<!--
  @component WarehouseOrderDetails
  @description Fetches and displays warehouse order details for create/edit.
  Provides warehouse order data to page state so other snippets on the same page
  (e.g. sidebar) can consume it without a second request.
  @keywords warehouse-order, details, form, warehouse, picking
  @api GET /api/legal-entities/{legalEntity}/warehouse-orders/{warehouseOrder}
  @api POST /api/legal-entities/{legalEntity}/warehouse-orders
  @api PUT /api/legal-entities/{legalEntity}/warehouse-orders/{warehouseOrder}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { WarehouseOrderDetailsContract as contract } from './WarehouseOrderDetails.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionButton from '$components/core/DownloadActionButton.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import CarrierSelector, { type CarrierSummary } from '$components/features/form/CarrierSelector.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import WarehouseOrderItemsListEditor from '$components/features/form/WarehouseOrderItemsListEditor.svelte'
  import WarehouseSelector, { type WarehouseSummary } from '$components/features/form/WarehouseSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createWarehouseOrderActions,
    type WarehouseOrderActionOptions,
  } from '$components/features/warehouse-orders/warehouse-order-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { WarehouseOrder } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    incotermLabels,
    salesTransactionTypeLabels,
    shippingMethodLabels,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { WarehouseOrderDetailsContract } from './WarehouseOrderDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['warehouse-orders'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const warehouseOrderHandle = useProvides(WarehouseOrderDetailsContract, 'warehouseOrder')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<WarehouseOrder>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<WarehouseOrder>(`/legal-entities/${legalEntityId}/warehouse-orders/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/warehouse-orders`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/warehouse-orders/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'warehouse-order-details', params: { uuid: record.id } }),
    onUpdated: data => {
      warehouseOrderHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_warehouse_order())
    },
    onCreateMode: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_warehouse_order())
    },
    cleanup: () => {
      warehouseOrderHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  const isReadOnly = $derived(!!record && record.state !== 'open')

  const warehouseOrderActions = $derived(
    legalEntityId
      ? createWarehouseOrderActions({
          legalEntityId,
          onSuccess: detail.refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onArchived: () => goto(createRoute({ $id: 'warehouse-orders' })),
        })
      : [],
  )
  const actionOptions = $derived.by((): WarehouseOrderActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      availableTransitions: record.available_transitions ?? [],
      isArchivable: record.is_archivable,
    }
  })
  const handOverAction = $derived(warehouseOrderActions.find(a => a.id === 'hand-over'))

  type FormFieldUpdater = (name: string, value: unknown) => void

  function handleCustomerChange(_item: { value?: unknown } | undefined, updateField: FormFieldUpdater) {
    updateField('ship_to_address_id', '')
  }

  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = toSelectItems(salesTransactionTypeLabels)
  const shippingMethodItems = toSelectItems(shippingMethodLabels)

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: new Date().toISOString(),
    sales_transaction_type: undefined,
    customer_id: '',
    ship_to_address_id: '',
    warehouse_id: '',
    planned_ship_date: '',
    carrier_id: '',
    shipping_method: null,
    incoterm: undefined,
    incoterm_location: '',
    notes_internal: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<WarehouseOrder>>({
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      incoterm: [v.required({ field: m.incoterm() })],
      planned_ship_date: [v.required({ field: m.planned_ship_date() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<WarehouseOrder>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // Resolve customer snapshot for pre-populating selector in edit mode
  const customerAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.customer_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

  // Resolve ship-to address snapshot for pre-populating selector in edit mode
  const shipToAddressAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.ship_to_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

  // Warehouse and carrier are eager-loaded on the warehouse-order record — pass them directly to the selectors.
  const warehouseAttr = $derived<WarehouseSummary | undefined>(
    record?.warehouse
      ? { id: record.warehouse.id, code: record.warehouse.code, description: record.warehouse.description }
      : undefined,
  )
  const carrierAttr = $derived<CarrierSummary | undefined>(
    record?.carrier
      ? { id: record.carrier.id, name: record.carrier.name, trade_name: record.carrier.trade_name }
      : undefined,
  )
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      {resourceConfig}
      locked={isReadOnly}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-6 pb-breadcrumbs">
      {#snippet withContext(formAPI)}
        <FormErrorMessage columnsLayout />

        <!-- General Information -->
        <GroupTitle heading={m.warehouse_order_general_information()}>
          {#snippet description()}
            {m.warehouse_order_general_information_description()}
          {/snippet}

          {#snippet content()}
            {#if !!record}
              <TextField name="document_number" label={m.document_number()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

            <DateField name="document_date" label={m.document_date()} class={FormFieldClass.MaxWidth} allowClear />

            <SelectField
              name="sales_transaction_type"
              label={m.sales_transaction_type()}
              items={transactionTypeItems}
              class={FormFieldClass.MaxWidth} />

            <CustomerSelector
              name="customer_id"
              attr={customerAttr
                ? {
                    id: record?.customer_id as string,
                    name: customerAttr.name as string,
                    vat_no: '',
                    categories: [],
                    default_currency: '',
                    emails: [],
                    phones: [],
                  }
                : undefined}
              onChange={item => handleCustomerChange(item, formAPI.updateField as FormFieldUpdater)}
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />

            <CustomerAddressSelector
              customerId={formAPI.values.customer_id}
              attr={shipToAddressAttr
                ? {
                    id: record?.ship_to_address_id as string,
                    type: (shipToAddressAttr.type as 'billing' | 'shipping' | 'legal') ?? 'shipping',
                    is_default: (shipToAddressAttr.is_default as boolean) ?? false,
                    address_line_1: (shipToAddressAttr.address_line_1 as string) ?? '',
                    address_line_2: (shipToAddressAttr.address_line_2 as string) ?? '',
                    city: (shipToAddressAttr.city as string) ?? '',
                    province: (shipToAddressAttr.province as string) ?? '',
                    region: (shipToAddressAttr.region as string) ?? '',
                    postal_code: (shipToAddressAttr.postal_code as string) ?? '',
                    country_code: (shipToAddressAttr.country_code as string) ?? '',
                    receiving_hours: (shipToAddressAttr.receiving_hours as string) ?? '',
                    delivery_instructions: (shipToAddressAttr.delivery_instructions as string) ?? '',
                    warehouse_assignment: (shipToAddressAttr.warehouse_assignment as string) ?? '',
                    version: (shipToAddressAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />

            <WarehouseSelector name="warehouse_id" attr={warehouseAttr} class={FormFieldClass.MaxWidth} />

            <DateField name="planned_ship_date" label={m.planned_ship_date()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Shipping -->
        <GroupTitle heading={m.warehouse_order_shipping()}>
          {#snippet description()}
            {m.warehouse_order_shipping_description()}
          {/snippet}

          {#snippet content()}
            <CarrierSelector name="carrier_id" attr={carrierAttr} class={FormFieldClass.MaxWidth} />

            <SelectField
              name="shipping_method"
              label={m.shipping_method()}
              items={shippingMethodItems}
              class={FormFieldClass.MinWidth} />

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.warehouse_order_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.warehouse_order_line_items_description()}
          {/snippet}

          {#snippet content()}
            <WarehouseOrderItemsListEditor
              name="items"
              showLabel={false}
              {legalEntityId}
              customerId={formAPI?.values?.customer_id}
              salesTransactionType={formAPI?.values?.sales_transaction_type}
              incoterm={formAPI?.values?.incoterm}
              required={!record}
              refreshKey={record?.version} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes -->
        <GroupTitle heading={m.warehouse_order_notes_section()}>
          {#snippet description()}
            {m.warehouse_order_notes_section_description()}
          {/snippet}

          {#snippet content()}
            <RichEditorField
              name="notes_internal"
              label={m.notes_internal()}
              width="{FormFieldClass.MaxWidth} {FormFieldClass.MinWidth}" />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          {#if !record}
            <BusyButton type="submit">{m.save_changes()}</BusyButton>
          {:else}
            {#if actionOptions}
              <RecordActionMenu buttonVariant="outline" actions={warehouseOrderActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/warehouse-orders/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            {#if record.state === 'open'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if handOverAction && actionOptions}
              <RecordActionButton action={handOverAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
