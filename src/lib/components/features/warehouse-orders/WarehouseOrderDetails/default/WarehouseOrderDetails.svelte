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
  import { ImportMenu, ImportRecordPreview } from '$components/core/common/import-menu'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionButton from '$components/core/DownloadActionButton.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import { createImportedSnapshot } from '$components/core/form/imported-snapshot.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import CarrierSelector, { type CarrierSummary } from '$components/features/form/CarrierSelector.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import type { WarehouseOrderLineItem } from '$components/features/form/WarehouseOrderItemsListEditor.svelte'
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
  import type { BasicOption } from '$lib/utils/generics'
  import { generateId } from '$lib/utils/id'
  import { api, apiDownload, apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { extractSnapshotString, type SnapshotShape } from '$lib/utils/snapshots'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { SvelteSet } from 'svelte/reactivity'
  import { toast } from 'svelte-sonner'
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

  // Items editor ref + import-from-sales-orders flow
  let itemsEditorRef: WarehouseOrderItemsListEditor | undefined = $state()
  const customerSnapshotImport = createImportedSnapshot()
  const shipToSnapshotImport = createImportedSnapshot()

  type SalesOrderForImport = {
    id: string
    document_number: string
    document_date: string
    sales_transaction_type?: string
    customer_id: string
    customer_snapshot?: SnapshotShape
    ship_to_address_id?: string
    ship_to_snapshot?: SnapshotShape
    incoterm?: string
    incoterm_location?: string
    customer_purchase_order?: string
    customer_purchase_order_date?: string
    notes_internal?: string
    items?: SalesOrderItemForImport[]
  }

  type SalesOrderItemForImport = {
    id: string
    type: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    quantity: number
    uom: string
    /** Per-line remaining importable qty toward a warehouse order. Only on `GET /sales-orders/{id}`. */
    importable_into_warehouse_order_quantity?: number
  }

  /** Build the descriptive "Rif. ordine" header line prepended to items imported from a sales order. */
  function salesOrderReferenceText(o: SalesOrderForImport): string {
    const documentNumber = o.document_number
    const date = new Date(o.document_date).toLocaleDateString()
    if (o.customer_purchase_order && o.customer_purchase_order_date) {
      return m.sales_order_reference_with_customer_po({
        documentNumber,
        date,
        customerPo: o.customer_purchase_order,
        customerPoDate: new Date(o.customer_purchase_order_date).toLocaleDateString(),
      })
    }
    return m.sales_order_reference({ documentNumber, date })
  }

  /**
   * Fetch importable sales orders. Filter recipe `?state=approved&fulfillment_status=none,in_progress`
   * comes from the `import-flows` business doc. Form-level filters (customer/ship_to/incoterm) are
   * forwarded server-side; `sales_transaction_type` is filtered client-side because the endpoint
   * doesn't expose it as a query param.
   */
  async function fetchImportableSalesOrders(
    search?: string,
    formFilters?: {
      customer_id?: string
      ship_to_address_id?: string
      incoterm?: string
      sales_transaction_type?: string
    },
  ): Promise<SalesOrderForImport[]> {
    if (!legalEntityId) return []
    const queryParams: Record<string, string> = {
      state: 'approved',
      fulfillment_status: 'none,in_progress',
      per_page: '200',
    }
    if (search) queryParams.search = search
    if (formFilters?.customer_id) queryParams.customer_id = formFilters.customer_id
    if (formFilters?.ship_to_address_id) queryParams.ship_to_address_id = formFilters.ship_to_address_id
    if (formFilters?.incoterm) queryParams.incoterm = formFilters.incoterm

    const response = await apiRequest<{ data: SalesOrderForImport[] }>({
      url: `/legal-entities/${legalEntityId}/sales-orders`,
      method: 'GET',
      queryParams,
    })
    const data = response.data ?? []
    if (!formFilters?.sales_transaction_type) return data
    // Endpoint doesn't filter by sales_transaction_type — apply client-side.
    return data.filter(o => !o.sales_transaction_type || o.sales_transaction_type === formFilters.sales_transaction_type)
  }

  function mapSalesOrderToOption(o: SalesOrderForImport): BasicOption {
    return {
      label: `${o.document_number} · ${extractSnapshotString(o.customer_snapshot, 'name') ?? '—'}`,
      value: o.id,
    }
  }

  /**
   * Compatibility key used by ImportMenu to lock the dropdown to records sharing
   * customer / ship_to / incoterm / sales_transaction_type with the first selection.
   * Matches the backend rules enforced when creating a warehouse order from sales orders.
   */
  function salesOrderCompatKey(o: SalesOrderForImport): string {
    return [
      o.customer_id,
      o.ship_to_address_id ?? '',
      o.incoterm ?? '',
      o.sales_transaction_type ?? '',
    ].join('|')
  }

  /**
   * Fetch the full single-resource representation of a sales order. Needed because
   * `importable_into_warehouse_order_quantity` is only populated on this endpoint.
   */
  async function fetchSingleSalesOrder(id: string): Promise<SalesOrderForImport> {
    if (!legalEntityId) throw new Error('legalEntityId not available')
    return apiRequest<SalesOrderForImport>({
      url: `/legal-entities/${legalEntityId}/sales-orders/${id}`,
      method: 'GET',
    })
  }

  /**
   * Drive the SO → WO import:
   * - Parallel GET of each selected sales order's full single-resource (for `importable_*` qty + snapshots).
   * - First record AND empty form (`!customer_id`) → also populate header fields and selector snapshots.
   * - Per record: append items where `importable_into_warehouse_order_quantity > 0`, using that as `quantity_requested`.
   * - Any fetch failure aborts the entire operation (no partial state).
   */
  async function handleImportSalesOrders(
    formAPI: { updateField: FormFieldUpdater; values: Record<string, unknown> },
    selected: SalesOrderForImport[],
  ) {
    if (!itemsEditorRef || selected.length === 0) return
    const isFormEmpty = !formAPI.values.customer_id

    const job = (async () => {
      const fullOrders = await Promise.all(selected.map(s => fetchSingleSalesOrder(s.id)))

      const existingLinkIds = new SvelteSet(
        itemsEditorRef!
          .getItems()
          .filter(it => !!it.sales_order_item_id)
          .map(it => it.sales_order_item_id as string),
      )

      let added = 0
      let skipped = 0

      for (const [idx, o] of fullOrders.entries()) {
        if (idx === 0 && isFormEmpty) {
          if (o.sales_transaction_type) formAPI.updateField('sales_transaction_type', o.sales_transaction_type)
          formAPI.updateField('customer_id', o.customer_id)
          if (o.ship_to_address_id) formAPI.updateField('ship_to_address_id', o.ship_to_address_id)
          if (o.incoterm) formAPI.updateField('incoterm', o.incoterm)
          if (o.incoterm_location) formAPI.updateField('incoterm_location', o.incoterm_location)
          if (o.notes_internal) formAPI.updateField('notes_internal', o.notes_internal)
          customerSnapshotImport.value = o.customer_snapshot
          shipToSnapshotImport.value = o.ship_to_snapshot
        }

        const productItems: WarehouseOrderLineItem[] = []
        for (const item of o.items ?? []) {
          // Source descriptive lines are dropped; we prepend our own "Rif. ordine" header instead.
          if (item.type !== 'item') continue
          const importableQty = item.importable_into_warehouse_order_quantity ?? 0
          if (importableQty <= 0) continue
          if (existingLinkIds.has(item.id)) {
            skipped++
            continue
          }
          existingLinkIds.add(item.id)
          productItems.push({
            type: 'item',
            sales_order_item_id: item.id,
            item_id: item.item_id,
            item_snapshot: item.item_snapshot,
            description: item.description,
            quantity_requested: importableQty,
            uom: item.uom,
          })
        }

        if (productItems.length === 0) continue
        // Prepend a descriptive "Rif. ordine vendita…" header per source SO.
        const referenceLine: WarehouseOrderLineItem = {
          type: 'descriptive',
          description: salesOrderReferenceText(o),
        }
        itemsEditorRef!.addItems([referenceLine, ...productItems], { groupId: generateId() })
        added += productItems.length
      }

      return { added, skipped }
    })()

    toast.promise(job, {
      loading: m.import_in_progress(),
      success: res =>
        res.skipped > 0
          ? m.import_completed_with_skipped({ added: res.added, skipped: res.skipped })
          : m.import_completed({ count: res.added }),
      error: () => m.import_failed(),
    })
  }

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

  // *Attr derived: read from `record.*_snapshot` in edit mode, fall back to the
  // `*SnapshotImport` state populated by the import flow in create mode.
  const customerAttr = $derived(
    customerSnapshotImport.resolve(record?.customer_snapshot as SnapshotShape | undefined),
  )

  const shipToAddressAttr = $derived(
    shipToSnapshotImport.resolve(record?.ship_to_snapshot as SnapshotShape | undefined),
  )

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

        <!-- Import records -->
        {#if !isReadOnly}
          <GroupTitle heading={m.import_records()}>
            {#snippet description()}
              {m.import_records_description()}
            {/snippet}

            {#snippet content()}
              <div>
                <ImportMenu
                  fetchFunction={search =>
                    fetchImportableSalesOrders(search, {
                      customer_id: formAPI?.values?.customer_id as string | undefined,
                      ship_to_address_id: formAPI?.values?.ship_to_address_id as string | undefined,
                      incoterm: formAPI?.values?.incoterm as string | undefined,
                      sales_transaction_type: formAPI?.values?.sales_transaction_type as string | undefined,
                    })}
                  optionMappingFunction={mapSalesOrderToOption}
                  compatKey={salesOrderCompatKey}
                  onimport={selected => handleImportSalesOrders(formAPI as never, selected)}>
                  {#snippet previewSnippet(order)}
                    {@const productItems = (order.items ?? []).filter(i => i.type === 'item')}
                    <ImportRecordPreview
                      documentNumber={order.document_number}
                      documentDate={order.document_date}
                      subtitle={extractSnapshotString(order.customer_snapshot, 'name')}
                      items={productItems}>
                      {#snippet itemRow(item)}
                        <div class="flex items-baseline justify-between gap-2 text-xs">
                          <span class="truncate">{item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}</span>
                          <span class="shrink-0 text-muted-foreground">x{item.quantity}</span>
                        </div>
                      {/snippet}
                    </ImportRecordPreview>
                  {/snippet}
                </ImportMenu>
              </div>
            {/snippet}
          </GroupTitle>

          <Separator />
        {/if}

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
              bind:this={itemsEditorRef}
              name="items"
              showLabel={false}
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
