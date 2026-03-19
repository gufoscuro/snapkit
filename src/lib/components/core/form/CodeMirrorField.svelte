<script lang="ts">
  import { browser } from '$app/environment'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import type { LanguageSupport } from '@codemirror/language'
  import type { Extension } from '@codemirror/state'
  import type { EditorView } from '@codemirror/view'
  import { mode } from 'mode-watcher'
  import CodeMirror from 'svelte-codemirror-editor'
  import { brandDark, brandLight } from './codemirror-theme'
  import { BaseFieldDefaults, FormFieldClass, FormLabelClass, type BaseFieldProps } from './form'
  import { getFormContextOptional } from './form-context'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'

  type Props = BaseFieldProps & {
    value?: string
    /** CodeMirror language extension (e.g. javascript(), json(), html()) */
    lang?: LanguageSupport | null
    /** CodeMirror theme extension (e.g. oneDark) */
    theme?: Extension | null
    /** Placeholder text shown when the editor is empty */
    placeholder?: string
    /** Whether to show line numbers (default: true) */
    lineNumbers?: boolean
    /** Whether to wrap long lines (default: false) */
    lineWrapping?: boolean
    /** Whether to use Tab for indentation (default: true) */
    useTab?: boolean
    /** Number of spaces per indentation level (default: 2) */
    tabSize?: number
    /** Whether the editor is readonly (default: false) */
    readonly?: boolean
    /** Additional CodeMirror extensions */
    extensions?: Extension[]
    /** Tailwind min-height class applied to the editor area (default: 'min-h-40') */
    minHeight?: string
    /** Callback when the editor view is ready */
    onready?: (view: EditorView) => void
  }

  let {
    name,
    label = BaseFieldDefaults.label,
    id = name,
    value: valueProp = $bindable(''),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = BaseFieldDefaults.errorPosition,
    warningPosition = BaseFieldDefaults.warningPosition,
    showLabel = BaseFieldDefaults.showLabel,
    showErrorMessage = BaseFieldDefaults.showErrorMessage,
    disabled = BaseFieldDefaults.disabled,
    hidden = false,
    width = FormFieldClass.MinWidth,
    class: className = '',
    lang = undefined,
    theme: themeProp = undefined,
    placeholder = undefined,
    lineNumbers = true,
    lineWrapping = false,
    useTab = true,
    tabSize = 2,
    readonly = false,
    extensions = [],
    minHeight = 'min-h-40 max-h-120 overflow-y-auto',
    onready = undefined,
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)
  const value = $derived(form ? (form.values[name] as string | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const theme = $derived(themeProp ?? (mode.current === 'dark' ? brandDark : brandLight))

  function handleChange(newValue: string) {
    if (form) {
      form.updateField(name, newValue)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = newValue
    }
  }

  function handleReady(view: EditorView) {
    view.dom.addEventListener('blur', () => form?.touchField(name), true)
    onready?.(view)
  }

  const containerClasses = $derived(
    joinClassnames(
      ' bg-background',
      error ? 'border-destructive ring-destructive ring-1' : 'border-input ',
      isDisabled ? 'opacity-50' : '',
      width,
      className,
    ),
  )
</script>

{#if browser && !isHidden}
  <div>
    <Label for={id} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class={containerClasses} aria-labelledby="label-{id}" {...aria}>
          <div class="codemirror-field flex flex-col {minHeight}">
            <CodeMirror
              value={value ?? ''}
              {lang}
              {theme}
              {placeholder}
              {lineNumbers}
              {lineWrapping}
              {useTab}
              {tabSize}
              {extensions}
              editable={!isDisabled}
              {readonly}
              onchange={handleChange}
              onready={handleReady} />
          </div>
        </div>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} />
{/if}

<style lang="postcss">
  @reference "../../../../routes/layout.css";

  .codemirror-field :global(> div) {
    @apply flex min-h-full flex-1 flex-col;
  }

  .codemirror-field :global(.cm-editor) {
    @apply flex-1 bg-transparent outline-none;
  }

  .codemirror-field :global(.cm-editor.cm-focused) {
    @apply outline-none;
  }

  .codemirror-field :global(.cm-scroller) {
    @apply min-h-full overflow-auto font-mono text-sm;
  }

  .codemirror-field :global(.cm-gutters) {
    @apply border-r border-input bg-transparent;
  }

  .codemirror-field :global(.cm-content) {
    @apply py-2;
  }

  .codemirror-field :global(.cm-line) {
    @apply px-3;
  }
</style>
