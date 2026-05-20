<!--
  @component InvoicesDetails
  @description Create / edit form for invoices, backed by the full Invoices CRUD.
  Composes the FatturaPA header (document type, customer, payment term, currency,
  bank), the line items editor and the Acube/SDI action menu (submit/resubmit/
  archive/validate) + XML download. Item-side field names are remapped at submit
  time to the API shape (`uom` → `unit_of_measure`, `discount_percent` →
  `discount_percentage`). After a successful create, redirects to the same page
  in edit mode so the user can review the assigned `document_number` and trigger
  the SDI flow. Edits are blocked when the invoice has left the `draft` state.
  @keywords invoice, invoices, fatturapa, create, edit, billing, sdi, acube
  @uses FormUtil, CustomerSelector, PaymentTermSelector, LegalEntityBankSelector, InvoiceItemsListEditor, RecordActionMenu, DownloadActionButton
  @api GET /api/legal-entities/{legalEntity}/invoices/{invoice}
  @api POST /api/legal-entities/{legalEntity}/invoices
  @api PUT /api/legal-entities/{legalEntity}/invoices/{invoice}
  @api POST /api/legal-entities/{legalEntity}/invoices/{invoice}/transition
  @api POST /api/legal-entities/{legalEntity}/invoices/{invoice}/validate
  @api GET /api/legal-entities/{legalEntity}/invoices/{invoice}/xml
  @route invoices, invoice-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { InvoicesDetailsContract as contract } from './InvoicesDetails.contract.js'
</script>

<script lang="ts">
  import { browser } from '$app/environment'
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
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import InvoiceItemsListEditor from '$components/features/form/InvoiceItemsListEditor.svelte'
  import LegalEntityBankSelector from '$components/features/form/LegalEntityBankSelector.svelte'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import type { QuotationLineItem } from '$components/features/form/QuotationItemsEditor.svelte'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import {
    createInvoiceActions,
    type InvoiceActionOptions,
    type SdiViolation,
  } from '$components/features/invoices/invoice-actions'
  import Separator from '$components/ui/separator/separator.svelte'
  import type { FormAPI } from '$lib/components/core/form/form-context'
  import * as Alert from '$lib/components/ui/alert'
  import { RecordActionButton } from '$lib/components/ui/record-action-button'
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type {
    Currency,
    CustomerCommercialTerms,
    CustomerSummary,
    Invoice,
    InvoiceDocumentType,
    InvoiceItem,
    InvoiceTransition,
    LegalEntityBank,
    PaymentTerm,
  } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { currencyLabels, invoiceDocumentTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { api, apiDownload } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle'
  import CircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import { tick } from 'svelte'
  import { fly } from 'svelte/transition'
  import { InvoicesDetailsContract } from './InvoicesDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  const resourceConfig = $derived(entityConfig?.resources?.['invoices'])
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const invoiceHandle = useProvides(InvoicesDetailsContract, 'invoice')
  const breadcrumbTitle = useBreadcrumbTitle()

  /**
   * Remap the editor's output shape (sourced from `QuotationItemsListEditor`) to
   * the invoice API contract: `uom` → `unit_of_measure`, `discount_percent` →
   * `discount_percentage`. Carries upstream linkage IDs
   * (`sales_order_item_id`, `transport_document_item_id`) opaquely so update
   * doesn't lose document-chain traceability.
   */
  function mapItemsToInvoicePayload(items: QuotationLineItem[]) {
    return items.map(line => {
      if (line.type === 'descriptive') {
        return {
          type: 'descriptive' as const,
          description: line.description,
          sales_order_item_id: line.sales_order_item_id,
          transport_document_item_id: line.transport_document_item_id,
        }
      }
      return {
        type: 'item' as const,
        item_id: line.item_id,
        description: line.description,
        quantity: line.quantity,
        unit_of_measure: line.uom,
        unit_price: line.unit_price,
        discount_percentage: line.discount_percent ?? 0,
        vat_code_id: line.vat_code_id,
        sales_order_item_id: line.sales_order_item_id,
        transport_document_item_id: line.transport_document_item_id,
      }
    })
  }

  /**
   * Inverse remap for hydration: convert `InvoiceItem[]` from the API response
   * to the editor's `QuotationLineItem[]` shape (`unit_of_measure` → `uom`,
   * `discount_percentage` → `discount_percent`). Preserves upstream linkage IDs.
   */
  function mapItemsToEditorShape(items: InvoiceItem[] | undefined): QuotationLineItem[] {
    if (!items) return []
    return items.map(line => {
      if (line.type === 'descriptive') {
        return {
          type: 'descriptive' as const,
          description: line.description,
          sales_order_item_id: line.sales_order_item_id || undefined,
          transport_document_item_id: line.transport_document_item_id || undefined,
        }
      }
      return {
        type: 'item' as const,
        item_id: line.item_id,
        item_snapshot: Array.isArray(line.item_snapshot) ? line.item_snapshot[0] : line.item_snapshot,
        description: line.description,
        quantity: line.quantity,
        uom: line.unit_of_measure,
        unit_price: line.unit_price,
        discount_percent: line.discount_percentage,
        net_value: line.net_value,
        vat_code_id: line.vat_code_id,
        vat_code_snapshot: Array.isArray(line.vat_code_snapshot) ? line.vat_code_snapshot[0] : line.vat_code_snapshot,
        tax_amount: line.tax_amount,
        sales_order_item_id: line.sales_order_item_id || undefined,
        transport_document_item_id: line.transport_document_item_id || undefined,
      }
    })
  }

  /**
   * Whitelist payload to the fields accepted by the invoice create/update
   * contract. Snapshots, totals, computed state, timestamps and the document
   * number are server-managed and excluded. `document_date` is excluded by the
   * caller for update (prohibited per business-logic doc, fixed by SDI).
   */
  function buildApiPayload(data: Record<string, unknown>): Record<string, unknown> {
    return {
      version: data.version,
      document_date: data.document_date,
      document_type: data.document_type,
      customer_id: data.customer_id,
      sales_order_id: (data.sales_order_id as string) || undefined,
      payment_term_id: data.payment_term_id,
      legal_entity_bank_id: (data.legal_entity_bank_id as string) || undefined,
      currency: data.currency,
      notes_internal: data.notes_internal,
      notes_external: data.notes_external,
      items: mapItemsToInvoicePayload((data.items as QuotationLineItem[] | undefined) ?? []),
    }
  }

  const detail = useDetailRecord<Invoice>({
    getUuid: () => uuid,
    fetch: id => api.safe.get<Invoice>(`/legal-entities/${legalEntityId}/invoices/${id}`),
    create: data => api.post(`/legal-entities/${legalEntityId}/invoices`, { data: buildApiPayload(data) }),
    update: (id, data) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { document_date, ...rest } = buildApiPayload(data)
      return api.put(`/legal-entities/${legalEntityId}/invoices/${id}`, { data: rest })
    },
    getDetailRoute: record => createRoute({ $id: 'invoice-details', params: { uuid: record.id } }),
    onUpdated: data => {
      invoiceHandle.set(data)
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.document_number || m.new_invoice())
      if (data.customer_id) fetchCustomerCommercialTerms(data.customer_id)
    },
    onCreateMode: () => breadcrumbTitle.setLabel(pageDetails.config.$id, m.new_invoice()),
    cleanup: () => {
      invoiceHandle.unset()
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })

  const { handleSubmit, handleSuccess, handleFailure } = detail
  const record = $derived(detail.record)
  const promise = $derived(detail.promise)
  // Per business-logic doc: invoices are editable only in `draft` and `rejected` states.
  const isReadOnly = $derived(!!record && record.state !== 'draft' && record.state !== 'rejected')

  // Default VAT code resolved from the selected customer's commercial terms.
  // Used by the line items editor as the suggested VAT for newly added rows.
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
    commercialTermsVatCode = undefined
    if (item?.value) {
      fetchCustomerCommercialTerms(item.value as string)
    } else {
      updateField('customer_id', '')
    }
  }

  const documentTypeItems = toSelectItems(invoiceDocumentTypeLabels)
  const currencyItems = toSelectItems(currencyLabels)

  type InvoiceFormValues = {
    document_date: string
    document_type: InvoiceDocumentType
    customer_id: string
    sales_order_id: string
    payment_term_id: string
    legal_entity_bank_id: string
    currency: Currency
    notes_internal: string
    notes_external: string
    items: QuotationLineItem[]
  }

  const initialValues = $derived.by<InvoiceFormValues>(() => ({
    document_date: new Date().toISOString(),
    document_type: 'TD01' as InvoiceDocumentType,
    customer_id: '',
    sales_order_id: '',
    payment_term_id: '',
    legal_entity_bank_id: '',
    currency: DEFAULT_CURRENCY_CODE as Currency,
    notes_internal: '',
    notes_external: '',
    items: [],
    ...(record
      ? {
          ...record,
          items: mapItemsToEditorShape(record.items),
        }
      : {}),
  }))

  const validateCreate = v
    .schema<Partial<InvoiceFormValues>>({
      document_date: [v.required({ field: m.document_date() })],
      document_type: [v.required({ field: m.document_type() })],
      customer_id: [v.required({ field: m.customer() })],
      payment_term_id: [v.required({ field: m.payment_term() })],
      currency: [v.required({ field: m.currency() })],
    })
    .build()

  const validateUpdate = v.schema<Partial<InvoiceFormValues>>({}).build()

  const validate = $derived(!record ? validateCreate : validateUpdate)

  // Resolve selector `attr` from the loaded record's snapshots so that the
  // selector inputs render the existing entities in edit mode without a
  // round-trip lookup. Each snapshot is `Record<string, unknown>[]` (the
  // backend wraps the captured entity in a one-item array).
  function firstSnapshot<T>(snap: unknown): T | undefined {
    if (Array.isArray(snap) && snap.length) return snap[0] as T
    if (snap && typeof snap === 'object') return snap as T
    return undefined
  }

  const customerAttr = $derived.by<CustomerSummary | undefined>(() => {
    if (!record?.customer_id) return undefined
    const s = firstSnapshot<Record<string, unknown>>(record.customer_snapshot)
    if (!s) return undefined
    return {
      id: record.customer_id,
      name: (s.name as string) ?? '',
      vat_no: (s.vat_no as string) ?? '',
      categories: [],
      default_currency: (s.default_currency as string) ?? '',
      emails: [],
      phones: [],
    }
  })

  const paymentTermAttr = $derived.by<PaymentTerm | undefined>(() => {
    if (!record?.payment_term_id) return undefined
    const s = firstSnapshot<Record<string, unknown>>(record.payment_term_snapshot)
    if (!s) return undefined
    return { id: record.payment_term_id, name: (s.name as string) ?? '' } as unknown as PaymentTerm
  })

  const legalEntityBankAttr = $derived.by<LegalEntityBank | undefined>(() => {
    if (!record?.legal_entity_bank_id) return undefined
    const s = firstSnapshot<Record<string, unknown>>(record.legal_entity_bank_snapshot)
    if (!s) return undefined
    return {
      id: record.legal_entity_bank_id,
      name: (s.name as string) ?? '',
      iban: (s.iban as string) ?? '',
    } as unknown as LegalEntityBank
  })

  // ---- SDI validation status ----
  // Tracks the outcome of the last `validate` action so the form can surface a
  // persistent green badge on success or an inline error alert with the SDI
  // violations on failure. Resets to `idle` as soon as the user dirties the
  // form — at that point the previous result is stale.
  let validationStatus = $state<'idle' | 'valid' | 'invalid'>('idle')
  let validationViolations = $state<SdiViolation[]>([])
  // Captured from the `withContext` snippet so we can $effect on its `isDirty`.
  let formApi = $state<FormAPI<InvoiceFormValues> | null>(null)

  $effect(() => {
    if (formApi?.isDirty && validationStatus !== 'idle') {
      validationStatus = 'idle'
      validationViolations = []
    }
  })

  function handleValidateSuccess() {
    validationStatus = 'valid'
    validationViolations = []
  }

  function handleValidateError(violations: SdiViolation[]) {
    validationStatus = 'invalid'
    validationViolations = violations
    tick().then(() => {
      if (browser) document.querySelector('[data-scrollable-content]')?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Actions
  const invoiceActions = $derived(
    legalEntityId
      ? createInvoiceActions({
          legalEntityId,
          onSuccess: detail.refetch,
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          onDeleted: () => goto(createRoute({ $id: 'invoices' })),
          onValidateSuccess: handleValidateSuccess,
          onValidateError: handleValidateError,
        })
      : [],
  )

  const actionOptions = $derived.by((): InvoiceActionOptions | null => {
    if (!record) return null
    return {
      targetId: record.id,
      documentNumber: record.document_number,
      version: record.version,
      state: record.state,
      availableTransitions: (record.available_transitions ?? []) as InvoiceTransition[],
    }
  })

  // Standalone primary CTAs — visibility is driven by each action's own
  // `visible()` (mutually exclusive on `availableTransitions`), so at most
  // one of these buttons actually renders.
  const submitAction = $derived(invoiceActions.find(a => a.id === 'submit'))
  const resubmitAction = $derived(invoiceActions.find(a => a.id === 'resubmit'))
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      {resourceConfig}
      locked={isReadOnly}
      onSubmit={values => handleSubmit(values as unknown as Partial<Invoice>)}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="relative flex flex-col gap-6 pb-breadcrumbs">
      {#snippet withContext(formAPI)}
        {((formApi = formAPI as unknown as FormAPI<InvoiceFormValues>), '')}
        <FormErrorMessage columnsLayout />

        {#if validationStatus === 'invalid' && validationViolations.length > 0}
          <Alert.Root variant="destructive" class="max-w-md lg:max-w-none">
            <AlertCircleIcon />
            <Alert.Title>{m.invoice_validation_failed()}</Alert.Title>
            <Alert.Description class="[&_p]:leading-tight">
              <ul class="mt-1 list-disc space-y-1 pl-4">
                {#each validationViolations as v, i (i)}
                  <li>
                    <span class="font-mono text-xs">{v.propertyPath}</span>
                    — {v.message}
                  </li>
                {/each}
              </ul>
            </Alert.Description>
          </Alert.Root>
        {/if}

        <!-- General information -->
        <GroupTitle heading={m.invoice_general_information()}>
          {#snippet description()}
            {m.invoice_general_information_description()}
          {/snippet}

          {#snippet content()}
            {#if record}
              <TextField name="document_number" label={m.document_number()} class={FormFieldClass.MaxWidth} disabled />
            {/if}

            <DateField
              name="document_date"
              label={m.document_date()}
              class={FormFieldClass.MaxWidth}
              disabled={!!record} />

            <SelectField
              name="document_type"
              label={m.document_type()}
              items={documentTypeItems}
              class={FormFieldClass.MaxWidth} />

            <CustomerSelector
              name="customer_id"
              attr={customerAttr}
              onChange={item => handleCustomerChange(item, formAPI.updateField as FormFieldUpdater)}
              class={FormFieldClass.MaxWidth}
              allowOpenRecord />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Billing -->
        <GroupTitle heading={m.invoice_billing()}>
          {#snippet description()}
            {m.invoice_billing_description()}
          {/snippet}

          {#snippet content()}
            <PaymentTermSelector name="payment_term_id" attr={paymentTermAttr} class={FormFieldClass.MaxWidth} />

            <SelectField name="currency" label={m.currency()} items={currencyItems} class={FormFieldClass.MinWidth} />

            <LegalEntityBankSelector
              name="legal_entity_bank_id"
              attr={legalEntityBankAttr}
              class={FormFieldClass.MaxWidth} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Line items -->
        <GroupTitle heading={m.invoice_line_items()} class="max-[11rem]:flex-col">
          {#snippet description()}
            {m.invoice_line_items_description()}
          {/snippet}

          {#snippet content()}
            <InvoiceItemsListEditor
              name="items"
              showLabel={false}
              required={!record}
              currency={(formAPI.values.currency as string) ?? DEFAULT_CURRENCY_CODE}
              defaultVatCode={commercialTermsVatCode}
              refreshKey={record?.version} />
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Notes -->
        <GroupTitle heading={m.invoice_notes_section()}>
          {#snippet description()}
            {m.invoice_notes_section_description()}
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
            {#if validationStatus === 'valid'}
              <div class="mr-2 flex items-center gap-1.5" transition:fly={{ x: 20, duration: 250 }}>
                <CircleCheckFilled class="size-3.5 text-green-600" />
                <span class="text-xs font-semibold">{m.invoice_validation_valid()}</span>
              </div>
            {/if}

            {#if actionOptions}
              <RecordActionMenu buttonVariant="outline" actions={invoiceActions} {actionOptions} />
            {/if}

            <DownloadActionButton
              tooltip={m.invoice_xml_download()}
              onDownload={() =>
                apiDownload({
                  url: `/legal-entities/${legalEntityId}/invoices/${record.id}/xml`,
                  filename: `${record.document_number}.xml`,
                })} />

            {#if record.state === 'draft'}
              <ActionButton type="submit" variant="outline" size="icon" busyLabel="" tooltip={m.save_changes()}>
                <IconDeviceFloppy class="size-4" />
              </ActionButton>
            {/if}

            {#if submitAction && actionOptions}
              <RecordActionButton action={submitAction} {actionOptions} />
            {/if}

            {#if resubmitAction && actionOptions}
              <RecordActionButton action={resubmitAction} {actionOptions} />
            {/if}
          {/if}
        </BottomBar>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
