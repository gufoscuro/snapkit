<!--
  @component CustomFields
  @description Renders dynamic custom fields based on resource configuration.
  Uses clearFormContext() so child field components operate in standalone mode,
  while this component wires them to the parent form's custom field state.
  @keywords custom, fields, dynamic, form, config
-->
<script lang="ts">
  import { browser } from '$app/environment'
  import * as m from '$lib/paraglide/messages'
  import type { ResourceCustomFieldConfig } from '$lib/stores/tenant-config/types'
  import { Separator } from '$components/ui/separator'
  import DateField from './DateField.svelte'
  import { FormFieldClass } from './form.js'
  import { getFormContext, clearFormContext } from './form-context'
  import SelectField from './SelectField.svelte'
  import SwitchField from './SwitchField.svelte'
  import TextField from './TextField.svelte'
  import TextareaField from './TextareaField.svelte'

  type Props = {
    configs: ResourceCustomFieldConfig[]
  }

  let { configs }: Props = $props()

  // Get the parent form context BEFORE clearing it for children
  const form = getFormContext()

  // Clear form context so child fields don't autowire to typed form state.
  // They will operate in standalone/prop-based mode instead.
  clearFormContext()
</script>

{#if browser && configs.length > 0}
  <div class="flex flex-col gap-4">
    <Separator class="my-2" />
    <p class="text-sm font-medium text-muted-foreground">{m.custom_fields()}</p>

    {#each configs as config (config.key)}
      {#if config.type === 'text'}
        <TextField
          name={config.key}
          label={config.label}
          value={(form.customFieldValues[config.key] as string) ?? ''}
          error={form.customFieldTouched[config.key] ? form.customFieldErrors[config.key] : undefined}
          class={FormFieldClass.MaxWidth}
          oninput={(e) => {
            form.updateCustomField(config.key, e.currentTarget.value)
            if (form.customFieldErrors[config.key]) form.validateCustomField(config.key)
          }}
          onblur={() => form.touchCustomField(config.key)}
        />
      {:else if config.type === 'number'}
        <TextField
          name={config.key}
          label={config.label}
          type="number"
          value={(form.customFieldValues[config.key] as number) ?? ''}
          error={form.customFieldTouched[config.key] ? form.customFieldErrors[config.key] : undefined}
          class={FormFieldClass.MaxWidth}
          oninput={(e) => {
            const val = e.currentTarget.value
            form.updateCustomField(config.key, val === '' ? null : Number(val))
            if (form.customFieldErrors[config.key]) form.validateCustomField(config.key)
          }}
          onblur={() => form.touchCustomField(config.key)}
        />
      {:else if config.type === 'boolean'}
        <SwitchField
          name={config.key}
          label={config.label}
          checked={(form.customFieldValues[config.key] as boolean) ?? false}
          onChange={(value) => {
            form.updateCustomField(config.key, value)
            form.touchCustomField(config.key)
          }}
        />
      {:else if config.type === 'date'}
        <DateField
          name={config.key}
          label={config.label}
          value={(form.customFieldValues[config.key] as string) ?? undefined}
          error={form.customFieldTouched[config.key] ? form.customFieldErrors[config.key] : undefined}
          allowClear
          onChange={(date) => {
            form.updateCustomField(config.key, date?.toISOString() ?? null)
            form.touchCustomField(config.key)
            if (form.customFieldErrors[config.key]) form.validateCustomField(config.key)
          }}
        />
      {:else if config.type === 'select'}
        {@const items = (config.options ?? []).map(opt => ({ value: opt, label: opt }))}
        <SelectField
          name={config.key}
          label={config.label}
          {items}
          value={(form.customFieldValues[config.key] as string) ?? null}
          error={form.customFieldTouched[config.key] ? form.customFieldErrors[config.key] : undefined}
          class={FormFieldClass.MinWidth}
          allowClear
          onChange={(value) => {
            form.updateCustomField(config.key, value)
            form.touchCustomField(config.key)
            if (form.customFieldErrors[config.key]) form.validateCustomField(config.key)
          }}
        />
      {:else if config.type === 'textarea'}
        <TextareaField
          name={config.key}
          label={config.label}
          value={(form.customFieldValues[config.key] as string) ?? ''}
          error={form.customFieldTouched[config.key] ? form.customFieldErrors[config.key] : undefined}
          class={FormFieldClass.MaxWidth}
          oninput={(e) => {
            form.updateCustomField(config.key, e.currentTarget.value)
            if (form.customFieldErrors[config.key]) form.validateCustomField(config.key)
          }}
          onblur={() => form.touchCustomField(config.key)}
        />
      {/if}
    {/each}
  </div>
{/if}
