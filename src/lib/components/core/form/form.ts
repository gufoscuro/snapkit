// =============================================================================
// FORM FIELD CONSTANTS
// =============================================================================

export const FormFieldClass = Object.freeze({
  MinWidth: 'min-w-64 md:min-w-formfield',
  MaxWidth: 'max-w-full md:max-w-formfield',
  TableCell: 'h-10 w-full rounded-none border-transparent focus:border-primary focus-visible:ring-0',
  SelectorDefaultWidth: 'min-w-40 lg:min-w-[280px]',
  SelectorContentDefaultWidth: 'min-w-[280px]',
  SelectorTableCellWidth: 'w-full max-md:max-w-60 overflow-hidden overflow-ellipsis',
  SelectorContentTableCellWidth: 'w-56 md:w-80 lg:w-[500px]',
})

/** Default classes for form field labels */
export const FormLabelClass = 'leading-6'

export type FormFieldMessagePosition = 'top' | 'bottom' | 'floating-top' | 'floating-bottom'

// =============================================================================
// BASE FIELD PROPS - Common to all form fields
// =============================================================================

/** Props comuni a tutti i form field */
export type BaseFieldProps = {
  /** Campo name per form e identificazione */
  name: string
  /** Etichetta del campo */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** ID HTML (default: name) */
  id?: string
  /** Messaggio di errore */
  error?: string
  /** Messaggio di warning */
  warning?: string
  /** Posizione messaggio errore */
  errorPosition?: FormFieldMessagePosition
  /** Posizione messaggio warning */
  warningPosition?: FormFieldMessagePosition
  /** Mostra label visibile */
  showLabel?: boolean
  /** Mostra messaggio errore */
  showErrorMessage?: boolean
  /** Campo disabilitato */
  disabled?: boolean
  /** Larghezza campo (classe Tailwind) */
  width?: string
  /** Classi CSS aggiuntive */
  class?: string
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

/** Event handlers per input HTML */
export type InputEventHandlers = {
  oninput?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void
  onfocus?: (e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void
  onblur?: (e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void
  onkeyup?: (e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void
}

/** Event handlers per textarea HTML */
export type TextareaEventHandlers = {
  oninput?: (e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => void
  onfocus?: (e: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) => void
  onblur?: (e: FocusEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) => void
}

// =============================================================================
// EXTENDED FIELD PROPS
// =============================================================================

/** Props per campi input testuali (text, number, email, etc.) */
export type InputFieldProps = BaseFieldProps &
  InputEventHandlers & {
    /** Auto-focus all'apertura */
    focus?: boolean
    /** Larghezza automatica (flex-1) */
    autoWidth?: boolean
  }

/** Props per textarea */
export type TextareaFieldProps = BaseFieldProps &
  TextareaEventHandlers & {
    /** Auto-focus all'apertura */
    focus?: boolean
    /** Numero di righe */
    rows?: number
  }

/** Props per selector/dropdown */
export type SelectorFieldProps = BaseFieldProps & {
  /** Larghezza contenuto dropdown */
  contentWidth?: string
  /** Allineamento dropdown */
  align?: 'start' | 'center' | 'end'
  /** Permetti clear della selezione */
  allowClear?: boolean
}

/** Props per switch/toggle - struttura minimale */
export type SwitchFieldProps = {
  /** Campo name per form e identificazione */
  name?: string
  /** Etichetta del campo */
  label?: string
  /** ID HTML (default: name) */
  id?: string
  /** Campo disabilitato */
  disabled?: boolean
  /** Mostra label visibile */
  showLabel?: boolean
  /** Posizione label */
  labelPosition?: 'left' | 'right'
  /** Classi CSS per la label */
  labelClass?: string
  /** Classi CSS aggiuntive */
  class?: string
}

/** Props base per entity selectors (Material, Product, etc.) */
export type EntitySelectorProps = {
  /** Campo name per form e identificazione */
  name?: string
  /** Etichetta del campo */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** ID HTML (default: name) */
  id?: string
  /** Messaggio di errore */
  error?: string
  /** Messaggio di warning */
  warning?: string
  /** Posizione messaggio warning */
  warningPosition?: FormFieldMessagePosition
  /** Mostra label visibile */
  showLabel?: boolean
  /** Mostra messaggio errore */
  showErrorMessage?: boolean
  /** Larghezza campo (classe Tailwind) */
  width?: string
  /** Larghezza contenuto dropdown */
  contentWidth?: string
  /** Allineamento dropdown */
  align?: 'start' | 'center' | 'end'
  /** Campo in sola lettura */
  readonly?: boolean
  /** Campo disabilitato (non interagibile) */
  disabled?: boolean
  /** Permetti creazione nuovo record */
  allowNewRecord?: boolean
  /** Classi CSS aggiuntive */
  class?: string
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/** Default per tutti i form field */
export const BaseFieldDefaults = {
  label: '',
  placeholder: undefined,
  errorPosition: 'bottom' as FormFieldMessagePosition,
  warningPosition: 'bottom' as FormFieldMessagePosition,
  showLabel: true,
  showErrorMessage: true,
  disabled: false,
  width: FormFieldClass.MinWidth,
} as const

/** Default per input testuali */
export const InputFieldDefaults = {
  ...BaseFieldDefaults,
  focus: false,
  autoWidth: false,
} as const

/** Default per textarea */
export const TextareaFieldDefaults = {
  ...BaseFieldDefaults,
  focus: false,
  rows: 3,
} as const

/** Default per selector/dropdown */
export const SelectorFieldDefaults = {
  ...BaseFieldDefaults,
  width: FormFieldClass.SelectorDefaultWidth,
  contentWidth: FormFieldClass.SelectorContentDefaultWidth,
  align: 'end' as const,
  allowClear: false,
} as const

/** Default per switch/toggle */
export const SwitchFieldDefaults = {
  label: '',
  disabled: false,
  showLabel: true,
  labelPosition: 'right' as const,
  labelClass: '',
} as const

/** Default per entity selectors (Material, Product, etc.) */
export const EntitySelectorDefaults = {
  label: '',
  placeholder: '',
  error: '',
  warning: undefined,
  warningPosition: 'bottom' as FormFieldMessagePosition,
  showLabel: true,
  showErrorMessage: true,
  width: FormFieldClass.SelectorDefaultWidth,
  align: 'end' as const,
  readonly: false,
  disabled: false,
  allowNewRecord: false,
} as const

// =============================================================================
// OTHER TYPES
// =============================================================================

export interface FileReadData {
  file: File
  base64String?: string
  text?: string
}
