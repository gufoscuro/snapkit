import { getAllComponentKeys } from '$generated/components-registry'
import { type Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import type { DashboardOverride } from './types'

const SnippetDefinitionSchema = Type.Object({
  componentKey: Type.String({ minLength: 1 }),
  enabled: Type.Boolean(),
  bindings: Type.Optional(Type.Unknown()),
  props: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
})

const PageConfigSchema = Type.Recursive(Self =>
  Type.Object({
    $id: Type.String({ minLength: 1 }),
    $params: Type.Optional(Type.Unknown()),
    title: Type.String(),
    route: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    layout: SnippetDefinitionSchema,
    snippets: Type.Record(Type.String(), SnippetDefinitionSchema),
    subpages: Type.Optional(Type.Array(Self)),
  }),
)

// `additionalProperties: false` on the override shapes: a misspelled key (`prop`, `componentkey`)
// would otherwise validate and then silently do nothing at push time.
const SnippetOverrideSchema = Type.Object(
  {
    op: Type.Literal('snippet'),
    page: Type.String({ minLength: 1 }),
    slot: Type.String({ minLength: 1 }),
    set: Type.Object(
      {
        props: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
        componentKey: Type.Optional(Type.String({ minLength: 1 })),
        enabled: Type.Optional(Type.Boolean()),
      },
      { additionalProperties: false, minProperties: 1 },
    ),
    reason: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
)

const AddPageOverrideSchema = Type.Object(
  {
    op: Type.Literal('page.add'),
    parent: Type.Optional(Type.String({ minLength: 1 })),
    page: PageConfigSchema,
    reason: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
)

export const DashboardOverridesSchema = Type.Array(Type.Union([SnippetOverrideSchema, AddPageOverrideSchema]))

const SCHEMA_BY_OP = { snippet: SnippetOverrideSchema, 'page.add': AddPageOverrideSchema } as const
export const OVERRIDE_OPS = Object.keys(SCHEMA_BY_OP) as (keyof typeof SCHEMA_BY_OP)[]

/** A validation error located by JSON pointer (`/0/set/props`), so the editor can underline it. */
export type OverrideError = { path: string; message: string }

export type ParseOverridesResult = { ok: true; overrides: DashboardOverride[] } | { ok: false; errors: OverrideError[] }

const MAX_ERRORS = 10

function componentKeyErrors(override: DashboardOverride, base: string, known: Set<string>): OverrideError[] {
  const found: { path: string; key: string }[] = []
  if (override.op === 'snippet') {
    if (override.set.componentKey) found.push({ path: `${base}/set/componentKey`, key: override.set.componentKey })
  } else {
    const visit = (page: Static<typeof PageConfigSchema>, at: string) => {
      found.push({ path: `${at}/layout/componentKey`, key: page.layout.componentKey })
      for (const [slot, snippet] of Object.entries(page.snippets)) {
        found.push({ path: `${at}/snippets/${slot}/componentKey`, key: snippet.componentKey })
      }
      page.subpages?.forEach((sub, i) => visit(sub, `${at}/subpages/${i}`))
    }
    visit(override.page as Static<typeof PageConfigSchema>, `${base}/page`)
  }
  return found
    .filter(({ key }) => !known.has(key))
    .map(({ path, key }) => ({ path, message: `Unknown componentKey "${key}"` }))
}

/**
 * Validates already-parsed JSON as a list of overrides. Each item is checked against
 * the schema of its own `op` — validating against the union would only yield a generic
 * "expected union value" instead of pointing at the wrong field. Unknown keys are
 * rejected, and every `componentKey` must exist in the components registry (a typo
 * there would otherwise only show up as a blank page).
 */
export function validateOverrides(data: unknown): ParseOverridesResult {
  if (!Array.isArray(data)) return { ok: false, errors: [{ path: '', message: 'Expected an array of overrides' }] }

  const known = new Set<string>(getAllComponentKeys())
  const errors: OverrideError[] = []

  data.forEach((item, i) => {
    const base = `/${i}`
    const op = (item as { op?: unknown } | null)?.op
    const schema = typeof op === 'string' ? SCHEMA_BY_OP[op as keyof typeof SCHEMA_BY_OP] : undefined
    if (!schema) {
      const path = item && typeof item === 'object' && 'op' in item ? `${base}/op` : base
      errors.push({ path, message: `Expected "op" to be one of: ${OVERRIDE_OPS.join(', ')}` })
      return
    }
    if (!Value.Check(schema, item)) {
      for (const e of Value.Errors(schema, item)) errors.push({ path: `${base}${e.path}`, message: e.message })
      return
    }
    errors.push(...componentKeyErrors(item as DashboardOverride, base, known))
  })

  return errors.length > 0 ? { ok: false, errors: errors.slice(0, MAX_ERRORS) } : { ok: true, overrides: data }
}

/** Parses and validates overrides typed as JSON in the admin panel, before they are saved. */
export function parseOverrides(json: string): ParseOverridesResult {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch (err) {
    return { ok: false, errors: [{ path: '', message: `Invalid JSON: ${(err as Error).message}` }] }
  }
  return validateOverrides(data)
}
