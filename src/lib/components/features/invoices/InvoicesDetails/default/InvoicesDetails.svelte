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
  import { goto, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import ActionButton from '$components/core/ActionButton.svelte'
  import { ImportMenu } from '$components/core/common/import-menu'
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
  import { v, type FieldValidator } from '$components/core/form/validation'
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import VatSummaryTable from '$components/core/VatSummaryTable.svelte'
  import CustomerSelector from '$components/features/form/CustomerSelector.svelte'
  import InvoiceDueDatesEditor, {
    dueDatesMatchTotal,
    type InvoiceDueDateInput,
  } from '$components/features/form/InvoiceDueDatesEditor.svelte'
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
  import { Button as BaseButton } from '$components/ui/button'
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
    InvoiceableDocument,
    InvoiceableDocumentType,
    InvoiceDocumentType,
    InvoiceItem,
    InvoiceItemInput,
    InvoicePrefill,
    InvoicePrefillDueDate,
    InvoiceTransition,
    LegalEntityBank,
    PaymentMethod,
    PaymentSliceType,
    PaymentTerm,
    VatSummaryEntry,
  } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import {
    currencyLabels,
    invoiceDocumentTypeLabels,
    paymentSliceTypeLabels,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import type { BasicOption } from '$lib/utils/generics'
  import { generateId } from '$lib/utils/id'
  import { api, apiDownload, apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import { extractSnapshotString, type SnapshotShape } from '$lib/utils/snapshots'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices.js'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle'
  import CircleCheckFilled from '@tabler/icons-svelte/icons/circle-check-filled'
  import IconDeviceFloppy from '@tabler/icons-svelte/icons/device-floppy'
  import IconX from '@tabler/icons-svelte/icons/x'
  import { tick } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { fly } from 'svelte/transition'
  import ImportDateRange from './ImportDateRange.svelte'
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
      if (line.type === 'charge') {
        return {
          type: 'charge' as const,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          vat_code_id: line.vat_code_id,
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
      if (line.type === 'charge') {
        return {
          type: 'charge' as const,
          description: line.description,
          quantity: line.quantity,
          uom: line.unit_of_measure,
          unit_price: line.unit_price,
          net_value: line.net_value,
          vat_code_id: line.vat_code_id,
          vat_code_snapshot: Array.isArray(line.vat_code_snapshot) ? line.vat_code_snapshot[0] : line.vat_code_snapshot,
          tax_amount: line.tax_amount,
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
   * Normalize a due-dates list (record / prefill / editor shape) to the API
   * contract: drop `id`/`invoice_id`, re-index `position`, keep the calendar day
   * only, and coerce `amount` to a number. Tolerant of partially-shaped input.
   */
  function mapDueDatesToPayload(
    dueDates:
      | Array<{ position?: number; due_date: string; amount: string | number; payment_method: PaymentMethod }>
      | undefined,
  ): InvoiceDueDateInput[] {
    if (!dueDates) return []
    return dueDates.map((d, index) => ({
      position: d.position ?? index + 1,
      due_date: typeof d.due_date === 'string' && d.due_date.length > 10 ? d.due_date.slice(0, 10) : d.due_date,
      amount: typeof d.amount === 'string' ? Number.parseFloat(d.amount) : d.amount,
      payment_method: d.payment_method,
    }))
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
      // A cumulative invoice bills several orders/DDTs — the header can't point to a
      // single one, so it's nulled and every line stays traced by its own
      // `sales_order_item_id` (otherwise the create rejects the other orders' lines).
      sales_order_id: isCumulative ? null : (data.sales_order_id as string) || undefined,
      // Flat slice pointer (payment gate) + the standalone payment term that drives
      // server-side due-date regeneration. The invoice carries no payment composition.
      // `payment_slice_position` is `null` for Saldo (DDT / direct) — echoed as-is.
      payment_slice_type: (data.slice_type as PaymentSliceType) || undefined,
      payment_slice_position: (data.slice_position ?? null) as number | null,
      payment_term_id: (data.payment_term_id as string) || undefined,
      legal_entity_bank_id: (data.legal_entity_bank_id as string) || undefined,
      currency: data.currency,
      notes_internal: data.notes_internal,
      notes_external: data.notes_external,
      items: mapItemsToInvoicePayload((data.items as QuotationLineItem[] | undefined) ?? []),
      // Send an empty schedule whenever it's server-managed (term changed, or a
      // cumulative invoice) so the backend regenerates it from the shared term on
      // the combined total (see business-logic → Invoice → Payment due dates).
      due_dates: dueDatesServerManaged ? [] : mapDueDatesToPayload(data.due_dates as InvoiceDueDateInput[] | undefined),
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

  // Ref to the items list editor — drives the prefill flow that appends imported lines.
  let itemsEditorRef: InvoiceItemsListEditor | undefined = $state()

  // VAT codes by id, lazily fetched once per mount during the first prefill. The
  // prefill endpoint only ships `vat_code_id` on item/charge lines (no inline
  // snapshot), so we resolve labels here to populate `vat_code_snapshot` on the
  // editor-shape items. VAT codes are session-stable, no need to invalidate.
  let vatCodesById = $state<Map<string, VatCodeSummary>>(new Map())

  // Server-computed totals captured from the prefill response. Display-only —
  // the backend recomputes them on save from the line items. Cleared by
  // `clearPrefill`. The prefill due dates seed the editable schedule below.
  let prefillTotals = $state<InvoicePrefill['totals'] | null>(null)
  let prefillDueDates = $state<InvoicePrefillDueDate[]>([])
  // Server-computed VAT breakdown captured from the prefill response. Display-only,
  // cleared by `clearPrefill`. Mirrors `record.vat_summary` in edit mode.
  let prefillVatSummary = $state<VatSummaryEntry[]>([])
  // The payment term the prefilled schedule was computed against. The schedule is
  // only directly editable while the selected term still matches this baseline —
  // see `paymentTermMismatch`. Cleared by `clearPrefill`.
  let prefillPaymentTermId = $state<string | null>(null)

  const displayTotals = $derived.by<{ net: number; tax: number; total: number } | null>(() => {
    if (record) return { net: record.total_net, tax: record.total_tax, total: record.total_amount }
    if (prefillTotals) return prefillTotals
    return null
  })

  // VAT breakdown for display — the loaded record in edit mode, falling back to the
  // prefill-supplied summary in create mode.
  const displayVatSummary = $derived<VatSummaryEntry[] | undefined>(record?.vat_summary ?? prefillVatSummary)

  // Seed value for the editable due-dates schedule — the loaded record in edit
  // mode, falling back to the prefill-suggested schedule in create mode. The
  // editor re-hydrates whenever this content changes (load, prefill, clear).
  const dueDatesEditorValue = $derived(record?.due_dates ?? prefillDueDates)

  async function ensureVatCodesLoaded(): Promise<void> {
    if (vatCodesById.size > 0) return
    const { data } = await api.safe.get<{ data: VatCodeSummary[] }>('/vat-codes', {
      queryParams: { direction: 'vendita', per_page: 500 },
    })
    if (data?.data) vatCodesById = new Map(data.data.map(v => [v.id, v]))
  }

  /** Build the minimal snapshot shape used by the editor's locked-item / charge views. */
  function buildVatCodeSnapshot(id: string | undefined): Record<string, unknown> | undefined {
    if (!id) return undefined
    const vat = vatCodesById.get(id)
    if (!vat) return undefined
    return { id: vat.id, code: vat.code, description: vat.description, rate: vat.rate }
  }

  // Snapshots populated by the invoiceable-documents prefill flow, so selectors
  // (Customer / PaymentTerm / LegalEntityBank) render the entity name in create
  // mode without an extra fetch. In edit mode `record.*_snapshot` takes precedence.
  // The prefill response ships the full `customer`, `payment_term` and
  // `legal_entity_bank` objects, so these are filled directly from the response.
  const customerSnapshotImport = createImportedSnapshot()
  const paymentTermSnapshotImport = createImportedSnapshot()
  const legalEntityBankSnapshotImport = createImportedSnapshot()

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
  const sliceTypeItems = toSelectItems(paymentSliceTypeLabels)

  type InvoiceFormValues = {
    document_date: string
    document_type: InvoiceDocumentType
    customer_id: string
    sales_order_id: string
    // Lean slice pointer this invoice realizes (sent flat as `payment_slice_*` on save).
    // `slice_position` is null for Saldo invoices (DDT / direct).
    slice_type: PaymentSliceType
    slice_position: number | null
    payment_term_id: string
    legal_entity_bank_id: string
    currency: Currency
    notes_internal: string
    notes_external: string
    items: QuotationLineItem[]
    // FE-owned payment schedule — synced wholesale to the API on save.
    due_dates: InvoiceDueDateInput[]
  }

  const initialValues = $derived.by<InvoiceFormValues>(() => ({
    document_date: new Date().toISOString(),
    document_type: 'TD01' as InvoiceDocumentType,
    customer_id: '',
    sales_order_id: '',
    slice_type: 'saldo' as PaymentSliceType,
    slice_position: null,
    payment_term_id: '',
    legal_entity_bank_id: '',
    currency: DEFAULT_CURRENCY_CODE as Currency,
    notes_internal: '',
    notes_external: '',
    items: [],
    due_dates: [],
    ...(record
      ? {
          ...record,
          items: mapItemsToEditorShape(record.items),
          due_dates: mapDueDatesToPayload(record.due_dates),
          // Map the record's flat slice pointer onto the form field names.
          slice_type: (record.payment_slice_type ?? 'saldo') as PaymentSliceType,
          slice_position: record.payment_slice_position ?? null,
          payment_term_id: record.payment_term_id ?? '',
        }
      : {}),
  }))

  // The scheduled due-date amounts must add up to the invoice total. The total is
  // server-computed (not a form field), so the validator reads it lazily from
  // `displayTotals` at validation time. Skipped while the payment term diverges
  // from the baseline — the schedule is then cleared and the backend regenerates
  // it on save, so there's nothing to balance. Applied to both create and update.
  const dueDatesTotalRule = dueDatesMatchTotal<Partial<InvoiceFormValues>>(() => displayTotals?.total)
  const validateDueDatesTotal: FieldValidator<Partial<InvoiceFormValues>> = (value, values) =>
    dueDatesServerManaged ? undefined : dueDatesTotalRule(value, values)

  // Payment term is no longer mandatory — an invoice may save without one (the
  // server simply skips due-date generation).
  const validateCreate = v
    .schema<Partial<InvoiceFormValues>>({
      document_date: [v.required({ field: m.document_date() })],
      document_type: [v.required({ field: m.document_type() })],
      customer_id: [v.required({ field: m.customer() })],
      currency: [v.required({ field: m.currency() })],
      due_dates: [validateDueDatesTotal],
    })
    .build()

  const validateUpdate = v.schema<Partial<InvoiceFormValues>>({ due_dates: [validateDueDatesTotal] }).build()

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

  /**
   * Resolve the displayable snapshot for a selector — record's snapshot in edit
   * mode, falls back to the imported one populated by the prefill flow in create
   * mode. The id comes from the record (edit) or from the current form value
   * (create, after prefill set it via `updateField`).
   */
  function resolveSelectorSnapshot(
    recordSnapshot: unknown,
    importedValue: SnapshotShape | undefined,
  ): Record<string, unknown> | undefined {
    if (recordSnapshot) return firstSnapshot<Record<string, unknown>>(recordSnapshot)
    if (Array.isArray(importedValue)) return importedValue[0] as Record<string, unknown> | undefined
    if (importedValue && typeof importedValue === 'object') return importedValue as Record<string, unknown>
    return undefined
  }

  const customerAttr = $derived.by<CustomerSummary | undefined>(() => {
    const s = resolveSelectorSnapshot(record?.customer_snapshot, customerSnapshotImport.value)
    const id = record?.customer_id || (formApi?.values.customer_id as string | undefined)
    if (!id || !s) return undefined
    return {
      id,
      name: (s.name as string) ?? '',
      vat_no: (s.vat_no as string) ?? '',
      categories: [],
      default_currency: (s.default_currency as string) ?? '',
      emails: [],
      phones: [],
    }
  })

  // Neither the prefill nor the saved invoice ships a payment-term snapshot — only
  // the id. We fetch the term once per id (edit load / prefill) so the selector can
  // render its name without the user having to open the dropdown. The fetched term
  // lands in `paymentTermSnapshotImport`, consumed by `paymentTermAttr` below.
  let paymentTermSnapshotFetchedId: string | undefined
  async function ensurePaymentTermSnapshot(id: string | undefined): Promise<void> {
    if (!id || !legalEntityId) return
    if (paymentTermSnapshotFetchedId === id) return
    paymentTermSnapshotFetchedId = id
    const { data } = await api.safe.get<PaymentTerm>(`/legal-entities/${legalEntityId}/payment-terms/${id}`)
    if (data && paymentTermSnapshotFetchedId === id) {
      paymentTermSnapshotImport.value = data as unknown as SnapshotShape
    }
  }

  // Resolve the saved invoice's payment term for display on edit-mode load.
  $effect(() => {
    if (record?.payment_term_id) ensurePaymentTermSnapshot(record.payment_term_id)
  })

  const paymentTermAttr = $derived.by<PaymentTerm | undefined>(() => {
    const s = resolveSelectorSnapshot(undefined, paymentTermSnapshotImport.value)
    const id = record?.payment_term_id || (formApi?.values.payment_term_id as string | undefined)
    if (!id || !s || s.id !== id) return undefined
    return { id, name: (s.name as string) ?? '', code: (s.code as string) ?? '' } as unknown as PaymentTerm
  })

  // Baseline payment term the due-date schedule was generated against: the saved
  // invoice's term in edit mode, the prefill's term in create mode.
  const baselinePaymentTermId = $derived<string | null>(record ? record.payment_term_id || null : prefillPaymentTermId)

  // True once a baseline exists (prefill done / editing a draft) and the user has
  // picked a different payment term. While true the due-date editor is hidden and
  // the schedule is sent empty so the backend regenerates it on save.
  const paymentTermMismatch = $derived.by<boolean>(() => {
    if (baselinePaymentTermId == null) return false
    const selected = (formApi?.values.payment_term_id as string | undefined) ?? ''
    return selected !== baselinePaymentTermId
  })

  const legalEntityBankAttr = $derived.by<LegalEntityBank | undefined>(() => {
    const s = resolveSelectorSnapshot(record?.legal_entity_bank_snapshot, legalEntityBankSnapshotImport.value)
    const id = record?.legal_entity_bank_id || (formApi?.values.legal_entity_bank_id as string | undefined)
    if (!id || !s) return undefined
    return {
      id,
      name: (s.name as string) ?? '',
      iban: (s.iban as string) ?? '',
    } as unknown as LegalEntityBank
  })

  // Currency used for displaying totals and due-date amounts. Resolves to the
  // selected/prefilled customer's `default_currency` when available, falling
  // back to the invoice's own currency field (and ultimately the system default).
  const displayCurrency = $derived.by<string>(() => {
    return customerAttr?.default_currency || (formApi?.values.currency as string | undefined) || DEFAULT_CURRENCY_CODE
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

  // ---- Import flow: invoiceable documents → invoice draft ----

  /**
   * List importable invoiceable documents for the ImportMenu picker. Free-text
   * search is forwarded; pagination is widened so the picker has a meaningful
   * pool to choose from.
   */
  async function fetchImportableInvoiceableDocuments(search?: string): Promise<InvoiceableDocument[]> {
    if (!legalEntityId) return []
    const queryParams: Record<string, string> = { per_page: '200' }
    if (search) queryParams.search = search
    if (importDateFrom) queryParams.date_from = importDateFrom
    if (importDateTo) queryParams.date_to = importDateTo
    const response = await apiRequest<{ data: InvoiceableDocument[] }>({
      url: `/legal-entities/${legalEntityId}/invoiceable-documents`,
      method: 'GET',
      queryParams,
    })
    return response.data ?? []
  }

  function mapInvoiceableToOption(doc: InvoiceableDocument): BasicOption {
    const customerName = extractSnapshotString(doc.customer_snapshot, 'name') ?? '—'
    return {
      label: `${doc.source.document_number} · ${customerName}`,
      value: doc.source.id,
    }
  }

  /** Convert prefill API line shape (`unit_of_measure`, `discount_percentage`) into
   *  the editor's internal shape (`uom`, `discount_percent`). */
  function mapPrefillItemsToEditorShape(items: InvoiceItemInput[]): QuotationLineItem[] {
    return items.map(line => {
      if (line.type === 'descriptive') {
        return {
          type: 'descriptive',
          description: line.description,
          sales_order_item_id: line.sales_order_item_id,
          transport_document_item_id: line.transport_document_item_id,
        }
      }
      if (line.type === 'charge') {
        return {
          type: 'charge',
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          vat_code_id: line.vat_code_id,
          vat_code_snapshot: buildVatCodeSnapshot(line.vat_code_id),
          sales_order_item_id: line.sales_order_item_id,
          transport_document_item_id: line.transport_document_item_id,
        }
      }
      return {
        type: 'item',
        item_id: line.item_id,
        // The prefill ships the article code flat (no item snapshot) — wrap it in a
        // minimal snapshot so locked lines render the code like saved invoices do.
        item_snapshot: line.code ? { code: line.code, name: line.description } : undefined,
        description: line.description,
        quantity: line.quantity,
        uom: line.unit_of_measure,
        unit_price: line.unit_price,
        discount_percent: line.discount_percentage ?? undefined,
        vat_code_id: line.vat_code_id,
        vat_code_snapshot: buildVatCodeSnapshot(line.vat_code_id),
        sales_order_item_id: line.sales_order_item_id,
        transport_document_item_id: line.transport_document_item_id,
      }
    })
  }

  /**
   * Build the `descriptive` reference header for a prefill line's `source_reference`
   * (e.g. "Rif. Vs ordine: SO-… del … - Rif. Ns DDT DDT-… del …"). Each part is
   * dropped when its document is absent, and falls back to the date-less copy when
   * the source ships no date. Returns "" when the line cites neither.
   */
  function buildReferenceHeader(ref: InvoiceItemInput['source_reference']): string {
    const parts: string[] = []
    const order = ref?.order
    if (order?.number) {
      parts.push(
        order.date
          ? m.invoice_reference_order({ documentNumber: order.number, date: new Date(order.date).toLocaleDateString() })
          : m.invoice_reference_order_no_date({ documentNumber: order.number }),
      )
    }
    const td = ref?.transport_document
    if (td?.number) {
      parts.push(
        td.date
          ? m.invoice_reference_transport_document({
              documentNumber: td.number,
              date: new Date(td.date).toLocaleDateString(),
            })
          : m.invoice_reference_transport_document_no_date({ documentNumber: td.number }),
      )
    }
    return parts.join(' - ')
  }

  /**
   * Partition the prefilled lines into consecutive runs by their per-line
   * `source_reference`, prepending a `descriptive` reference header whenever the
   * `(order number, DDT number)` key changes from the previous line (walking the
   * lines top-to-bottom, in the order the backend returned them). A run with no
   * order/DDT (e.g. a scomputo charge) gets no header. The header carries no link
   * id, so it stays user-editable/removable and isn't treated as a locked line.
   * `rawItems` and `editorItems` are parallel arrays (same index = same line).
   */
  function buildPrefilledItemGroups(
    rawItems: InvoiceItemInput[],
    editorItems: QuotationLineItem[],
  ): QuotationLineItem[][] {
    const groups: QuotationLineItem[][] = []
    let currentKey: string | null = null
    let current: QuotationLineItem[] | null = null

    editorItems.forEach((item, index) => {
      const ref = rawItems[index]?.source_reference
      const key = `${ref?.order?.number ?? ''}|${ref?.transport_document?.number ?? ''}`

      if (key !== currentKey) {
        currentKey = key
        current = []
        groups.push(current)
        const header = buildReferenceHeader(ref)
        if (header) current.push({ type: 'descriptive', description: header })
      }
      current!.push(item)
    })

    return groups
  }

  /**
   * Prefill the form from a single invoiceable source and ACCUMULATE its lines:
   * - GET /invoices/prefill (header + lines + totals). `slice_position` is required
   *   for slice-addressed sources (`order_acconto` / `order_sal`) and omitted for the
   *   Saldo-bearing ones.
   * - The FIRST imported source (form still empty) fills the header, slice pointer,
   *   payment term, totals and the suggested schedule; subsequent compatible sources
   *   only append their line groups. This composes the cumulative invoice (fattura
   *   riepilogativa) entirely on the FE — the merged schedule is regenerated by the
   *   backend on save from the shared term (we POST empty `due_dates[]`).
   * Deduplicates by source id. Returns the number of line items appended.
   */
  async function prefillSource(
    sourceType: InvoiceableDocumentType,
    sourceId: string,
    slicePosition?: number,
  ): Promise<number> {
    if (!legalEntityId || !formApi || !itemsEditorRef) return 0
    // Skip a source already merged (e.g. re-picked in the menu).
    if (prefilledSources.some(s => s.id === sourceId)) return 0

    // The first imported source fills the header; later ones only append lines.
    const fillHeader = prefilledSources.length === 0

    // `slice_position` addresses the specific unpaid slice for Acconto/SAL sources;
    // it must be omitted for the Saldo-bearing sources (one prefill each).
    const queryParams: Record<string, string> = { source_type: sourceType, source_id: sourceId }
    if ((sourceType === 'order_acconto' || sourceType === 'order_sal') && slicePosition != null) {
      queryParams.slice_position = String(slicePosition)
    }

    // VAT codes are needed to render labels on prefilled item/charge lines;
    // fetched in parallel with the prefill (no-op if already cached).
    const [prefill] = await Promise.all([
      apiRequest<InvoicePrefill>({
        url: `/legal-entities/${legalEntityId}/invoices/prefill`,
        method: 'GET',
        queryParams,
      }),
      ensureVatCodesLoaded(),
    ])

    const update = formApi.updateField as FormFieldUpdater

    if (fillHeader) {
      // The prefill response ships the resolved entity objects (`customer`,
      // `legal_entity_bank`) inline — no per-entity GETs needed.
      if (prefill.customer) customerSnapshotImport.value = prefill.customer as unknown as SnapshotShape
      if (prefill.legal_entity_bank)
        legalEntityBankSnapshotImport.value = prefill.legal_entity_bank as unknown as SnapshotShape

      if (prefill.document_date) update('document_date', prefill.document_date)
      if (prefill.document_type) update('document_type', prefill.document_type)
      if (prefill.customer_id) update('customer_id', prefill.customer_id)
      if (prefill.sales_order_id) update('sales_order_id', prefill.sales_order_id)
      if (prefill.legal_entity_bank_id) update('legal_entity_bank_id', prefill.legal_entity_bank_id)
      if (prefill.currency) update('currency', prefill.currency)
      if (prefill.notes_internal) update('notes_internal', prefill.notes_internal)
      if (prefill.notes_external) update('notes_external', prefill.notes_external)

      // Flat slice pointer + standalone payment term echoed by the prefill.
      // `payment_slice_position` is null for Saldo (DDT / direct) — written through
      // as-is so the payload echoes it. The term seeds the selector and becomes the
      // baseline the due-date schedule is measured against (`paymentTermMismatch`).
      if (prefill.payment_slice_type) update('slice_type', prefill.payment_slice_type)
      update('slice_position', prefill.payment_slice_position)
      update('payment_term_id', prefill.payment_term_id ?? '')
      prefillPaymentTermId = prefill.payment_term_id || null
      // The prefill ships only the term id (no snapshot) — fetch its name so the
      // selector renders the preselected term without the user opening it.
      if (prefill.payment_term_id) ensurePaymentTermSnapshot(prefill.payment_term_id)

      if (prefill.customer_id) await fetchCustomerCommercialTerms(prefill.customer_id)

      // Server-computed totals (display-only) and the suggested payment schedule of
      // the FIRST source. For a single source these drive the totals panel and the
      // editable schedule; once a second source is merged the invoice becomes
      // cumulative and both are deferred to save (see `isCumulative`).
      prefillTotals = prefill.totals ?? null
      prefillVatSummary = prefill.vat_summary ?? []
      prefillDueDates = prefill.due_dates ?? []
      update('due_dates', mapDueDatesToPayload(prefill.due_dates))
    }

    const rawItems = prefill.items ?? []
    const editorItems = mapPrefillItemsToEditorShape(rawItems)
    if (editorItems.length > 0) {
      // Split the source's lines into consecutive per-reference runs, each led by a
      // reference descriptive header, and append every run with its own `groupId`
      // so the editor color-codes lines by source document.
      for (const group of buildPrefilledItemGroups(rawItems, editorItems)) {
        itemsEditorRef.addItems(group, { groupId: generateId() })
      }
    }

    prefilledSources = [...prefilledSources, { id: sourceId, type: sourceType }]
    return editorItems.length
  }

  /** Single-source entry point (URL auto-prefill): prefill + accumulate, with a toast. */
  async function applyPrefillFromSource(sourceType: InvoiceableDocumentType, sourceId: string, slicePosition?: number) {
    const job = prefillSource(sourceType, sourceId, slicePosition).then(added => ({ added }))
    toast.promise(job, {
      loading: m.import_in_progress(),
      success: res => m.import_completed({ count: res.added }),
      error: () => m.import_failed(),
    })
    await job
  }

  /**
   * Multi-select import: prefill each picked invoiceable document in turn and
   * accumulate the lines into a single invoice (cumulative-invoice flow). Sequential
   * so the first source fills the header before the rest append onto it.
   */
  async function handleImportInvoiceable(selected: InvoiceableDocument[]) {
    if (selected.length === 0) return
    const job = (async () => {
      let added = 0
      for (const doc of selected) {
        added += await prefillSource(doc.type, doc.source.id, doc.slice_position)
      }
      return { added }
    })()
    toast.promise(job, {
      loading: m.import_in_progress(),
      success: res => m.import_completed({ count: res.added }),
      error: () => m.import_failed(),
    })
    await job
  }

  /**
   * Compatibility key for the multi-select picker. DDTs (`order_saldo_from_transport`)
   * sharing the same customer + Saldo payment term + suggested document type can be
   * merged into one cumulative invoice. Every other type — and DDTs with no resolved
   * Saldo term — get a unique key, so they can only ever be imported on their own.
   */
  // Saldo-type sources that can be merged into one cumulative invoice (riepilogativa):
  // several DDTs, or several direct service orders. The two kinds never mix (TD24/25
  // vs TD01). Acconto / SAL are single-slice and never accumulate.
  function isAccumulableSourceType(type: InvoiceableDocumentType): boolean {
    return type === 'order_saldo_from_transport' || type === 'order_saldo_direct'
  }

  function importCompatKey(doc: InvoiceableDocument): string {
    if (isAccumulableSourceType(doc.type) && doc.payment_term_id) {
      // Keyed by source kind too, so DDTs and direct orders never share an anchor.
      return `${doc.type}|${doc.customer_id}|${doc.payment_term_id}|${doc.document_type ?? ''}`
    }
    return `SINGLE|${doc.source.id}`
  }

  /**
   * Form-anchored lock: once the form already holds an imported source, only
   * additional compatible DDTs may be added. Anything stacked onto a non-DDT source,
   * or a DDT whose customer / term / document type differs from the form, is locked.
   * Inactive while the form is still empty (the compat anchor handles the first
   * multi-select session).
   */
  function isImportLocked(doc: InvoiceableDocument): boolean {
    if (prefilledSources.length === 0) return false
    // Accumulation is anchored to the first imported source's kind: only the same
    // accumulable Saldo type may stack onto it (no DDT + direct-order mixing).
    const anchorType = prefilledSources[0].type
    if (!isAccumulableSourceType(anchorType)) return true
    if (doc.type !== anchorType || !doc.payment_term_id) return true
    return (
      doc.customer_id !== formApi?.values.customer_id ||
      doc.payment_term_id !== formApi?.values.payment_term_id ||
      doc.document_type !== formApi?.values.document_type
    )
  }

  // Invoiceable sources merged into this draft (one entry per imported DDT/slice).
  // Drives the reset-button visibility, the cumulative-invoice state and the
  // picker's compatibility lock.
  let prefilledSources = $state<{ id: string; type: InvoiceableDocumentType }[]>([])
  const prefilledMode = $derived(prefilledSources.length > 0)
  // Cumulative invoice = more than one source merged. The totals/VAT panel and the
  // due-date schedule are then deferred to save (the backend recomputes both from
  // the combined lines + shared term), since per-source previews don't combine.
  const isCumulative = $derived(prefilledSources.length > 1)

  // The schedule is server-managed (editor hidden, POST empty `due_dates[]`, backend
  // regenerates) when the term diverges from the baseline OR when the invoice is
  // cumulative — the merged DDTs share one term and the schedule is sized on the
  // combined total, which only the backend can compute.
  const dueDatesServerManaged = $derived(paymentTermMismatch || isCumulative)

  // Forces the items editor to re-hydrate from the (now empty) form values on
  // clear. Bumped by `clearPrefill`; threaded through `refreshKey` below.
  let prefillResetCounter = $state(0)

  // Picker date-range filter (`date_from` / `date_to`), seeded to the current month
  // for end-of-month recap invoices. The user can widen it; the picker re-fetches
  // on its next open. Detached from the form via the ImportDateRange island.
  const initialImportMonth = browser ? monthBoundsIso(new Date()) : { from: '', to: '' }
  let importDateFrom = $state(initialImportMonth.from)
  let importDateTo = $state(initialImportMonth.to)

  /** First and last calendar day of the given date's month, as `YYYY-MM-DD`. */
  function monthBoundsIso(date: Date): { from: string; to: string } {
    const pad = (n: number) => String(n).padStart(2, '0')
    const from = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const to = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`
    return { from, to }
  }

  /**
   * Reverts the form to its initial empty state — resets header fields, drops
   * imported snapshots, clears item lines and strips the `?source_type/source_id`
   * query params (so a reload doesn't re-trigger the auto-prefill).
   */
  function clearPrefill() {
    customerSnapshotImport.reset()
    paymentTermSnapshotImport.reset()
    paymentTermSnapshotFetchedId = undefined
    legalEntityBankSnapshotImport.reset()
    commercialTermsVatCode = undefined
    prefillTotals = null
    prefillVatSummary = []
    prefillDueDates = []
    prefillPaymentTermId = null
    prefilledSources = []

    // Clear items first — bypasses the per-row remove-button gating so
    // backend-locked rows (e.g. `charge`) are wiped just like the rest.
    itemsEditorRef?.clearItems()

    formApi?.reset()
    // Bump the editor's refreshKey so it re-reads `form.values.items` (now empty).
    prefillResetCounter++

    if (browser) {
      const url = page.url
      const params = new URLSearchParams(url.searchParams)
      if (params.has('source_type') || params.has('source_id') || params.has('slice_position')) {
        params.delete('source_type')
        params.delete('source_id')
        params.delete('slice_position')
        const next = params.toString()
        replaceState(next ? `${url.pathname}?${next}` : url.pathname, page.state)
      }
    }

    // Intentionally NOT resetting `autoPrefillTriggered`: that flag exists to
    // make the URL-driven auto-prefill a one-shot per mount. Toggling it back
    // here re-fires the auto-trigger $effect, and if the URL strip below
    // hasn't propagated to `page.url` yet (microtask timing), the effect sees
    // stale params and re-runs the very prefill we just cleared.
  }

  // Auto-trigger prefill on create mode when `?source_type=…&source_id=…[&slice_position=…]`
  // is in the URL (entry point from the InvoiceableDocumentsTable action). Runs at most once per mount.
  let autoPrefillTriggered = $state(false)
  $effect(() => {
    if (autoPrefillTriggered) return
    if (!browser || !formApi || !itemsEditorRef || !legalEntityId) return
    if (uuid) return // edit mode — skip
    const params = page.url.searchParams
    const sourceType = params.get('source_type') as InvoiceableDocumentType | null
    const sourceId = params.get('source_id')
    if (!sourceType || !sourceId) return
    const slicePositionRaw = params.get('slice_position')
    autoPrefillTriggered = true
    applyPrefillFromSource(sourceType, sourceId, slicePositionRaw ? Number(slicePositionRaw) : undefined)
  })

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

        {#if !record}
          <GroupTitle heading={m.import_records()}>
            {#snippet description()}
              {m.import_records_description()}
            {/snippet}

            {#snippet content()}
              <div class="flex flex-wrap items-end gap-2">
                <!-- Scope the candidate DDTs to a period (defaults to the current month
                     for end-of-month recap invoices); feeds date_from/date_to to the picker. -->
                <ImportDateRange
                  from={importDateFrom}
                  to={importDateTo}
                  onFromChange={v => (importDateFrom = v)}
                  onToChange={v => (importDateTo = v)} />

                <ImportMenu
                  fetchFunction={fetchImportableInvoiceableDocuments}
                  optionMappingFunction={mapInvoiceableToOption}
                  compatKey={importCompatKey}
                  lockWhen={isImportLocked}
                  onimport={handleImportInvoiceable} />

                {#if prefilledMode}
                  <BaseButton variant="ghost" size="sm" onclick={clearPrefill}>
                    <IconX class="size-4" />
                    {m.reset_import()}
                  </BaseButton>
                {/if}
              </div>
            {/snippet}
          </GroupTitle>

          <Separator />
        {/if}

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
            <SelectField
              name="slice_type"
              label={m.payment_slice_type()}
              items={sliceTypeItems}
              class={FormFieldClass.MaxWidth} />

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
              bind:this={itemsEditorRef}
              name="items"
              showLabel={false}
              required={!record}
              currency={(formAPI.values.currency as string) ?? DEFAULT_CURRENCY_CODE}
              defaultVatCode={commercialTermsVatCode}
              lockStructure={isReadOnly}
              isItemLocked={line => !!line.transport_document_item_id || !!line.sales_order_item_id}
              refreshKey={record?.version ?? prefillResetCounter} />
          {/snippet}
        </GroupTitle>

        {#if isCumulative}
          <Separator />

          <!-- Cumulative invoice: per-source previews don't combine, so totals + VAT
               are deferred to save (the backend recomputes them on the merged lines). -->
          <GroupTitle heading={m.invoice_totals_section()}>
            {#snippet description()}
              {m.invoice_totals_section_description()}
            {/snippet}

            {#snippet content()}
              <Alert.Root class="max-w-md lg:max-w-none">
                <AlertCircleIcon />
                <Alert.Description>{m.invoice_totals_computed_on_save()}</Alert.Description>
              </Alert.Root>
            {/snippet}
          </GroupTitle>
        {:else if displayTotals}
          <Separator />

          <!-- Totals — VAT breakdown + document totals (display-only, server-computed) -->
          <GroupTitle heading={m.invoice_totals_section()}>
            {#snippet description()}
              {m.invoice_totals_section_description()}
            {/snippet}

            {#snippet content()}
              <div class="flex flex-col items-end gap-6 pr-12">
                <VatSummaryTable rows={displayVatSummary} currencyCode={displayCurrency} class="w-full max-w-md" />

                <StackedAmountValues
                  title={m.total()}
                  rows={[
                    { label: m.net_total(), value: displayTotals.net, currencyCode: displayCurrency },
                    { label: m.tax_total(), value: displayTotals.tax, currencyCode: displayCurrency },
                    {
                      type: 'grandtotal',
                      label: m.total(),
                      value: displayTotals.total,
                      currencyCode: displayCurrency,
                    },
                  ]} />
              </div>
            {/snippet}
          </GroupTitle>
        {/if}

        <Separator />

        <!-- Payments — editable FE-owned due-date schedule (synced wholesale on save) -->
        <GroupTitle heading={m.invoice_payments_section()}>
          {#snippet description()}
            {m.invoice_payments_section_description()}
          {/snippet}

          {#snippet content()}
            {#if dueDatesServerManaged}
              <!-- Schedule is server-managed (term changed, or cumulative invoice): not
                   editable here; the backend regenerates it from the shared term on save. -->
              <Alert.Root class="max-w-md lg:max-w-none">
                <AlertCircleIcon />
                <Alert.Description>{m.invoice_due_dates_term_changed_notice()}</Alert.Description>
              </Alert.Root>
            {:else}
              <InvoiceDueDatesEditor
                name="due_dates"
                showLabel={false}
                value={dueDatesEditorValue}
                currency={displayCurrency}
                expectedTotal={displayTotals?.total} />
            {/if}
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
