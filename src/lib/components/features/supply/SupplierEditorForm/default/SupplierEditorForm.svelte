<script lang="ts">
  import CurrencyField from '$components/core/form/CurrencyField.svelte'
  import FormUtil, { type FailurePayload } from '$components/core/form/FormUtil.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import TextareaField from '$components/core/form/TextareaField.svelte'
  import { v } from '$components/core/form/validation'
  import AddressesEditor, { addressesRequired } from '$components/features/form/AddressesEditor.svelte'
  import CategoriesSelector from '$components/features/form/CategoriesSelector.svelte'
  import EmailsEditor, { emailsRequired } from '$components/features/form/EmailsEditor.svelte'
  import PhonesEditor from '$components/features/form/PhonesEditor.svelte'
  import { Button } from '$components/ui/button'
  import * as m from '$lib/paraglide/messages'
  import type { AddressAttr, EmailAttr, PhoneAttr, SupplierDetails } from '$lib/types/api-types'
  import { apiRequest } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import { toast } from 'svelte-sonner'

  const { pageDetails, routeDetails }: SnippetProps = $props()
  const supplierId = $derived(pageDetails.params.uuid as string | undefined)

  // State
  let supplierDetails = $state<SupplierDetails | null>(null)
  let loading = $state(true)
  let error = $state<string | null>(null)

  // Fetch supplier details when editing
  async function fetchSupplierDetails(id: string) {
    loading = true
    error = null
    try {
      const response = await apiRequest<SupplierDetails>({
        url: `supply/supplier/${id}`,
      })
      supplierDetails = response

      console.log('Fetched supplier details:', response)
    } catch (err) {
      console.error('Failed to load supplier details:', err)
      error = err instanceof Error ? err.message : 'Failed to load supplier details'
      supplierDetails = null
    } finally {
      await new Promise(resolve => setTimeout(resolve, 200)) // Simulate network delay
      loading = false
    }
  }

  // Load supplier when supplierId changes
  $effect(() => {
    if (supplierId) {
      fetchSupplierDetails(supplierId)
    } else {
      // Create mode - no loading needed
      loading = false
    }
  })

  // Define the form shape
  type SupplierFormValues = {
    // Required fields from SupplierSummary
    name: string
    vat_no: string
    categories: string[]
    default_currency: string
    emails: EmailAttr[]
    phones: PhoneAttr[]
    // Required from SupplierDetails
    addresses: AddressAttr[]
    // Optional fields
    contact_name?: string
    description?: string
    website?: string
    payment_method?: string
    // Bank info
    bank_iban?: string
    bank_name?: string
    bank_swift?: string
    // Notes
    notes?: string
  }

  const formInitialValues = $derived.by(
    (): SupplierFormValues => ({
      name: supplierDetails?.name ?? '',
      vat_no: supplierDetails?.vat_no ?? '',
      categories: supplierDetails?.categories ?? [],
      default_currency: supplierDetails?.default_currency ?? 'EUR',
      emails: supplierDetails?.emails ?? [],
      phones: supplierDetails?.phones ?? [],
      addresses: supplierDetails?.addresses ?? [],
      contact_name: supplierDetails?.contact_name ?? '',
      description: supplierDetails?.description ?? '',
      website: supplierDetails?.website ?? '',
      payment_method: supplierDetails?.payment_method ?? '',
      bank_iban: supplierDetails?.bank?.iban ?? '',
      bank_name: supplierDetails?.bank?.name ?? '',
      bank_swift: supplierDetails?.bank?.swift ?? '',
      notes: supplierDetails?.notes ?? '',
    }),
  )

  // Validation schema
  const validate = v
    .schema<SupplierFormValues>({
      name: [v.required({ field: m.supplier_name() })],
      vat_no: [v.required({ field: m.vat_no() })],
      default_currency: [v.required({ field: m.currency_label() })],
      emails: [emailsRequired()],
      // phones: [phonesRequired()],
      addresses: [addressesRequired()],
    })
    .build()

  // Submit handler - creates or updates supplier
  async function handleSubmit(values: SupplierFormValues): Promise<void> {
    const payload = {
      name: values.name,
      vat_no: values.vat_no,
      categories: values.categories,
      default_currency: values.default_currency,
      emails: values.emails,
      phones: values.phones,
      addresses: values.addresses,
      contact_name: values.contact_name || undefined,
      description: values.description || undefined,
      website: values.website || undefined,
      payment_method: values.payment_method || undefined,
      bank: {
        iban: values.bank_iban || undefined,
        name: values.bank_name || undefined,
        swift: values.bank_swift || undefined,
      },
      notes: values.notes || undefined,
      version: supplierDetails?.version || 1,
    }

    if (supplierId) {
      // Update existing supplier
      await apiRequest({
        method: 'PUT',
        url: `supply/supplier/${supplierId}`,
        data: payload,
      })
    } else {
      // Create new supplier
      await apiRequest({
        method: 'PUT',
        url: 'supply/supplier',
        data: payload,
      })
    }
  }

  function handleSuccess() {
    // Show success toast based on whether we're creating or updating
    if (supplierId) {
      toast.success(m.supplier_updated_success())
      fetchSupplierDetails(supplierId) // Refresh details after update
    } else {
      toast.success(m.supplier_created_success())
    }
  }

  function handleFailure(payload: FailurePayload) {
    console.error('Form submission failed:', payload)
    // Show error toast
    const errorMessage = payload.error instanceof Error ? payload.error.message : m.supplier_save_error()
    toast.error(errorMessage)
  }
</script>

<div class="mx-auto mb-4 w-full max-w-5xl">
  <FormUtil
    initialValues={formInitialValues}
    {validate}
    onSubmit={handleSubmit}
    onSuccess={handleSuccess}
    onFailure={handleFailure}
    class="relative space-y-6">
    <!-- Basic Information -->
    <div class="space-y-4 py-4">
      <h2 class="text-lg font-semibold">{m.basic_information()}</h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="name" label={m.supplier_name()} placeholder={m.supplier_name_placeholder()} />

        <TextField name="vat_no" label={m.vat_no()} placeholder={m.vat_no_placeholder()} />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CategoriesSelector name="categories" label={m.categories()} />

        <CurrencyField name="default_currency" label={m.default_currency()} />
      </div>

      <TextField name="contact_name" label={m.contact_name()} placeholder={m.contact_name_placeholder()} />

      <TextareaField name="description" label={m.description()} placeholder={m.description_placeholder()} rows={3} />
    </div>

    <!-- Contact Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">{m.contact_information()}</h2>

      <EmailsEditor name="emails" required />

      <PhonesEditor name="phones" required />

      <TextField name="website" type="url" label={m.website()} placeholder="https://example.com" />
    </div>

    <!-- Addresses -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">{m.addresses()}</h2>

      <AddressesEditor name="addresses" required />
    </div>

    <!-- Payment & Banking -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">{m.payment_banking()}</h2>

      <TextField name="payment_method" label={m.payment_method()} placeholder={m.payment_method_placeholder()} />

      <div class="space-y-3">
        <h3 class="text-sm font-medium">{m.bank_details()}</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField name="bank_name" label={m.bank_name()} placeholder={m.bank_name_placeholder()} />

          <TextField name="bank_iban" label={m.bank_iban()} placeholder="IT60 X054 2811 1010 0000 0123 456" />
        </div>

        <TextField name="bank_swift" label={m.bank_swift()} placeholder="ABCDITMM" />
      </div>
    </div>

    <!-- Notes -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">{m.notes()}</h2>

      <TextareaField name="notes" label={m.notes()} placeholder={m.notes_placeholder()} rows={4} showLabel={false} />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" onclick={() => window.history.back()}>
        {m.common_cancel()}
      </Button>
      <Button type="submit">
        {supplierId ? m.update_supplier() : m.create_supplier()}
      </Button>
    </div>

    <!-- {#if loading}
      <div class="absolute inset-0 z-10 bg-background/80" out:fade={{ duration: 100 }}>
        <div class="flex max-h-screen min-h-screen items-center justify-center">
          <Spinner class="w-10" />
        </div>
      </div>
    {/if} -->
  </FormUtil>
</div>
