<!--
  @component TransportDocumentDetails
  @description Fetches and displays transport document (DDT) details for create/edit.
  Provides DDT data to page state so other snippets on the same page (e.g. sidebar)
  can consume it without a second request.
  @keywords transport-document, ddt, details, form, shipping
  @api GET /api/legal-entities/{legalEntity}/transport-documents/{transportDocument}
  @api POST /api/legal-entities/{legalEntity}/transport-documents
  @api PUT /api/legal-entities/{legalEntity}/transport-documents/{transportDocument}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { TransportDocumentDetailsContract as contract } from './TransportDocumentDetails.contract.js'
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
  import NumberField from '$components/core/form/NumberField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import CarrierSelector, { type CarrierSummary } from '$components/features/form/CarrierSelector.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import type { TransportDocumentLineItem } from '$components/features/form/TransportDocumentItemsListEditor.svelte'
  import TransportDocumentItemsListEditor from '$components/features/form/TransportDocumentItemsListEditor.svelte'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import WarehouseSelector, { type WarehouseSummary } from '$components/features/form/WarehouseSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createTransportDocumentActions,
    type TransportDocumentActionOptions,
  } from '$components/features/transport-documents/transport-document-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerCommercialTerms, TransportDocument } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { todayLocalISO } from '$lib/utils/date'
  import {
    incotermLabels,
    salesTransactionTypeLabels,
    toSelectItems,
    transportMethodLabels,
  } from '$lib/utils/enum-labels'
  import type { BasicOption } from '$lib/utils/generics'
  import { generateId } from '$lib/utils/id'
  import { api, apiDownload, apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { extractSnapshotString, type SnapshotShape } from '$lib/utils/snapshots'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { toast } from 'svelte-sonner'
  import { SvelteSet } from 'svelte/reactivity'
  import { TransportDocumentDetailsContract } from './TransportDocumentDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['transport-documents'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const transportDocumentHandle = useProvides(TransportDocumentDetailsContract, 'transportDocument')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<TransportDocument>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<TransportDocument>(`/legal-entities/${legalEntityId}/transport-documents/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/transport-documents`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/transport-documents/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'transport-document-details', params: { uuid: record.id } }),
    onUpdated: data => {
      transportDocumentHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_transport_document())
      if (data.customer_id) {
        fetchCustomerCommercialTerms(data.customer_id)
      }
    },
    onCreateMode: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_transport_document())
    },
    cleanup: () => {
      transportDocumentHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  const isReadOnly = $derived(!!record && record.state !== 'open')

  // Items editor ref + import-from-orders flow (separate menus for SO and WO sources)
  let itemsEditorRef: TransportDocumentItemsListEditor | undefined = $state()
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
    notes_external?: string
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
    unit_price?: number
    vat_code_id?: string
    vat_code_snapshot?: Record<string, unknown>
    /** Per-line remaining importable qty toward a transport document. Only on `GET /sales-orders/{id}`. */
    importable_into_transport_document_quantity?: number
  }

  type WarehouseOrderForImport = {
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
    notes_internal?: string
    items?: WarehouseOrderItemForImport[]
  }

  type WarehouseOrderItemForImport = {
    id: string
    type: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    quantity_requested: number
    uom: string
    sales_order_item_id?: string
    /** Per-line remaining importable qty toward a transport document. Only on `GET /warehouse-orders/{id}`. */
    importable_into_transport_document_quantity?: number
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

  type ImportFormFilters = {
    customer_id?: string
    ship_to_address_id?: string
    incoterm?: string
    sales_transaction_type?: string
  }

  /**
   * Fetch importable sales orders. Filter recipe `?state=approved&fulfillment_status=none,in_progress,picked,partially_shipped`
   * comes from the `import-flows` business doc (DDT ← SO).
   */
  async function fetchImportableSalesOrders(
    search?: string,
    formFilters?: ImportFormFilters,
  ): Promise<SalesOrderForImport[]> {
    if (!legalEntityId) return []
    const queryParams: Record<string, string> = {
      state: 'approved',
      fulfillment_status: 'none,in_progress,picked,partially_shipped',
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
    return data.filter(
      o => !o.sales_transaction_type || o.sales_transaction_type === formFilters.sales_transaction_type,
    )
  }

  /**
   * Fetch importable warehouse orders. Filter recipe `?transport_document_status=none,partial`
   * comes from the `import-flows` business doc (DDT ← WO, orderless-only scope).
   */
  async function fetchImportableWarehouseOrders(
    search?: string,
    formFilters?: ImportFormFilters,
  ): Promise<WarehouseOrderForImport[]> {
    if (!legalEntityId) return []
    const queryParams: Record<string, string> = {
      transport_document_status: 'none,partial',
      per_page: '200',
    }
    if (search) queryParams.search = search
    if (formFilters?.customer_id) queryParams.customer_id = formFilters.customer_id
    if (formFilters?.ship_to_address_id) queryParams.ship_to_address_id = formFilters.ship_to_address_id
    if (formFilters?.incoterm) queryParams.incoterm = formFilters.incoterm

    const response = await apiRequest<{ data: WarehouseOrderForImport[] }>({
      url: `/legal-entities/${legalEntityId}/warehouse-orders`,
      method: 'GET',
      queryParams,
    })
    const data = response.data ?? []
    if (!formFilters?.sales_transaction_type) return data
    return data.filter(
      o => !o.sales_transaction_type || o.sales_transaction_type === formFilters.sales_transaction_type,
    )
  }

  function mapSalesOrderToOption(o: SalesOrderForImport): BasicOption {
    return {
      label: `${o.document_number} · ${extractSnapshotString(o.customer_snapshot, 'name') ?? '—'}`,
      value: o.id,
    }
  }

  function mapWarehouseOrderToOption(o: WarehouseOrderForImport): BasicOption {
    return {
      label: `${o.document_number} · ${extractSnapshotString(o.customer_snapshot, 'name') ?? '—'}`,
      value: o.id,
    }
  }

  function compatKeyOf(o: {
    customer_id: string
    ship_to_address_id?: string
    incoterm?: string
    sales_transaction_type?: string
  }): string {
    return [o.customer_id, o.ship_to_address_id ?? '', o.incoterm ?? '', o.sales_transaction_type ?? ''].join('|')
  }

  async function fetchSingleSalesOrder(id: string): Promise<SalesOrderForImport> {
    if (!legalEntityId) throw new Error('legalEntityId not available')
    return apiRequest<SalesOrderForImport>({
      url: `/legal-entities/${legalEntityId}/sales-orders/${id}`,
      method: 'GET',
    })
  }

  async function fetchSingleWarehouseOrder(id: string): Promise<WarehouseOrderForImport> {
    if (!legalEntityId) throw new Error('legalEntityId not available')
    return apiRequest<WarehouseOrderForImport>({
      url: `/legal-entities/${legalEntityId}/warehouse-orders/${id}`,
      method: 'GET',
    })
  }

  /** Pre-fill DDT header fields from the first imported source (SO or WO) when the form is empty. */
  function applyHeaderFromSource(
    formAPI: { updateField: FormFieldUpdater },
    o: SalesOrderForImport | WarehouseOrderForImport,
    notesExternal?: string,
  ) {
    if (o.sales_transaction_type) formAPI.updateField('sales_transaction_type', o.sales_transaction_type)
    formAPI.updateField('customer_id', o.customer_id)
    if (o.ship_to_address_id) formAPI.updateField('ship_to_address_id', o.ship_to_address_id)
    if (o.incoterm) formAPI.updateField('incoterm', o.incoterm)
    if (o.incoterm_location) formAPI.updateField('incoterm_location', o.incoterm_location)
    if (o.notes_internal) formAPI.updateField('notes_internal', o.notes_internal)
    if (notesExternal) formAPI.updateField('notes_external', notesExternal)
    customerSnapshotImport.value = o.customer_snapshot
    shipToSnapshotImport.value = o.ship_to_snapshot
    if (o.customer_id) fetchCustomerCommercialTerms(o.customer_id)
  }

  /**
   * SO → DDT import. Maps SO line items (with their unit_price/vat_code) to TD line items,
   * using `importable_into_transport_document_quantity` as `quantity`.
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
        if (idx === 0 && isFormEmpty) applyHeaderFromSource(formAPI, o, o.notes_external)

        const productItems: TransportDocumentLineItem[] = []
        for (const item of o.items ?? []) {
          // Source descriptive lines are dropped; we prepend our own "Rif. ordine vendita…" header instead.
          if (item.type !== 'item') continue
          const importableQty = item.importable_into_transport_document_quantity ?? 0
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
            quantity: importableQty,
            uom: item.uom,
            unit_price: item.unit_price ?? 0,
            vat_code_id: item.vat_code_id,
            vat_code_snapshot: item.vat_code_snapshot,
            weight_gross: 0,
            weight_net: 0,
          })
        }

        if (productItems.length === 0) continue
        // Prepend a descriptive "Rif. ordine vendita…" header per source SO.
        const referenceLine: TransportDocumentLineItem = {
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

  /**
   * WO → DDT import. WO items don't carry pricing/VAT — the user fills those manually
   * (or via the form-level `commercialTermsVatCode` default for new rows).
   * Source descriptive lines are PRESERVED with a `warehouse_order_item_id` FK link
   * so the chain (e.g. an upstream "Rif. ordine vendita…" line) is kept intact.
   */
  async function handleImportWarehouseOrders(
    formAPI: { updateField: FormFieldUpdater; values: Record<string, unknown> },
    selected: WarehouseOrderForImport[],
  ) {
    if (!itemsEditorRef || selected.length === 0) return
    const isFormEmpty = !formAPI.values.customer_id

    const job = (async () => {
      const fullOrders = await Promise.all(selected.map(s => fetchSingleWarehouseOrder(s.id)))
      const existingLinkIds = new SvelteSet(
        itemsEditorRef!
          .getItems()
          .filter(it => !!it.warehouse_order_item_id)
          .map(it => it.warehouse_order_item_id as string),
      )

      let added = 0
      let skipped = 0

      for (const [idx, o] of fullOrders.entries()) {
        if (idx === 0 && isFormEmpty) applyHeaderFromSource(formAPI, o)

        const lines: TransportDocumentLineItem[] = []
        for (const item of o.items ?? []) {
          if (existingLinkIds.has(item.id)) {
            skipped++
            continue
          }
          if (item.type === 'descriptive') {
            // Preserve descriptive lines as-is, with FK link for chain traceability.
            existingLinkIds.add(item.id)
            lines.push({
              type: 'descriptive',
              warehouse_order_item_id: item.id,
              description: item.description,
            })
            continue
          }
          const importableQty = item.importable_into_transport_document_quantity ?? 0
          if (importableQty <= 0) continue
          existingLinkIds.add(item.id)
          lines.push({
            type: 'item',
            warehouse_order_item_id: item.id,
            item_id: item.item_id,
            item_snapshot: item.item_snapshot,
            description: item.description,
            quantity: importableQty,
            uom: item.uom,
            unit_price: 0,
            vat_code_id: commercialTermsVatCode?.id,
            vat_code_snapshot: commercialTermsVatCode as unknown as Record<string, unknown> | undefined,
            weight_gross: 0,
            weight_net: 0,
          })
        }

        const itemLineCount = lines.filter(l => l.type === 'item').length
        if (itemLineCount === 0) continue
        itemsEditorRef!.addItems(lines, { groupId: generateId() })
        added += itemLineCount
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

  const transportDocumentActions = $derived(
    legalEntityId
      ? createTransportDocumentActions({
          legalEntityId,
          onSuccess: detail.refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onArchived: () => goto(createRoute({ $id: 'transport-documents' })),
        })
      : [],
  )
  const actionOptions = $derived.by((): TransportDocumentActionOptions | null => {
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
  const carryAction = $derived(transportDocumentActions.find(a => a.id === 'carry'))

  // Default VAT code resolved from customer commercial terms (used by item editor)
  let commercialTermsVatCode = $state<VatCodeSummary | undefined>(undefined)

  type FormFieldUpdater = (name: string, value: unknown) => void

  async function fetchCustomerCommercialTerms(customerId: string) {
    if (!customerId || !legalEntityId) {
      commercialTermsVatCode = undefined
      return
    }
    const { data } = await api.safe.get<CustomerCommercialTerms>(
      `/legal-entities/${legalEntityId}/customers/${customerId}/commercial-terms`,
    )
    commercialTermsVatCode = data ? (data.vat_code as VatCodeSummary | undefined) : undefined
  }

  function handleCustomerChange(item: { value?: unknown } | undefined, updateField: FormFieldUpdater) {
    updateField('ship_to_address_id', '')
    commercialTermsVatCode = undefined
    if (item?.value) {
      fetchCustomerCommercialTerms(item.value as string)
    }
  }

  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = toSelectItems(salesTransactionTypeLabels)
  const transportMethodItems = toSelectItems(transportMethodLabels)

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: todayLocalISO(),
    sales_transaction_type: undefined,
    customer_id: '',
    ship_to_address_id: '',
    warehouse_id: '',
    carrier_id: '',
    transport_method: null,
    shipping_date: '',
    shipping_time: '',
    incoterm: undefined,
    incoterm_location: '',
    packages_count: undefined,
    gross_weight: undefined,
    net_weight: undefined,
    volume: undefined,
    appearance: '',
    notes_internal: '',
    notes_external: '',
    return_deadline: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<TransportDocument>>({
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      incoterm: [v.required({ field: m.incoterm() })],
      shipping_date: [v.required({ field: m.shipping_date() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<TransportDocument>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // *Attr derived: read from `record.*_snapshot` in edit mode, fall back to the
  // `*SnapshotImport` state populated by the import flow in create mode.
  const customerAttr = $derived(customerSnapshotImport.resolve(record?.customer_snapshot as SnapshotShape | undefined))

  const shipToAddressAttr = $derived(
    shipToSnapshotImport.resolve(record?.ship_to_snapshot as SnapshotShape | undefined),
  )

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

        <!-- Import records: two parallel menus (SO and WO sources) -->
        {#if !isReadOnly}
          {@const formFilters = {
            customer_id: formAPI?.values?.customer_id as string | undefined,
            ship_to_address_id: formAPI?.values?.ship_to_address_id as string | undefined,
            incoterm: formAPI?.values?.incoterm as string | undefined,
            sales_transaction_type: formAPI?.values?.sales_transaction_type as string | undefined,
          }}

          <GroupTitle heading={m.import_records()}>
            {#snippet description()}
              {m.import_records_description()}
            {/snippet}

            {#snippet content()}
              <div class="flex flex-col gap-4 {FormFieldClass.MaxWidth}">
                <div>
                  <ImportMenu
                    fetchFunction={search => fetchImportableSalesOrders(search, formFilters)}
                    optionMappingFunction={mapSalesOrderToOption}
                    compatKey={compatKeyOf}
                    onimport={selected => handleImportSalesOrders(formAPI as never, selected)}
                    label={m.import_from_sales_orders()}>
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

                <div>
                  <ImportMenu
                    fetchFunction={search => fetchImportableWarehouseOrders(search, formFilters)}
                    optionMappingFunction={mapWarehouseOrderToOption}
                    compatKey={compatKeyOf}
                    onimport={selected => handleImportWarehouseOrders(formAPI as never, selected)}
                    label={m.import_from_warehouse_orders()}>
                    {#snippet previewSnippet(order)}
                      {@const productItems = order.items ?? []}
                      <ImportRecordPreview
                        documentNumber={order.document_number}
                        documentDate={order.document_date}
                        subtitle={extractSnapshotString(order.customer_snapshot, 'name')}
                        items={productItems}>
                        {#snippet itemRow(item)}
                          <div class="flex items-baseline justify-between gap-2 text-xs">
                            <span class="truncate">{item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}</span>
                            <span class="shrink-0 text-muted-foreground">x{item.quantity_requested}</span>
                          </div>
                        {/snippet}
                      </ImportRecordPreview>
                    {/snippet}
                  </ImportMenu>
                </div>
              </div>
            {/snippet}
          </GroupTitle>

          <Separator />
        {/if}

        <!-- General Information -->
        <GroupTitle heading={m.transport_document_general_information()}>
          {#snippet description()}
            {m.transport_document_general_information_description()}
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
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Shipping -->
        <GroupTitle heading={m.transport_document_shipping()}>
          {#snippet description()}
            {m.transport_document_shipping_description()}
          {/snippet}

          {#snippet content()}
            <SelectField
              name="transport_method"
              label={m.transport_method()}
              items={transportMethodItems}
              onChange={value => {
                if (value !== 'carrier') formAPI.updateField('carrier_id', '')
              }}
              class={FormFieldClass.MinWidth} />

            {#if formAPI.values.transport_method === 'carrier'}
              <CarrierSelector name="carrier_id" attr={carrierAttr} class={FormFieldClass.MaxWidth} />
            {/if}

            <DateField name="shipping_date" label={m.shipping_date()} class={FormFieldClass.MaxWidth} />

            <TextField name="shipping_time" label={m.shipping_time()} class={FormFieldClass.MaxWidth} />

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Packages & Weights -->
        <GroupTitle heading={m.transport_document_packages()}>
          {#snippet description()}
            {m.transport_document_packages_description()}
          {/snippet}

          {#snippet content()}
            <NumberField name="packages_count" label={m.packages_count()} class={FormFieldClass.MaxWidth} />
            <NumberField name="gross_weight" label={m.gross_weight()} class={FormFieldClass.MaxWidth} />
            <NumberField name="net_weight" label={m.net_weight()} class={FormFieldClass.MaxWidth} />
            <NumberField name="volume" label={m.volume()} class={FormFieldClass.MaxWidth} />
            <TextField name="appearance" label={m.appearance()} class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.transport_document_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.transport_document_line_items_description()}
          {/snippet}

          {#snippet content()}
            <TransportDocumentItemsListEditor
              bind:this={itemsEditorRef}
              name="items"
              showLabel={false}
              defaultVatCode={commercialTermsVatCode}
              required={!record}
              refreshKey={record?.version} />

            {#if record}
              {@const grossTotal = (record.items ?? []).reduce((sum, it) => sum + (it.net_value || 0), 0)}
              <div class="pr-14">
                <StackedAmountValues
                  title={m.total()}
                  rows={[
                    {
                      type: 'grandtotal',
                      label: m.net_total(),
                      value: grossTotal,
                      currencyCode: DEFAULT_CURRENCY_CODE,
                    },
                  ]} />
              </div>
            {/if}
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes & Return -->
        <GroupTitle heading={m.transport_document_notes_section()}>
          {#snippet description()}
            {m.transport_document_notes_section_description()}
          {/snippet}

          {#snippet content()}
            <DateField name="return_deadline" label={m.return_deadline()} class={FormFieldClass.MaxWidth} allowClear />

            <RichEditorField
              name="notes_internal"
              label={m.notes_internal()}
              width="{FormFieldClass.MaxWidth} {FormFieldClass.MinWidth}" />

            <RichEditorField name="notes_external" label={m.notes_external()} width={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>
      {/snippet}

      {#snippet bottom()}
        <BottomBar>
          {#if !record}
            <BusyButton type="submit">{m.save_changes()}</BusyButton>
          {:else}
            {#if actionOptions}
              <RecordActionMenu buttonVariant="outline" actions={transportDocumentActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/transport-documents/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            {#if record.state === 'open'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if carryAction && actionOptions}
              <RecordActionButton action={carryAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
