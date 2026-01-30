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
  import TextareaField from '$components/core/form/TextareaField.svelte'
  import MaterialSelector from '$components/features/form/MaterialSelector.svelte'
  import ProductsEditor from '$components/features/form/ProductsEditor.svelte'
  import ProductSelector from '$components/features/form/ProductSelector.svelte'
  import RawMaterialsEditor, { type RawMaterialLineItem } from '$components/features/form/RawMaterialsEditor.svelte'
  import { Button } from '$components/ui/button'
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
  <MaterialSelector name="material" />

  <ProductSelector name="product" />

  <QuantityField name="quantity" />

  <PriceField name="price" />

  <RawMaterialsEditor
    name="rawMaterials"
    supplierId="fd350ff9-e8fa-41b3-8801-d79b2ec4e805"
    showLabel={false}
    required
    showPrice
    editablePrice />

  <ProductsEditor name="products" showLabel={false} showLot showPrice showQuantity />

  <SwitchField name="urgent" label="Urgent order" />

  <TextareaField label="Notes" name="notes" />

  <!-- Submit Button -->
  <div class="flex gap-2">
    <BusyButton type="submit">{m.save_changes()}</BusyButton>
    <Button type="button" variant="outline" onclick={() => form.reset()}>Reset</Button>
  </div>
</div>
