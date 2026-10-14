<!--
  @component SupplierInvoiceDetails
  @description Read-only overview of a received invoice (fattura ricevuta).
  On open it marks a "Nuova" invoice as seen (POST …/view). Sections: supplier
  link (aggancio: create supplier from the cedente, link to an existing one,
  retry the automatic match with its outcome, or change supplier), anomalies
  (A-Cube notice, quarantine, possible duplicate), cedente with P.IVA/CF,
  totals, lines, order/DDT references and the files embedded in the XML.
  Bottom bar downloads the XML and the PDF rendering. Provides the invoice to
  page state for SupplierInvoiceSidebar.
  @keywords supplier invoice, received invoice, fattura ricevuta, passive, detail, overview, link, aggancio, cedente
  @uses RequestPlaceholder, GroupTitle, LinkSupplierDialog, SupplierInvoiceStatusBadge, SupplierInvoiceFlagBadges, DownloadActionMenu
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice} -> SupplierInvoice
  @api POST /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/view
  @api POST /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/create-supplier
  @api POST /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/relink
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/xml
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/pdf
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/attachments/{index}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierInvoiceDetailsContract as contract } from './SupplierInvoiceDetails.contract.js'
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import DownloadActionMenu from '$components/core/DownloadActionMenu.svelte'
  import BottomBar from '$components/core/form/BottomBar.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import InvoicePaymentStatusBadge from '$components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import { flattenValues, formatCalendarDay } from '$components/features/supplier-invoices/format'
  import LinkSupplierDialog from '$components/features/supplier-invoices/LinkSupplierDialog.svelte'
  import {
    cedenteName,
    createSupplierFromInvoice,
    markSupplierInvoiceViewed,
    relinkSupplierInvoice,
  } from '$components/features/supplier-invoices/supplier-invoice-actions'
  import SupplierInvoiceFlagBadges from '$components/features/supplier-invoices/SupplierInvoiceFlagBadges.svelte'
  import SupplierInvoiceStatusBadge from '$components/features/supplier-invoices/SupplierInvoiceStatusBadge.svelte'
  import * as Alert from '$components/ui/alert'
  import { Button } from '$components/ui/button'
  import Separator from '$components/ui/separator/separator.svelte'
  import * as Table from '$components/ui/table'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplierInvoice, SupplierInvoiceMatchOutcome } from '$lib/types/api-types'
  import { showActionErrorToast } from '$lib/utils/action-error-toast'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { getSupplierInvoiceDocumentTypeLabel, supplierInvoiceMatchOutcomeLabels } from '$lib/utils/enum-labels'
  import { hasPermission } from '$lib/utils/permissions'
  import { floatToPriceString } from '$lib/utils/prices'
  import { api, apiDownload, ApiError, extractApiErrorMessage, type SafeApiResponse } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle'
  import FileCodeIcon from '@lucide/svelte/icons/file-code'
  import FileTextIcon from '@lucide/svelte/icons/file-text'
  import IconDownload from '@tabler/icons-svelte/icons/download'
  import IconLink from '@tabler/icons-svelte/icons/link'
  import IconRefresh from '@tabler/icons-svelte/icons/refresh'
  import IconUserPlus from '@tabler/icons-svelte/icons/user-plus'
  import { onDestroy, onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { SupplierInvoiceDetailsContract } from './SupplierInvoiceDetails.contract.js'

  let { pageDetails, legalEntity, user }: SnippetProps = $props()

  const invoiceId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const invoiceHandle = useProvides(SupplierInvoiceDetailsContract, 'supplierInvoice')
  const breadcrumbTitle = useBreadcrumbTitle()

  const canEdit = $derived(hasPermission(user, 'edit-supplier-invoices'))
  const canCreateSupplier = $derived(canEdit && hasPermission(user, 'create-suppliers'))
  const canUpdateIdentifiers = $derived(hasPermission(user, 'edit-suppliers'))

  let invoice = $state<SupplierInvoice | null>(null)
  let promise = $state<Promise<SafeApiResponse<SupplierInvoice>> | null>(null)

  /** Outcome of the last "Riprova aggancio" that still found no supplier. */
  let matchOutcome = $state<string | null>(null)
  let linkDialogOpen = $state(false)
  /** Which link action is in flight (these buttons live outside a form, so no auto-busy). */
  let busyAction = $state<'create' | 'relink' | null>(null)

  function setInvoice(next: SupplierInvoice) {
    invoice = next
    invoiceHandle.set(next)
    breadcrumbTitle.setLabel('supplier-invoice-details', next.document_number)
  }

  async function fetchInvoice(): Promise<SafeApiResponse<SupplierInvoice>> {
    const res = await api.safe.get<SupplierInvoice>(`/legal-entities/${legalEntityId}/supplier-invoices/${invoiceId}`)
    if (res.data) {
      setInvoice(res.data)
      if (res.data.status === 'new') markViewed(res.data)
    }
    return res
  }

  /**
   * First open: Nuova → Vista. Fire-and-forget — only the status fields are
   * taken from the response, so a failure leaves the page usable as-is.
   */
  async function markViewed(current: SupplierInvoice) {
    if (!legalEntityId) return
    try {
      const viewed = await markSupplierInvoiceViewed(legalEntityId, current.id)
      if (invoice?.id === current.id) {
        setInvoice({ ...invoice, status: viewed.status, viewed_at: viewed.viewed_at, viewed_by: viewed.viewed_by })
      }
    } catch {
      // Not worth surfacing: the invoice simply stays "Nuova".
    }
  }

  onMount(() => {
    if (legalEntityId && invoiceId) promise = fetchInvoice()
  })

  onDestroy(() => {
    invoiceHandle.unset()
    breadcrumbTitle.clearLabel('supplier-invoice-details')
  })

  async function handleCreateSupplier() {
    if (!legalEntityId || !invoice) return
    busyAction = 'create'
    try {
      const linked = await createSupplierFromInvoice(legalEntityId, invoice.id)
      setInvoice({ ...invoice, ...linked })
      matchOutcome = null
      toast.success(m.supplier_invoice_supplier_created_successfully())
    } catch (err) {
      // 422: a supplier (archived ones included) already holds the P.IVA/CF →
      // linking is the way forward, so open the picker right away.
      if (err instanceof ApiError && err.status === 422) {
        toast.error(extractApiErrorMessage(err) ?? m.supplier_invoice_supplier_exists())
        linkDialogOpen = true
        return
      }
      showActionErrorToast(m.supplier_invoice_action_error(), err)
    } finally {
      busyAction = null
    }
  }

  async function handleRelink() {
    if (!legalEntityId || !invoice) return
    busyAction = 'relink'
    try {
      const result = await relinkSupplierInvoice(legalEntityId, invoice.id)
      setInvoice({ ...invoice, ...result })
      if (result.status === 'to_link') {
        matchOutcome = result.match ?? 'no_candidate'
      } else {
        matchOutcome = null
        toast.success(m.supplier_invoice_linked_successfully())
      }
    } catch (err) {
      showActionErrorToast(m.supplier_invoice_action_error(), err)
    } finally {
      busyAction = null
    }
  }

  function handleLinked(linked: SupplierInvoice) {
    if (!invoice) return
    setInvoice({ ...invoice, ...linked })
    matchOutcome = null
  }

  function matchOutcomeLabel(outcome: string): string {
    return supplierInvoiceMatchOutcomeLabels[outcome as SupplierInvoiceMatchOutcome]?.() ?? outcome
  }

  function money(value: string | number | null | undefined): string {
    return floatToPriceString(Number(value) || 0, invoice?.currency)
  }

  function isNonZero(value: string | number | null | undefined): boolean {
    return (Number(value) || 0) !== 0
  }

  const cedente = $derived(invoice?.cedente_snapshot ?? null)
  const lines = $derived(invoice?.lines ?? [])
  const attachments = $derived(invoice?.attachments ?? [])
  const orderReferences = $derived(invoice?.order_references ?? [])
  const transportReferences = $derived(invoice?.transport_document_references ?? [])

  function downloadAttachment(index: number) {
    return apiDownload({
      url: `/legal-entities/${legalEntityId}/supplier-invoices/${invoiceId}/attachments/${index}`,
    }).catch(err => showActionErrorToast(m.supplier_invoice_action_error(), err))
  }
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    {#if invoice}
      {@const inv = invoice}
      <div class="relative flex flex-col gap-6 pb-breadcrumbs">
        <!-- Header -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-semibold">{inv.document_number}</h1>
            <SupplierInvoiceStatusBadge status={inv.status} />
            <InvoicePaymentStatusBadge status={inv.payment_status} payable />
          </div>
          <p class="text-sm text-muted-foreground">
            {getSupplierInvoiceDocumentTypeLabel(inv.document_type)} · {formatCalendarDay(inv.document_date)}
          </p>
          <SupplierInvoiceFlagBadges
            quarantined={inv.is_quarantined}
            possibleDuplicate={inv.is_possible_duplicate}
            dueDatesNeedReview={inv.due_dates_need_review}
            dueDatesMismatch={inv.due_dates_mismatch} />
        </div>

        <!-- Supplier link (aggancio) -->
        <GroupTitle heading={m.supplier()}>
          {#snippet description()}
            {m.supplier_invoice_link_description()}
          {/snippet}

          {#snippet content()}
            {#if inv.status === 'to_link'}
              <Alert.Root class="max-w-md lg:max-w-none">
                <AlertCircleIcon />
                <Alert.Title>{m.supplier_invoice_to_link_title()}</Alert.Title>
                <Alert.Description>{m.supplier_invoice_to_link_help()}</Alert.Description>
              </Alert.Root>

              {#if matchOutcome}
                <Alert.Root variant="destructive" class="max-w-md lg:max-w-none">
                  <AlertCircleIcon />
                  <Alert.Description>{matchOutcomeLabel(matchOutcome)}</Alert.Description>
                </Alert.Root>
              {/if}

              {#if canEdit}
                <div class="flex flex-wrap gap-2">
                  {#if canCreateSupplier}
                    <ActionButton
                      variant="default"
                      busy={busyAction === 'create'}
                      disabled={busyAction !== null}
                      onclick={handleCreateSupplier}>
                      <IconUserPlus class="size-4" />
                      {m.supplier_invoice_create_supplier()}
                    </ActionButton>
                  {/if}
                  <Button variant="outline" onclick={() => (linkDialogOpen = true)}>
                    <IconLink class="size-4" />
                    {m.supplier_invoice_link_supplier()}
                  </Button>
                  <ActionButton
                    variant="outline"
                    busy={busyAction === 'relink'}
                    disabled={busyAction !== null}
                    onclick={handleRelink}>
                    <IconRefresh class="size-4" />
                    {m.supplier_invoice_relink()}
                  </ActionButton>
                </div>
              {/if}
            {:else}
              <div class="flex flex-wrap items-center gap-3">
                {#if inv.supplier}
                  <a
                    href={createRoute({ $id: 'supplier-details', params: { uuid: inv.supplier.id } })}
                    class="font-medium hover:text-brand hover:underline">
                    {inv.supplier.name}
                  </a>
                {:else}
                  <span class="font-medium">-</span>
                {/if}
                {#if canEdit}
                  <Button variant="outline" size="sm" onclick={() => (linkDialogOpen = true)}>
                    <IconLink class="size-4" />
                    {m.supplier_invoice_change_supplier()}
                  </Button>
                {/if}
              </div>
            {/if}
          {/snippet}
        </GroupTitle>

        {#if inv.acube_notice || inv.is_quarantined || inv.is_possible_duplicate}
          <Separator />

          <GroupTitle heading={m.supplier_invoice_anomalies()}>
            {#snippet description()}
              {m.supplier_invoice_anomalies_description()}
            {/snippet}

            {#snippet content()}
              {#if inv.is_quarantined}
                <Alert.Root variant="destructive" class="max-w-md lg:max-w-none">
                  <AlertCircleIcon />
                  <Alert.Title>{m.supplier_invoice_flag_quarantined()}</Alert.Title>
                  <Alert.Description>{m.supplier_invoice_quarantined_help()}</Alert.Description>
                </Alert.Root>
              {/if}
              {#if inv.is_possible_duplicate}
                <Alert.Root class="max-w-md lg:max-w-none">
                  <AlertCircleIcon />
                  <Alert.Title>{m.supplier_invoice_flag_possible_duplicate()}</Alert.Title>
                  <Alert.Description>{m.supplier_invoice_possible_duplicate_help()}</Alert.Description>
                </Alert.Root>
              {/if}
              {#if inv.acube_notice}
                <Alert.Root class="max-w-md lg:max-w-none">
                  <AlertCircleIcon />
                  <Alert.Title>{m.supplier_invoice_acube_notice()}</Alert.Title>
                  <Alert.Description class="whitespace-pre-line">{inv.acube_notice}</Alert.Description>
                </Alert.Root>
              {/if}
            {/snippet}
          </GroupTitle>
        {/if}

        <Separator />

        <!-- Cedente / prestatore as in the XML -->
        <GroupTitle heading={m.supplier_invoice_cedente()}>
          {#snippet description()}
            {m.supplier_invoice_cedente_description()}
          {/snippet}

          {#snippet content()}
            <dl class="grid max-w-2xl grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt class="text-muted-foreground">{m.name()}</dt>
              <dd class="font-medium">{cedenteName(cedente) || '-'}</dd>
              <dt class="text-muted-foreground">{m.supplier_invoice_vat_number()}</dt>
              <dd>{inv.cedente_vat_number || '-'}</dd>
              <dt class="text-muted-foreground">{m.tax_id()}</dt>
              <dd>{inv.cedente_tax_id || '-'}</dd>
              {#if cedente?.address}
                <dt class="text-muted-foreground">{m.address()}</dt>
                <dd>{flattenValues(cedente.address) || '-'}</dd>
              {/if}
              {#if cedente?.tax_regime}
                <dt class="text-muted-foreground">{m.supplier_invoice_tax_regime()}</dt>
                <dd>{cedente.tax_regime}</dd>
              {/if}
              {#if cedente?.rea && flattenValues(cedente.rea)}
                <dt class="text-muted-foreground">REA</dt>
                <dd>{flattenValues(cedente.rea)}</dd>
              {/if}
              {#if cedente?.contacts && flattenValues(cedente.contacts)}
                <dt class="text-muted-foreground">{m.contacts()}</dt>
                <dd>{flattenValues(cedente.contacts)}</dd>
              {/if}
            </dl>
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Totals: the supplier's figures, stored as sent -->
        <GroupTitle heading={m.total()}>
          {#snippet description()}
            {m.supplier_invoice_totals_description()}
          {/snippet}

          {#snippet content()}
            <dl class="grid max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm">
              <dt class="text-muted-foreground">{m.taxable_amount()}</dt>
              <dd class="text-right">{money(inv.total_taxable)}</dd>
              <dt class="text-muted-foreground">{m.vat()}</dt>
              <dd class="text-right">{money(inv.total_tax)}</dd>
              <dt class="text-muted-foreground">{m.total()}</dt>
              <dd class="text-right">{money(inv.total_amount)}</dd>
              {#if isNonZero(inv.total_withholding)}
                <dt class="text-muted-foreground">{m.supplier_invoice_withholding()}</dt>
                <dd class="text-right">− {money(inv.total_withholding)}</dd>
              {/if}
              {#if isNonZero(inv.total_split_payment_tax)}
                <dt class="text-muted-foreground">{m.supplier_invoice_split_payment()}</dt>
                <dd class="text-right">− {money(inv.total_split_payment_tax)}</dd>
              {/if}
              <dt class="font-semibold">{m.net_payable()}</dt>
              <dd class="text-right font-semibold">{money(inv.net_payable)}</dd>
            </dl>
          {/snippet}
        </GroupTitle>

        <Separator />

        <!-- Lines -->
        <GroupTitle heading={m.supplier_invoice_lines()}>
          {#snippet description()}
            {m.supplier_invoice_lines_description()}
          {/snippet}

          {#snippet content()}
            {#if lines.length === 0}
              <p class="text-sm text-muted-foreground">{m.supplier_invoice_no_lines()}</p>
            {:else}
              <div class="overflow-x-auto rounded-md border">
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="w-10">#</Table.Head>
                      <Table.Head class="min-w-64">{m.description()}</Table.Head>
                      <Table.Head class="text-right">{m.quantity()}</Table.Head>
                      <Table.Head>{m.uom()}</Table.Head>
                      <Table.Head class="text-right">{m.unit_price()}</Table.Head>
                      <Table.Head class="text-right">{m.total()}</Table.Head>
                      <Table.Head class="text-right">{m.vat_rate()}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each lines as line (line.id)}
                      <Table.Row>
                        <Table.Cell class="text-muted-foreground">{line.line_number}</Table.Cell>
                        <Table.Cell class="whitespace-normal">
                          <div>{line.description}</div>
                          {#if line.item_codes?.length}
                            <div class="text-xs text-muted-foreground">
                              {line.item_codes.map(c => flattenValues(c)).join(', ')}
                            </div>
                          {/if}
                          {#if line.discounts?.length}
                            <div class="text-xs text-muted-foreground">
                              {m.discount()}: {line.discounts.map(d => flattenValues(d)).join(', ')}
                            </div>
                          {/if}
                        </Table.Cell>
                        <Table.Cell class="text-right">{line.quantity ?? '-'}</Table.Cell>
                        <Table.Cell>{line.unit_of_measure || '-'}</Table.Cell>
                        <Table.Cell class="text-right">{money(line.unit_price)}</Table.Cell>
                        <Table.Cell class="text-right">{money(line.total_price)}</Table.Cell>
                        <Table.Cell class="text-right">
                          {line.vat_nature ? line.vat_nature : `${Number(line.vat_rate) || 0}%`}
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            {/if}
          {/snippet}
        </GroupTitle>

        {#if orderReferences.length > 0 || transportReferences.length > 0}
          <Separator />

          <GroupTitle heading={m.supplier_invoice_references()}>
            {#snippet description()}
              {m.supplier_invoice_references_description()}
            {/snippet}

            {#snippet content()}
              {#if orderReferences.length > 0}
                <div class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">{m.supplier_invoice_order_references()}</span>
                  {#each orderReferences as ref, i (i)}
                    <span class="text-muted-foreground">{flattenValues(ref) || '-'}</span>
                  {/each}
                </div>
              {/if}
              {#if transportReferences.length > 0}
                <div class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">{m.supplier_invoice_transport_document_references()}</span>
                  {#each transportReferences as ref, i (i)}
                    <span class="text-muted-foreground">{flattenValues(ref) || '-'}</span>
                  {/each}
                </div>
              {/if}
            {/snippet}
          </GroupTitle>
        {/if}

        {#if attachments.length > 0}
          <Separator />

          <!-- Files embedded in the XML (Allegati) — user uploads live in the Documenti subpage -->
          <GroupTitle heading={m.supplier_invoice_embedded_attachments()}>
            {#snippet description()}
              {m.supplier_invoice_embedded_attachments_description()}
            {/snippet}

            {#snippet content()}
              <div class="flex flex-col divide-y text-sm">
                {#each attachments as attachment (attachment.index)}
                  <div class="flex items-center justify-between gap-3 py-1.5">
                    <div class="flex min-w-0 flex-col">
                      <span class="truncate font-medium">{attachment.name}</span>
                      {#if attachment.description}
                        <span class="text-xs text-muted-foreground">{attachment.description}</span>
                      {/if}
                    </div>
                    <ActionButton
                      variant="ghost"
                      size="icon"
                      busyLabel=""
                      tooltip={m.download_document()}
                      onclick={() => downloadAttachment(attachment.index)}>
                      <IconDownload class="size-4" />
                    </ActionButton>
                  </div>
                {/each}
              </div>
            {/snippet}
          </GroupTitle>
        {/if}

        <BottomBar>
          <DownloadActionMenu
            tooltip={m.download_document()}
            items={[
              {
                id: 'xml',
                label: m.invoice_xml_download(),
                icon: FileCodeIcon,
                onDownload: () =>
                  apiDownload({ url: `/legal-entities/${legalEntityId}/supplier-invoices/${inv.id}/xml` }),
              },
              {
                id: 'pdf',
                label: m.invoice_pdf_download(),
                icon: FileTextIcon,
                onDownload: () =>
                  apiDownload({
                    url: `/legal-entities/${legalEntityId}/supplier-invoices/${inv.id}/pdf`,
                    queryParams: { download: true },
                  }),
              },
            ]} />
        </BottomBar>
      </div>

      {#if legalEntityId}
        <LinkSupplierDialog
          bind:open={linkDialogOpen}
          {legalEntityId}
          invoice={inv}
          {canUpdateIdentifiers}
          onLinked={handleLinked} />
      {/if}
    {/if}
  {/snippet}
</RequestPlaceholder>
