export type EntityWithError<T> = T & {
  _error?: Array<string>
  _focus?: boolean
}

export type EntitiesListWithError<T> = Array<EntityWithError<T>>

export type BasicOption = {
  label: string
  value: string
}

export type KeyValueObject<T> = {
  [key: string]: T
}

export type ExtendedOption<T = unknown> = BasicOption & {
  attr?: T
}

export function unwrapEntity<T>(entity: EntityWithError<T>): T {
  const { _error, _focus, ...rest } = entity
  return rest as T
}

export function unwrapEntities<T>(entities: Array<EntityWithError<T>>): T[] {
  return entities.map(unwrapEntity)
}

export function entityHasError<T>(entity: EntityWithError<T>, field: string): boolean {
  return entity?._error?.includes(field) || false
}
