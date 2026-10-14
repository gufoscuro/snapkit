<!--
  @component LinkSupplierDialog
  @description Modal to link a received invoice to an existing supplier — or to
  change the supplier of an already linked one (due dates and payments are left
  untouched). The picker lists non-archived suppliers. When the user may edit
  suppliers, a switch also writes the cedente P.IVA/CF onto the chosen supplier;
  the backend's 422 (identifier already held by another supplier) and 403 surface
  through FormUtil. Two-way bind `open` to control it.
  @keywords supplier invoice, received invoice, link, collega, supplier, dialog, aggancio, P.IVA
  @uses SupplierSelector, SwitchField
  @api POST /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/link
  @api GET /api/legal-entities/{legalEntity}/suppliers -> Supplier[]
-->
<script lang="ts">
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil, { type SuccessPayload } from '$components/core/form/FormUtil.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import { v } from '$components/core/form/validation'
  import SupplierSelector from '$components/features/form/SupplierSelector.svelte'
  import { Button } from '$components/ui/button'
  import * as Dialog from '$components/ui/dialog'
  import * as m from '$lib/paraglide/messages'
  import type { Supplier, SupplierInvoice, SupplierSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
  import { toast } from 'svelte-sonner'
  import { linkSupplierInvoice, toastUnmappedValidationErrors } from './supplier-invoice-actions'

  type Props = {
    open: boolean
    legalEntityId: string
    invoice: SupplierInvoice
    /** Show the "update the supplier's P.IVA/CF" switch (needs `edit-suppliers`). */
    canUpdateIdentifiers?: boolean
    onLinked?: (invoice: SupplierInvoice) => void
  }

  let { open = $bindable(false), legalEntityId, invoice, canUpdateIdentifiers = false, onLinked }: Props = $props()

  type FormValues = {
    supplier_id: string
    update_identifiers: boolean
  }

  const initialValues = $derived<FormValues>({
    supplier_id: invoice.supplier_id ?? '',
    update_identifiers: false,
  })

  const validate = v
    .schema<FormValues>({
      supplier_id: [v.required({ field: m.supplier() })],
    })
    .build()

  // The current supplier, preselected when changing supplier.
  const currentSupplier = $derived(
    invoice.supplier ? ({ id: invoice.supplier.id, name: invoice.supplier.name } as SupplierSummary) : undefined,
  )

  const identifiers = $derived([invoice.cedente_vat_number, invoice.cedente_tax_id].filter(Boolean).join(' / '))

  // SupplierSelector defaults to the legacy supply API: point it at the
  // legal-entity suppliers (the list never includes archived ones).
  async function fetchSuppliers(query: Partial<FilterQuery>): Promise<SupplierSummary[]> {
    const res = await api.get<PaginatedResponse<Supplier>>(`/legal-entities/${legalEntityId}/suppliers`, {
      queryParams: createQueryRequestObject(query),
    })
    return res.data.map(s => ({ id: s.id, name: s.name }) as SupplierSummary)
  }

  async function handleSubmit(values: FormValues): Promise<SupplierInvoice> {
    try {
      return await linkSupplierInvoice(legalEntityId, invoice.id, {
        supplier_id: values.supplier_id,
        ...(canUpdateIdentifiers && values.update_identifiers ? { update_identifiers: true } : {}),
      })
    } catch (err) {
      // e.g. "P.IVA già di un altro fornitore" keyed on update_identifiers.
      toastUnmappedValidationErrors(err, ['supplier_id'])
      throw err
    }
  }

  function handleSuccess({ result }: SuccessPayload<FormValues>) {
    toast.success(m.supplier_invoice_linked_successfully())
    onLinked?.(result as unknown as SupplierInvoice)
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>
        {invoice.supplier_id ? m.supplier_invoice_change_supplier() : m.supplier_invoice_link_supplier()}
      </Dialog.Title>
      <Dialog.Description>
        {invoice.supplier_id ? m.supplier_invoice_change_supplier_help() : m.supplier_invoice_link_supplier_help()}
      </Dialog.Description>
    </Dialog.Header>

    <FormUtil
      {initialValues}
      {validate}
      showCustomFields={false}
      onSubmit={handleSubmit as (values: FormValues) => Promise<unknown>}
      onSuccess={handleSuccess}
      class="flex min-w-0 flex-col gap-4">
      {#snippet withContext()}
        <FormErrorMessage />

        <SupplierSelector
          name="supplier_id"
          attr={currentSupplier}
          fetchFunction={fetchSuppliers}
          width="w-full min-w-0" />

        {#if canUpdateIdentifiers && identifiers}
          <SwitchField name="update_identifiers" label={m.supplier_invoice_update_identifiers({ identifiers })} />
        {/if}
      {/snippet}

      {#snippet bottom()}
        <Dialog.Footer>
          <Button type="button" variant="outline" onclick={() => (open = false)}>{m.cancel()}</Button>
          <BusyButton type="submit">
            {invoice.supplier_id ? m.supplier_invoice_change_supplier() : m.supplier_invoice_link_supplier()}
          </BusyButton>
        </Dialog.Footer>
      {/snippet}
    </FormUtil>
  </Dialog.Content>
</Dialog.Root>
