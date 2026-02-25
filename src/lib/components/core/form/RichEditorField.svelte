<script lang="ts">
  import { browser } from '$app/environment'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import { Bold, Code, Heading1, Heading2, Italic, List, ListOrdered, Quote, Strikethrough } from 'lucide-svelte'
  import { onMount, untrack } from 'svelte'
  import { Markdown } from 'tiptap-markdown'
  import { BaseFieldDefaults, FormFieldClass, FormLabelClass, type BaseFieldProps } from './form'
  import { getFormContextOptional } from './form-context'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'

  type Props = BaseFieldProps & {
    value?: string
    /** Tailwind min-height class applied to the editor area (default: 'min-h-40') */
    minHeight?: string
    /** Show formatting toolbar (default: true) */
    toolbar?: boolean
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
    minHeight = 'min-h-40 max-h-120 overflow-y-auto bg-input/10 dark:bg-input/30',
    toolbar = true,
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)
  const value = $derived(form ? (form.values[name] as string | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Plain JS variable — NOT $state. Writing $state inside $effect (even $state.raw)
  // can trigger Svelte's flush loop because TipTap emits internal transactions that
  // Svelte detects as reactive updates. Using a plain var + editorEl as the reactive
  // gating signal is the only safe pattern for imperative third-party editors.
  let editorEl = $state.raw<HTMLElement | undefined>(undefined)
  // svelte-ignore non_reactive_update
  let _editor: Editor | undefined = undefined
  // Written ONLY from TipTap callbacks (which run outside Svelte's effect scheduler)
  let tick = $state(0)

  function getMarkdown(): string {
    // TypeScript doesn't know about markdown storage, so check at runtime
    const storage = _editor?.storage as Record<string, any> | undefined
    if (storage && storage.markdown && typeof storage.markdown.getMarkdown === 'function') {
      return storage.markdown.getMarkdown()
    }
    // fallback: return plain text if markdown extension is not present
    return _editor?.getText() ?? ''
  }

  // Lifecycle: create / destroy editor when editorEl mounts or unmounts
  onMount(() => {
    if (!editorEl || !browser) return

    const e = new Editor({
      element: editorEl,
      extensions: [StarterKit, Markdown],
      content: untrack(() => value ?? ''),
      editable: untrack(() => !isDisabled),
      onUpdate: ({ editor: ed }) => {
        // TipTap callback — runs outside Svelte's scheduler, safe to write $state
        const md =
          ed.storage &&
          typeof ed.storage === 'object' &&
          'markdown' in ed.storage &&
          typeof (ed.storage.markdown as any)?.getMarkdown === 'function'
            ? (ed.storage.markdown as { getMarkdown: () => string }).getMarkdown()
            : ed.getText()
        if (form) {
          form.updateField(name, md)
          if (form.errors[name]) form.validateField(name)
        } else {
          valueProp = md
        }
        tick++
      },
      onSelectionUpdate: () => {
        tick++
      },
      onBlur: () => form?.touchField(name),
    })

    _editor = e

    return () => {
      e.destroy()
      _editor = undefined
    }
  })

  // Sync disabled state — reads editorEl (gating) + isDisabled, no $state writes
  // $effect(() => {
  //   if (!editorEl || !browser) return
  //   _editor?.setEditable(!isDisabled)
  // })

  // Sync external value changes (e.g. form reset) — reads editorEl + value, no $state writes
  $effect(() => {
    if (!editorEl || !browser) return
    const newValue = value ?? ''
    if (!_editor) return
    if (getMarkdown() !== newValue) {
      // false = suppress onUpdate to avoid feeding back into form state
      // _editor.commands.setContent(newValue, false)
    }
  })

  const containerClasses = $derived(
    joinClassnames(
      'rounded-md border bg-background',
      error
        ? 'border-destructive ring-destructive ring-1'
        : 'border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      isDisabled ? 'pointer-events-none opacity-50' : '',
      width,
      className,
    ),
  )

  const btnClass = (active: boolean) =>
    joinClassnames(
      'inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
    )
</script>

{#if browser && !isHidden}
  <div>
    <Label for={id} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class={containerClasses} aria-labelledby="label-{id}" {...aria}>
          {#if toolbar}
            <div class="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
              <!-- Text formatting -->
              <button
                type="button"
                title="Bold"
                aria-label="Bold"
                aria-pressed={tick >= 0 && (_editor?.isActive('bold') ?? false)}
                onclick={() => _editor?.chain().focus().toggleBold().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('bold') ?? false))}>
                <Bold size={14} />
              </button>
              <button
                type="button"
                title="Italic"
                aria-label="Italic"
                aria-pressed={tick >= 0 && (_editor?.isActive('italic') ?? false)}
                onclick={() => _editor?.chain().focus().toggleItalic().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('italic') ?? false))}>
                <Italic size={14} />
              </button>
              <button
                type="button"
                title="Strikethrough"
                aria-label="Strikethrough"
                aria-pressed={tick >= 0 && (_editor?.isActive('strike') ?? false)}
                onclick={() => _editor?.chain().focus().toggleStrike().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('strike') ?? false))}>
                <Strikethrough size={14} />
              </button>

              <div class="mx-0.5 h-5 w-px bg-border" role="separator" aria-orientation="vertical"></div>

              <!-- Headings -->
              <button
                type="button"
                title="Heading 1"
                aria-label="Heading 1"
                aria-pressed={tick >= 0 && (_editor?.isActive('heading', { level: 1 }) ?? false)}
                onclick={() => _editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('heading', { level: 1 }) ?? false))}>
                <Heading1 size={14} />
              </button>
              <button
                type="button"
                title="Heading 2"
                aria-label="Heading 2"
                aria-pressed={tick >= 0 && (_editor?.isActive('heading', { level: 2 }) ?? false)}
                onclick={() => _editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('heading', { level: 2 }) ?? false))}>
                <Heading2 size={14} />
              </button>

              <div class="mx-0.5 h-5 w-px bg-border" role="separator" aria-orientation="vertical"></div>

              <!-- Lists -->
              <button
                type="button"
                title="Bullet list"
                aria-label="Bullet list"
                aria-pressed={tick >= 0 && (_editor?.isActive('bulletList') ?? false)}
                onclick={() => _editor?.chain().focus().toggleBulletList().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('bulletList') ?? false))}>
                <List size={14} />
              </button>
              <button
                type="button"
                title="Ordered list"
                aria-label="Ordered list"
                aria-pressed={tick >= 0 && (_editor?.isActive('orderedList') ?? false)}
                onclick={() => _editor?.chain().focus().toggleOrderedList().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('orderedList') ?? false))}>
                <ListOrdered size={14} />
              </button>

              <div class="mx-0.5 h-5 w-px bg-border" role="separator" aria-orientation="vertical"></div>

              <!-- Block formats -->
              <button
                type="button"
                title="Blockquote"
                aria-label="Blockquote"
                aria-pressed={tick >= 0 && (_editor?.isActive('blockquote') ?? false)}
                onclick={() => _editor?.chain().focus().toggleBlockquote().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('blockquote') ?? false))}>
                <Quote size={14} />
              </button>
              <button
                type="button"
                title="Code block"
                aria-label="Code block"
                aria-pressed={tick >= 0 && (_editor?.isActive('codeBlock') ?? false)}
                onclick={() => _editor?.chain().focus().toggleCodeBlock().run()}
                class={btnClass(tick >= 0 && (_editor?.isActive('codeBlock') ?? false))}>
                <Code size={14} />
              </button>
            </div>
          {/if}

          <div bind:this={editorEl} class="rich-editor-area {minHeight}"></div>
        </div>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} />
{/if}

<style lang="postcss">
  @reference "../../../../routes/layout.css";

  .rich-editor-area :global(.ProseMirror) {
    @apply min-h-[inherit] px-3 py-2 outline-none;
  }

  /* Typography */
  .rich-editor-area :global(.ProseMirror h1) {
    @apply mt-4 mb-2 text-2xl font-bold;
  }
  .rich-editor-area :global(.ProseMirror h2) {
    @apply mt-3 mb-2 text-xl font-bold;
  }
  .rich-editor-area :global(.ProseMirror h3) {
    @apply mt-3 mb-1 text-lg font-semibold;
  }
  .rich-editor-area :global(.ProseMirror p) {
    @apply my-1;
  }
  .rich-editor-area :global(.ProseMirror ul) {
    @apply my-2 list-disc pl-5;
  }
  .rich-editor-area :global(.ProseMirror ol) {
    @apply my-2 list-decimal pl-5;
  }
  .rich-editor-area :global(.ProseMirror li) {
    @apply my-0.5;
  }
  .rich-editor-area :global(.ProseMirror blockquote) {
    @apply my-2 border-l-4 border-border pl-4 text-muted-foreground italic;
  }
  .rich-editor-area :global(.ProseMirror pre) {
    @apply my-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm;
  }
  .rich-editor-area :global(.ProseMirror code) {
    @apply rounded bg-muted px-1 py-0.5 font-mono text-sm;
  }
  .rich-editor-area :global(.ProseMirror pre code) {
    @apply bg-transparent p-0;
  }
  .rich-editor-area :global(.ProseMirror strong) {
    @apply font-bold;
  }
  .rich-editor-area :global(.ProseMirror em) {
    @apply italic;
  }
  .rich-editor-area :global(.ProseMirror s) {
    @apply line-through;
  }

  .rich-editor-area :global(.ProseMirror) {
    @apply text-sm;
  }
  /* Placeholder when empty */
  .rich-editor-area :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    @apply pointer-events-none float-left h-0 text-muted-foreground;
  }
</style>
