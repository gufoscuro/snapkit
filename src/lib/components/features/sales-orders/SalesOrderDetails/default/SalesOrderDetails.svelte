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
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import CustomerAddressSelector from '$components/features/form/CustomerAddressSelector.svelte'
  import CustomerContactSelector from '$components/features/form/CustomerContactSelector.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import QuotationItemsListEditor from '$components/features/form/QuotationItemsListEditor.svelte'
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
  import LegalEntityBankSelector from '$components/features/form/LegalEntityBankSelector.svelte'
  import type { Currency, CustomerCommercialTerms, PaymentTerm, SalesOrder } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { currencyLabels, incotermLabels, salesTransactionTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
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

  // Sales order actions (sent flag, approve, reject)
  const salesOrderActions = $derived(
    legalEntityId ? createSalesOrderActions({ legalEntityId, onSuccess: detail.refetch }) : [],
  )
  const actionOptions = $derived.by((): SalesOrderActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      sentAt: record.sent_at || null,
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

  // Resolve payment term: edit mode uses snapshot, create mode uses commercial terms
  const paymentTermAttr = $derived.by(() => {
    if (record) {
      const snapshot = record.payment_term_snapshot
      if (Array.isArray(snapshot) && snapshot.length > 0) {
        return snapshot[0] as Record<string, unknown>
      }
      if (snapshot && !Array.isArray(snapshot)) {
        return snapshot as unknown as Record<string, unknown>
      }
      return undefined
    }
    if (commercialTermsPaymentTerm) {
      return commercialTermsPaymentTerm as unknown as Record<string, unknown>
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

  // Resolve contact person snapshot for pre-populating selector in edit mode
  const contactPersonAttr = $derived.by(() => {
    if (!record) return undefined
    const snapshot = record.contact_person_snapshot
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot[0] as Record<string, unknown>
    }
    if (snapshot && !Array.isArray(snapshot)) {
      return snapshot as unknown as Record<string, unknown>
    }
    return undefined
  })

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

        <!-- General Information -->
        <GroupTitle heading={m.sales_order_general_information()}>
          {#snippet description()}
            {m.sales_order_general_information_description()}
          {/snippet}

          {#snippet content()}
            {#if !!record}
              <TextField name="document_number" label={m.document_number()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

            <DateField name="document_date" label={m.document_date()} class={FormFieldClass.MinWidth} allowClear />

            <SelectField
              name="sales_transaction_type"
              label={m.sales_transaction_type()}
              items={transactionTypeItems}
              class={FormFieldClass.MaxWidth} />

            <CustomerSelector
              name="customer_id"
              attr={customerAttr
                ? {
                    id: customerAttr.id as string,
                    name: customerAttr.name as string,
                    vat_no: '',
                    categories: [],
                    default_currency: '',
                    emails: [],
                    phones: [],
                  }
                : undefined}
              onChange={item => handleCustomerChange(item, formAPI.updateField as FormFieldUpdater)}
              class={FormFieldClass.MaxWidth} />

            <CustomerAddressSelector
              customerId={formAPI.values.customer_id}
              attr={shipToAddressAttr
                ? {
                    id: shipToAddressAttr.id as string,
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
              class={FormFieldClass.MaxWidth} />

            <CustomerContactSelector
              customerId={formAPI.values.customer_id}
              attr={contactPersonAttr
                ? {
                    id: contactPersonAttr.id as string,
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
              class={FormFieldClass.MaxWidth} />

            <SelectField
              name="currency"
              label={m.currency_label()}
              items={currencyItems}
              class={FormFieldClass.MinWidth} />

            <TextField name="customer_purchase_order" label={m.customer_purchase_order()} class={FormFieldClass.MaxWidth} />

            <DateField name="customer_purchase_order_date" label={m.customer_purchase_order_date()} class={FormFieldClass.MinWidth} allowClear />
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

            <DateField name="requested_delivery_date" label={m.requested_delivery_date()} class={FormFieldClass.MinWidth} allowClear />

            <DateField name="confirmation_date" label={m.confirmation_date()} class={FormFieldClass.MinWidth} allowClear />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line Items -->
        <GroupTitle heading={m.sales_order_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.sales_order_line_items_description()}
          {/snippet}

          {#snippet content()}
            <QuotationItemsListEditor
              name="items"
              showLabel={false}
              currency={formAPI?.values?.currency ?? DEFAULT_CURRENCY_CODE}
              required={!record}
              refreshKey={record?.version}
              showDeliveryDates
              defaultVatCode={commercialTermsVatCode} />

            {@const currencyCode = formAPI.values.currency}
            <div class="pr-14">
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
          {:else if record.state === 'open'}
            {#if actionOptions}
              <RecordActionMenu buttonVariant="outline" actions={salesOrderActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/sales-orders/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />

            <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
              <IconDeviceFloppy class="size-4" />
            </ActionButton>

            {#if rejectAction && actionOptions}
              <RecordActionButton action={rejectAction} {actionOptions} variant="outline" />
            {/if}

            {#if approveAction && actionOptions}
              <RecordActionButton action={approveAction} {actionOptions} />
            {/if}
          {:else}
            <DownloadActionButton
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/sales-orders/${record.id}/pdf`,
                  filename: `${record.document_number}.pdf`,
                })} />
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
