export function getUserMessagingClasses(error: string | undefined, warning?: string | undefined) {
  if (error)
    return 'border-destructive bg-destructive/10 ring-destructive ring-1 focus-visible:ring-destructive focus-visible:border-primary/50'
  if (warning) return 'border-warning ring-warning ring-1 focus-visible:ring-warning focus-visible:border-primary/50'

  return ''
}

interface LoadValuesOptions<T> {
  target?: T | null
  clone?: T | null  
  inputPayload?: Partial<T> | null
  emptyValues?: T
}

export function getLoadValues<T>(options: LoadValuesOptions<T>): T | null {
  const { target, clone, inputPayload, emptyValues } = options
  if (target) return target
  if (clone) return clone
  if (inputPayload) {
    return emptyValues 
      ? { ...emptyValues, ...inputPayload }
      : inputPayload as T
  }
  return emptyValues || null
}
