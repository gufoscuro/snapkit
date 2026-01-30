<!--
  @component FormPOCInner
  @description Inner form fields that access FormUtil context directly.
  Demonstrates how child components can use getFormContext() without prop drilling.
-->
<script lang="ts">
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { getFormContext } from '$components/core/form/form-context'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import SwitchField from '$components/core/form/SwitchField.svelte'
  import MaterialSelector from '$components/features/form/MaterialSelector.svelte'
  import ProductSelector from '$components/features/form/ProductSelector.svelte'
  import RawMaterialsEditor, { type RawMaterialLineItem } from '$components/features/supply/RawMaterialsEditor.svelte'
  import { Button } from '$components/ui/button'
  import { Input } from '$components/ui/input'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'

  // Define the form shape (should match parent)
  type OrderFormValues = {
    material: string
    product: string
    quantity: number
    price: number
    notes: string
    urgent: boolean
    rawMaterials: RawMaterialLineItem[]
  }

  // Access form context - no props needed!
  const form = getFormContext<OrderFormValues>()
</script>

<div class="space-y-4">
  <!-- Material Selector - uses context automatically -->
  <MaterialSelector name="material" />

  <!-- Product Selector - uses context automatically -->
  <ProductSelector name="product" />

  <QuantityField name="quantity" />

  <PriceField name="price" />

  <!-- RawMaterialsEditor with validation test -->
  <RawMaterialsEditor
    name="rawMaterials"
    required
    showPrice
    editablePrice
    supplierId="fd350ff9-e8fa-41b3-8801-d79b2ec4e805" />

  <!-- Switch Field - testing refactored component -->
  <SwitchField name="urgent" label="Urgent order" />

  <!-- Notes Input -->
  <div>
    <Label for="notes" class="leading-6">Notes (optional)</Label>
    <Input
      id="notes"
      type="text"
      value={form.values.notes}
      oninput={e => form.updateField('notes', e.currentTarget.value)}
      placeholder="Add any notes..." />
  </div>

  <!-- Form State Debug -->
  <div class="rounded-lg border bg-muted/50 p-4">
    <h3 class="mb-2 font-semibold">Form State (Debug)</h3>
    <div class="space-y-1 text-sm">
      <p><strong>Values:</strong></p>
      <pre class="text-xs">{JSON.stringify(form.values, null, 2)}</pre>
      <p><strong>Errors:</strong> {JSON.stringify(form.errors)}</p>
      <p><strong>Is Valid:</strong> {form.isValid ? 'Yes' : 'No'}</p>
      <p><strong>Is Dirty:</strong> {form.isDirty ? 'Yes' : 'No'}</p>
      <p><strong>Inflight:</strong> {form.inflight ? 'Yes' : 'No'}</p>
    </div>
  </div>

  <!-- Submit Button -->
  <div class="flex gap-2">
    <BusyButton type="submit">{m.save_changes()}</BusyButton>
    <Button type="button" variant="outline" onclick={() => form.reset()}>Reset</Button>
  </div>
</div>
