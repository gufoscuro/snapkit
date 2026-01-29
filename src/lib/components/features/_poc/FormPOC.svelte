<!--
  @component FormPOC
  @description Proof of concept for the new FormUtil system with Svelte 5 runes and context API.
  Demonstrates form handling without prop drilling and validation builder usage.
-->
<script lang="ts">
  import FormUtil, { type FailurePayload, type SuccessPayload } from '$components/core/form/FormUtil.svelte'
  import { v } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'
  import FormPOCInner from './FormPOCInner.svelte'

  // Define the form shape
  type OrderFormValues = {
    material: string
    product: string
    quantity: number
    price: number
    notes: string
    urgent: boolean
  }

  // Initial values
  const initialValues: OrderFormValues = {
    material: '',
    product: '',
    quantity: 1,
    price: 15.6,
    notes: '',
    urgent: false,
  }

  // Validation schema using the builder
  const validate = v
    .schema<OrderFormValues>({
      material: [v.required({ field: m.material() })],
      product: [v.required({ field: m.product() })],
      quantity: [v.required(), v.min(1, { field: m.quantity() })],
    })
    .build()

  // Submit handler
  async function handleSubmit(values: OrderFormValues): Promise<void> {
    console.log('Form submitted with values:', values)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate success
    console.log('Form submission successful!')
  }

  function handleSuccess(payload: SuccessPayload) {
    console.log('Success callback:', payload)
    alert('Form submitted successfully!')
  }

  function handleFailure(payload: FailurePayload) {
    console.error('Failure callback:', payload)
    alert(`Form submission failed: ${payload.message}`)
  }
</script>

<div class="mx-auto max-w-2xl p-6">
  <h1 class="mb-6 text-2xl font-bold">Form POC - New FormUtil System</h1>

  <FormUtil
    {initialValues}
    {validate}
    onSubmit={handleSubmit}
    onSuccess={handleSuccess}
    onFailure={handleFailure}
    class="space-y-6">
    <!-- FormPOCInner accesses form context via getFormContext() - no props needed! -->
    <FormPOCInner />
  </FormUtil>
</div>
