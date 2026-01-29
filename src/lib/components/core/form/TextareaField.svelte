<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { TextareaFieldDefaults, type TextareaFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { Textarea } from '$components/ui/textarea'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'

  type Props = TextareaFieldProps & {
    value?: string
  }

  let {
    name,
    label = TextareaFieldDefaults.label,
    placeholder = TextareaFieldDefaults.placeholder,
    id = name,
    value: valueProp = $bindable(''),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = TextareaFieldDefaults.errorPosition,
    warningPosition = TextareaFieldDefaults.warningPosition,
    focus = TextareaFieldDefaults.focus,
    showLabel = TextareaFieldDefaults.showLabel,
    showErrorMessage = TextareaFieldDefaults.showErrorMessage,
    disabled = TextareaFieldDefaults.disabled,
    rows = TextareaFieldDefaults.rows,
    width = TextareaFieldDefaults.width,
    oninput,
    onfocus,
    onblur,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  // Single source of truth: form context OR bindable prop
  const value = $derived(form ? (form.values[name] as string | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  const classes = $derived(
    joinClassnames(className, width, getUserMessagingClasses(error, warning))
  )

  const labelAria = $derived({
    'aria-labelledby': `label-${id}`,
  })

  function focusField() {
    if (!browser) return

    setTimeout(() => {
      const field = document.querySelector<HTMLTextAreaElement>(`#${id}`)
      field?.focus()
    }, 1)
  }

  $effect(() => {
    if (focus) focusField()
  })

  function handleInput(e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    if (form) {
      form.updateField(name, e.currentTarget.value)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = e.currentTarget.value
    }
    oninput?.(e)
  }

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) {
    form?.touchField(name)
    onblur?.(e)
  }
</script>

{#if browser}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <Textarea
          {id}
          {name}
          {placeholder}
          {rows}
          disabled={isDisabled}
          value={value ?? ''}
          {...labelAria}
          {...aria}
          class={classes}
          oninput={handleInput}
          onfocus={onfocus}
          onblur={handleBlur}
        />
      {/snippet}
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
