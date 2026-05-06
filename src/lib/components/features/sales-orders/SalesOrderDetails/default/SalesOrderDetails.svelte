<!--
  @component SalesOrderDetails
  @description Fetches and displays sales order details for create/edit.
  Provides sales order data to page state so other snippets on the same page
  (e.g. sidebar) can consume it without a second request.
  @keywords sales-order, details, form, sales
  @api GET /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}
  @api POST /api/legal-entities/{legalEntity}/sales-orders
  @api PUT /api/legal-entities/{legalEntity}/sales-orders/{salesOrder}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SalesOrderDetailsContract as contract } from './SalesOrderDetails.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import ActionButton from '$components/core/ActionButton.svelte'
  import { ImportMenu, ImportRecordPreview } from '$components/core/common/import-menu'
  import { createImportedSnapshot } from '$components/core/form/imported-snapshot.svelte'
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
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerContactSelector from '$components/features/form/CustomerContactSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import LegalEntityBankSelector from '$components/features/form/LegalEntityBankSelector.svelte'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import type { QuotationLineItem } from '$components/features/form/QuotationItemsEditor.svelte'
  import SalesOrderItemsListEditor from '$components/features/form/SalesOrderItemsListEditor.svelte'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createSalesOrderActions,
    type SalesOrderActionOptions,
  } from '$components/features/sales-orders/sales-order-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Currency, CustomerCommercialTerms, PaymentTerm, SalesOrder } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { currencyLabels, incotermLabels, salesTransactionTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import type { BasicOption } from '$lib/utils/generics'
  import { generateId } from '$lib/utils/id'
  import { api, apiDownload, apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { extractSnapshotString, type SnapshotShape } from '$lib/utils/snapshots'
  import { DEFAULT_CURRENCY_CODE, floatToPriceString } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { toast } from 'svelte-sonner'
  import { SvelteSet } from 'svelte/reactivity'
  import { SalesOrderDetailsContract } from './SalesOrderDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['sales-orders'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const salesOrderHandle = useProvides(SalesOrderDetailsContract, 'salesOrder')
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<SalesOrder>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<SalesOrder>(`/legal-entities/${legalEntityId}/sales-orders/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/sales-orders`, { data }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: (id, { document_number, ...data }) =>
      api.put(`/legal-entities/${legalEntityId}/sales-orders/${id}`, { data }),
    getDetailRoute: record => createRoute({ $id: 'sales-order-details', params: { uuid: record.id } }),
    onUpdated: data => {
      salesOrderHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_sales_order())
      if (data.customer_id) {
        fetchCustomerCommercialTerms(data.customer_id)
      }
    },
    onCreateMode: () => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_sales_order())
    },
    cleanup: () => {
      salesOrderHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  const isReadOnly = $derived(!!record && record.state !== 'open')

  // Items list editor ref + import-from-quotations flow
  let itemsEditorRef: SalesOrderItemsListEditor | undefined = $state()

  // Snapshots from a quotation imported in create mode. The *Attr derived below
  // fall back to these so the selectors display names without an extra fetch.
  const customerSnapshotImport = createImportedSnapshot()
  const shipToSnapshotImport = createImportedSnapshot()
  const contactPersonSnapshotImport = createImportedSnapshot()
  const paymentTermSnapshotImport = createImportedSnapshot()

  type QuotationWithItems = {
    id: string
    document_number: string
    document_date: string
    net_value: number
    currency: string
    sales_transaction_type?: string
    customer_id: string
    customer_snapshot?: SnapshotShape
    ship_to_address_id?: string
    ship_to_snapshot?: SnapshotShape
    contact_person_id?: string
    contact_person_snapshot?: SnapshotShape
    payment_term_id?: string
    payment_term_snapshot?: SnapshotShape
    incoterm?: string
    incoterm_location?: string
    notes_internal?: string
    notes_external?: string
    items?: QuotationItem[]
  }

  type QuotationItem = {
    id: string
    type: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    quantity: number
    uom: string
    unit_price: number
    discount_percent: number
    discount_amount: number
    vat_code_id: string
    vat_code_snapshot: Record<string, unknown>
    requested_delivery_date: string
    delivery_date: string
    /** Per-line remaining importable quantity. Only present on `GET /quotations/{id}`. */
    importable_into_sales_order_quantity?: number
  }

  /**
   * Fetch importable quotations. When the form already has any of `customer_id`,
   * `ship_to_address_id`, `incoterm` set (edit mode or after a previous import),
   * those values are forwarded as query filters so the dropdown only shows
   * compatible records from the start. Empty fields are omitted from the query.
   */
  async function fetchImportableQuotations(
    search?: string,
    formFilters?: { customer_id?: string; ship_to_address_id?: string; incoterm?: string },
  ): Promise<QuotationWithItems[]> {
    if (!legalEntityId) return []
    const queryParams: Record<string, string> = {
      state: 'open,approved',
      conversion_status: 'none,partial',
      // Inflate page size so the client-side compat lock has a wide-enough pool.
      // The endpoint is paginated; without this we'd risk missing compatible
      // records past the default page cap.
      per_page: '200',
    }
    if (search) queryParams.search = search
    if (formFilters?.customer_id) queryParams.customer_id = formFilters.customer_id
    if (formFilters?.ship_to_address_id) queryParams.ship_to_address_id = formFilters.ship_to_address_id
    if (formFilters?.incoterm) queryParams.incoterm = formFilters.incoterm

    const response = await apiRequest<{ data: QuotationWithItems[] }>({
      url: `/legal-entities/${legalEntityId}/quotations`,
      method: 'GET',
      queryParams,
    })
    return response.data ?? []
  }

  function mapQuotationToOption(q: QuotationWithItems): BasicOption {
    return {
      label: `${q.document_number} · ${extractSnapshotString(q.customer_snapshot, 'name') ?? '—'}`,
      value: q.id,
    }
  }

  function quotationCompatKey(q: QuotationWithItems): string {
    return `${q.customer_id}|${q.ship_to_address_id ?? ''}|${q.incoterm ?? ''}`
  }

  /**
   * Fetch the full single-resource representation of a quotation. Needed because
   * `importable_into_sales_order_quantity` is only populated on this endpoint
   * (see business-doc `import-flows`).
   */
  async function fetchSingleQuotation(id: string): Promise<QuotationWithItems> {
    if (!legalEntityId) throw new Error('legalEntityId not available')
    return apiRequest<QuotationWithItems>({
      url: `/legal-entities/${legalEntityId}/quotations/${id}`,
      method: 'GET',
    })
  }

  /**
   * Drive the import flow:
   * - In parallel, GET each selected quotation's full single-resource (for `importable_*` qty + snapshots).
   * - If the form is empty (= `customer_id` not yet set), the FIRST imported record also fills the
   *   sales-order header fields and the snapshot states (so selectors display names without an extra fetch).
   * - For every record, line items are appended to the editor with their own color group; quantities use
   *   `importable_into_sales_order_quantity` (clamped to 0 for non-importable lines, which we skip).
   * - On any fetch failure the whole operation is aborted (no partial state).
   */
  async function handleImportQuotations(
    formAPI: { updateField: FormFieldUpdater; values: Record<string, unknown> },
    selected: QuotationWithItems[],
  ) {
    if (!itemsEditorRef || selected.length === 0) return
    const isFormEmpty = !formAPI.values.customer_id

    const job = (async () => {
      const fullQuotations = await Promise.all(selected.map(s => fetchSingleQuotation(s.id)))

      // Dedup set: against rows already in the editor, by source quotation_item_id.
      const existingLinkIds = new SvelteSet(
        itemsEditorRef!
          .getItems()
          .filter(it => it.type === 'item' && it.quotation_item_id)
          .map(it => it.quotation_item_id as string),
      )

      let added = 0
      let skipped = 0

      for (const [idx, q] of fullQuotations.entries()) {
        // First record AND empty form → also populate header fields + selector snapshots.
        if (idx === 0 && isFormEmpty) {
          if (q.sales_transaction_type) formAPI.updateField('sales_transaction_type', q.sales_transaction_type)
          formAPI.updateField('customer_id', q.customer_id)
          if (q.ship_to_address_id) formAPI.updateField('ship_to_address_id', q.ship_to_address_id)
          if (q.contact_person_id) formAPI.updateField('contact_person_id', q.contact_person_id)
          if (q.currency) formAPI.updateField('currency', q.currency)
          if (q.payment_term_id) formAPI.updateField('payment_term_id', q.payment_term_id)
          if (q.incoterm) formAPI.updateField('incoterm', q.incoterm)
          if (q.incoterm_location) formAPI.updateField('incoterm_location', q.incoterm_location)
          if (q.notes_internal) formAPI.updateField('notes_internal', q.notes_internal)
          if (q.notes_external) formAPI.updateField('notes_external', q.notes_external)
          customerSnapshotImport.value = q.customer_snapshot
          shipToSnapshotImport.value = q.ship_to_snapshot
          contactPersonSnapshotImport.value = q.contact_person_snapshot
          paymentTermSnapshotImport.value = q.payment_term_snapshot
          // Populate commercialTermsVatCode for default-VAT on new manual rows.
          // No `updateField` passed so payment_term_id / incoterm just set above are not overwritten.
          if (q.customer_id) fetchCustomerCommercialTerms(q.customer_id)
        }

        const productItems: QuotationLineItem[] = []
        for (const item of q.items ?? []) {
          if (item.type !== 'item') continue
          const importableQty = item.importable_into_sales_order_quantity ?? 0
          if (importableQty <= 0) continue
          if (existingLinkIds.has(item.id)) {
            skipped++
            continue
          }
          existingLinkIds.add(item.id)
          productItems.push({
            type: 'item',
            quotation_item_id: item.id,
            item_id: item.item_id,
            item_snapshot: item.item_snapshot,
            description: item.description,
            quantity: importableQty,
            uom: item.uom,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent,
            discount_amount: item.discount_amount,
            vat_code_id: item.vat_code_id,
            vat_code_snapshot: item.vat_code_snapshot,
            requested_delivery_date: item.requested_delivery_date,
            delivery_date: item.delivery_date,
          })
        }

        if (productItems.length === 0) continue

        const referenceText = m.quotation_reference({
          documentNumber: q.document_number,
          date: new Date(q.document_date).toLocaleDateString(),
        })
        const referenceItem: QuotationLineItem[] = referenceText
          ? [{ type: 'descriptive', description: referenceText }]
          : []

        itemsEditorRef!.addItems([...referenceItem, ...productItems], { groupId: generateId() })
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

  // Sales order actions (sent flag, approve, reject)
  const salesOrderActions = $derived(
    legalEntityId
      ? createSalesOrderActions({
          legalEntityId,
          onSuccess: detail.refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onArchived: () => goto(createRoute({ $id: 'sales-orders' })),
        })
      : [],
  )
  const actionOptions = $derived.by((): SalesOrderActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      sentAt: record.sent_at || null,
      availableTransitions: record.available_transitions ?? [],
      isArchivable: (record as SalesOrder & { is_archivable?: boolean }).is_archivable,
    }
  })
  const approveAction = $derived(salesOrderActions.find(a => a.id === 'approve'))
  const rejectAction = $derived(salesOrderActions.find(a => a.id === 'reject'))

  // Commercial terms state (always populated when a customer is known)
  let commercialTermsPaymentTerm = $state<PaymentTerm | undefined>(undefined)
  let commercialTermsVatCode = $state<VatCodeSummary | undefined>(undefined)

  type FormFieldUpdater = (name: string, value: unknown) => void

  /**
   * Fetches commercial terms for a customer and populates state.
   * When updateField is provided and we're in create mode, also precompiles form fields.
   */
  async function fetchCustomerCommercialTerms(customerId: string, updateField?: FormFieldUpdater) {
    if (!customerId || !legalEntityId) {
      commercialTermsPaymentTerm = undefined
      commercialTermsVatCode = undefined
      return
    }

    const { data } = await api.safe.get<CustomerCommercialTerms>(
      `/legal-entities/${legalEntityId}/customers/${customerId}/commercial-terms`,
    )

    if (data) {
      commercialTermsPaymentTerm = data.payment_term
      commercialTermsVatCode = data.vat_code as VatCodeSummary | undefined

      if (updateField && !record && data.payment_term) {
        updateField('payment_term_id', data.payment_term.id)
      }
      if (updateField && !record && data.incoterm) {
        updateField('incoterm', data.incoterm)
      }
    } else {
      commercialTermsPaymentTerm = undefined
      commercialTermsVatCode = undefined
    }
  }

  function handleCustomerChange(item: { value?: unknown } | undefined, updateField: FormFieldUpdater) {
    updateField('ship_to_address_id', '')
    updateField('contact_person_id', '')

    commercialTermsPaymentTerm = undefined
    commercialTermsVatCode = undefined

    if (item?.value) {
      fetchCustomerCommercialTerms(item.value as string, updateField)
    }
  }

  const currencyItems = toSelectItems(currencyLabels)
  const incotermItems = toSelectItems(incotermLabels)
  const transactionTypeItems = toSelectItems(salesTransactionTypeLabels)

  const initialValues = $derived.by(() => ({
    document_number: '',
    document_date: new Date().toISOString(),
    sales_transaction_type: undefined,
    customer_id: '',
    ship_to_address_id: '',
    contact_person_id: '',
    legal_entity_bank_id: '',
    currency: DEFAULT_CURRENCY_CODE as Currency,
    payment_term_id: '',
    incoterm: undefined,
    incoterm_location: '',
    customer_purchase_order: '',
    customer_purchase_order_date: '',
    requested_delivery_date: '',
    confirmation_date: '',
    notes_internal: '',
    notes_external: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: record.items ?? [],
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<SalesOrder>>({
      document_date: [v.required({ field: m.document_date() })],
      sales_transaction_type: [v.required({ field: m.sales_transaction_type() })],
      customer_id: [v.required({ field: m.customer() })],
      currency: [v.required({ field: m.currency_label() })],
      payment_term_id: [v.required({ field: m.payment_term() })],
      incoterm: [v.required({ field: m.incoterm() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<SalesOrder>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // *Attr derived: read from `record.*_snapshot` in edit mode, fall back to the
  // `*SnapshotImport` state populated by the import flow in create mode.
  // `paymentTermAttr` adds a third fallback to commercial terms loaded for the customer.

  const customerAttr = $derived(
    customerSnapshotImport.resolve(record?.customer_snapshot as SnapshotShape | undefined),
  )

  const paymentTermAttr = $derived.by(() => {
    const fromSnapshots = paymentTermSnapshotImport.resolve(
      record?.payment_term_snapshot as SnapshotShape | undefined,
    )
    if (fromSnapshots) return fromSnapshots
    if (commercialTermsPaymentTerm) return commercialTermsPaymentTerm as unknown as Record<string, unknown>
    return undefined
  })

  const shipToAddressAttr = $derived(
    shipToSnapshotImport.resolve(record?.ship_to_snapshot as SnapshotShape | undefined),
  )

  const contactPersonAttr = $derived(
    contactPersonSnapshotImport.resolve(record?.contact_person_snapshot as SnapshotShape | undefined),
  )

  // Resolve legal entity bank snapshot for pre-populating selector in edit mode
  const bankAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.legal_entity_bank_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })
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
                    fetchImportableQuotations(search, {
                      customer_id: formAPI?.values?.customer_id as string | undefined,
                      ship_to_address_id: formAPI?.values?.ship_to_address_id as string | undefined,
                      incoterm: formAPI?.values?.incoterm as string | undefined,
                    })}
                  optionMappingFunction={mapQuotationToOption}
                  compatKey={quotationCompatKey}
                  onimport={selected => handleImportQuotations(formAPI as never, selected)}>
                  {#snippet previewSnippet(quotation)}
                    {@const productItems = (quotation.items ?? []).filter(i => i.type === 'item')}
                    <ImportRecordPreview
                      documentNumber={quotation.document_number}
                      documentDate={quotation.document_date}
                      subtitle={extractSnapshotString(quotation.customer_snapshot, 'name')}
                      amount={floatToPriceString(quotation.net_value, quotation.currency)}
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
        <GroupTitle heading={m.sales_order_general_information()}>
          {#snippet description()}
            {m.sales_order_general_information_description()}
          {/snippet}

          {#snippet content()}
            {#if !!record}
              <TextField name="document_number" label={m.document_number()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

            <DateField name="document_date" label={m.document_date()} class={FormFieldClass.MaxWidth} allowClear />

            {#if record?.confirmation_date}
              <DateField name="confirmation_date" label={m.confirmed_on()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

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
              allowNewRecord
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

            <CustomerContactSelector
              customerId={formAPI.values.customer_id}
              attr={contactPersonAttr
                ? {
                    id: record?.contact_person_id as string,
                    type:
                      (contactPersonAttr.type as
                        | 'primary'
                        | 'technical_support'
                        | 'administrative'
                        | 'logistics'
                        | 'quality'
                        | 'purchasing'
                        | 'sales') ?? 'primary',
                    name: (contactPersonAttr.name as string) ?? '',
                    job_title: (contactPersonAttr.job_title as string) ?? '',
                    phone: (contactPersonAttr.phone as string) ?? '',
                    mobile_phone: (contactPersonAttr.mobile_phone as string) ?? '',
                    email: (contactPersonAttr.email as string) ?? '',
                    version: (contactPersonAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />

            <SelectField
              name="currency"
              label={m.currency_label()}
              items={currencyItems}
              class={FormFieldClass.MinWidth} />

            <TextField
              name="customer_purchase_order"
              label={m.customer_purchase_order()}
              class={FormFieldClass.MaxWidth} />

            <DateField
              name="customer_purchase_order_date"
              label={m.customer_purchase_order_date()}
              class={FormFieldClass.MaxWidth}
              allowClear />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Commercial Terms -->
        <GroupTitle heading={m.sales_order_commercial_terms()}>
          {#snippet description()}
            {m.sales_order_commercial_terms_description()}
          {/snippet}

          {#snippet content()}
            <PaymentTermSelector
              name="payment_term_id"
              attr={paymentTermAttr
                ? {
                    id: paymentTermAttr.id as string,
                    name: paymentTermAttr.name as string,
                    code: paymentTermAttr.code as string,
                    description: '',
                    terms: { reference_date: 'invoice_date', due_dates: [] },
                    is_active: true,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth} />

            <SelectField name="incoterm" label={m.incoterm()} items={incotermItems} class={FormFieldClass.MinWidth} />

            <TextField name="incoterm_location" label={m.incoterm_location()} class={FormFieldClass.MaxWidth} />

            <LegalEntityBankSelector
              attr={bankAttr
                ? {
                    id: bankAttr.id as string,
                    code: (bankAttr.code as string) ?? '',
                    name: (bankAttr.name as string) ?? '',
                    branch: (bankAttr.branch as string) ?? '',
                    abi: (bankAttr.abi as string) ?? '',
                    cab: (bankAttr.cab as string) ?? '',
                    cin: (bankAttr.cin as string) ?? '',
                    account_number: (bankAttr.account_number as string) ?? '',
                    iban: (bankAttr.iban as string) ?? '',
                    address: (bankAttr.address as string) ?? '',
                    city: (bankAttr.city as string) ?? '',
                    province: (bankAttr.province as string) ?? '',
                    postal_code: (bankAttr.postal_code as string) ?? '',
                    country_code: (bankAttr.country_code as string) ?? '',
                    bic_swift: (bankAttr.bic_swift as string) ?? '',
                    version: (bankAttr.version as number) ?? 0,
                  }
                : undefined}
              class={FormFieldClass.MaxWidth} />

            <DateField
              name="requested_delivery_date"
              label={m.requested_delivery_date()}
              class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.sales_order_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.sales_order_line_items_description()}
          {/snippet}

          {#snippet content()}
            <SalesOrderItemsListEditor
              bind:this={itemsEditorRef}
              name="items"
              showLabel={false}
              currency={formAPI?.values?.currency ?? DEFAULT_CURRENCY_CODE}
              required={!record}
              refreshKey={record?.version}
              showDeliveryDates
              defaultVatCode={commercialTermsVatCode}
              defaultDeliveryDate={formAPI?.values?.requested_delivery_date} />

            {@const currencyCode = formAPI.values.currency}
            <div class="pr-12">
              <StackedAmountValues
                title={m.total()}
                rows={[
                  { label: m.net_total(), value: record?.net_value || 0, currencyCode },
                  {
                    label: m.tax_total(),
                    value: (record?.gross_value || 0) - (record?.net_value || 0),
                    currencyCode,
                  },
                  {
                    type: 'grandtotal',
                    label: m.total(),
                    value: record?.gross_value || 0,
                    currencyCode,
                  },
                ]} />
            </div>
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes -->
        <GroupTitle heading={m.sales_order_notes_section()}>
          {#snippet description()}
            {m.sales_order_notes_section_description()}
          {/snippet}

          {#snippet content()}
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
              <RecordActionMenu buttonVariant="outline" actions={salesOrderActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/sales-orders/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            {#if record.state === 'open'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if rejectAction && actionOptions}
              <RecordActionButton action={rejectAction} {actionOptions} variant="outline" />
            {/if}

            {#if approveAction && actionOptions}
              <RecordActionButton action={approveAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
