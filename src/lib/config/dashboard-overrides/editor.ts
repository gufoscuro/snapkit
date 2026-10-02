/**
 * CodeMirror support for editing dashboard overrides as JSON: context-aware completion
 * (keys per object kind, page `$id`s, slots, component keys, whole-override templates)
 * and inline diagnostics from the same validation used on save.
 *
 * Interim, like the JSON editor it powers — see `.blueprints/components/dashboard-overrides.md`.
 */
import { getAllComponentKeys } from '$generated/components-registry'
import type { DashboardConfigData } from '$lib/stores/tenant-config/types'
import type { PageConfig } from '$lib/utils/page-registry'
import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
  snippetCompletion,
} from '@codemirror/autocomplete'
import { jsonLanguage } from '@codemirror/lang-json'
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'
import { type Diagnostic, linter } from '@codemirror/lint'
import type { EditorState, Extension } from '@codemirror/state'
import type { SyntaxNode } from '@lezer/common'
import { OVERRIDE_OPS, validateOverrides } from './schema'

export type OverridesEditorContext = {
  pageIds: string[]
  slotsByPage: Map<string, string[]>
  allSlots: string[]
  componentKeys: string[]
}

/** Completion vocabulary taken from the dashboard the overrides apply to (the scaffold). */
export function buildOverridesEditorContext(dashboard: DashboardConfigData): OverridesEditorContext {
  const slotsByPage = new Map<string, string[]>()
  const visit = (page: PageConfig) => {
    slotsByPage.set(page.$id, Object.keys(page.snippets ?? {}))
    page.subpages?.forEach(visit)
  }
  dashboard.pages.forEach(visit)
  return {
    pageIds: [...slotsByPage.keys()],
    slotsByPage,
    allSlots: [...new Set([...slotsByPage.values()].flat())].sort(),
    componentKeys: getAllComponentKeys(),
  }
}

// --- Syntax tree helpers ----------------------------------------------------------------

const VALUE_NODES = new Set(['Object', 'Array', 'String', 'Number', 'True', 'False', 'Null'])

function unquote(state: EditorState, node: SyntaxNode): string {
  const text = state.sliceDoc(node.from, node.to)
  try {
    return JSON.parse(text) as string
  } catch {
    return text.replace(/^"|"$/g, '')
  }
}

function propertyKey(state: EditorState, property: SyntaxNode): string | undefined {
  const name = property.getChild('PropertyName')
  return name ? unquote(state, name) : undefined
}

function propertyValue(property: SyntaxNode): SyntaxNode | null {
  const last = property.lastChild
  return last && VALUE_NODES.has(last.name) ? last : null
}

function properties(state: EditorState, object: SyntaxNode): Map<string, SyntaxNode> {
  const map = new Map<string, SyntaxNode>()
  for (const property of object.getChildren('Property')) {
    const key = propertyKey(state, property)
    if (key !== undefined) map.set(key, property)
  }
  return map
}

function stringValue(state: EditorState, property: SyntaxNode | undefined): string | undefined {
  const value = property && propertyValue(property)
  return value?.name === 'String' ? unquote(state, value) : undefined
}

/** Keys from the enclosing root override down to `object`, plus that root override. */
function locate(state: EditorState, object: SyntaxNode): { path: string[]; root: SyntaxNode | null } {
  const path: string[] = []
  let node: SyntaxNode = object
  for (;;) {
    const parent = node.parent
    if (!parent) return { path, root: null }
    if (parent.name === 'Property') {
      path.unshift(propertyKey(state, parent) ?? '')
      if (!parent.parent) return { path, root: null }
      node = parent.parent
    } else if (parent.name === 'Array') {
      if (parent.parent?.name === 'JsonText') return { path, root: node }
      // Array items (e.g. `subpages`) are transparent: the next key up names the array.
      node = parent
    } else {
      return { path, root: null }
    }
  }
}

// --- Override shape -----------------------------------------------------------------------

type Kind = 'root' | 'set' | 'page' | 'snippets' | 'snippetDef' | 'free'

function kindOf(path: string[], op: string | undefined): Kind {
  let kind: Kind = 'root'
  for (const key of path) {
    if (kind === 'root') kind = key === 'set' ? 'set' : key === 'page' && op === 'page.add' ? 'page' : 'free'
    else if (kind === 'page')
      kind = key === 'layout' ? 'snippetDef' : key === 'snippets' ? 'snippets' : key === 'subpages' ? 'page' : 'free'
    else if (kind === 'snippets') kind = 'snippetDef'
    else kind = 'free'
  }
  return kind
}

type KeySpec = { key: string; detail: string }

function keysFor(kind: Kind, op: string | undefined, ctx: OverridesEditorContext): KeySpec[] {
  switch (kind) {
    case 'root':
      if (op === 'snippet')
        return [
          { key: 'op', detail: 'string' },
          { key: 'page', detail: 'page $id' },
          { key: 'slot', detail: 'snippet slot' },
          { key: 'set', detail: '{ props, componentKey, enabled }' },
          { key: 'reason', detail: 'string' },
        ]
      if (op === 'page.add')
        return [
          { key: 'op', detail: 'string' },
          { key: 'parent', detail: 'page $id (optional)' },
          { key: 'page', detail: 'PageConfig' },
          { key: 'reason', detail: 'string' },
        ]
      return [{ key: 'op', detail: OVERRIDE_OPS.join(' | ') }]
    case 'set':
      return [
        { key: 'props', detail: 'object, merged' },
        { key: 'componentKey', detail: 'component key' },
        { key: 'enabled', detail: 'boolean' },
      ]
    case 'page':
      return [
        { key: '$id', detail: 'string' },
        { key: 'title', detail: 'string' },
        { key: 'route', detail: 'string' },
        { key: 'description', detail: 'string' },
        { key: 'layout', detail: 'snippet' },
        { key: 'snippets', detail: '{ [slot]: snippet }' },
        { key: 'subpages', detail: 'PageConfig[]' },
      ]
    case 'snippetDef':
      return [
        { key: 'componentKey', detail: 'component key' },
        { key: 'enabled', detail: 'boolean' },
        { key: 'props', detail: 'object' },
      ]
    case 'snippets':
      return ctx.allSlots.map(slot => ({ key: slot, detail: 'slot' }))
    case 'free':
      return []
  }
}

type ValueSpec = { strings?: string[]; booleans?: boolean }

function valuesFor(
  kind: Kind,
  key: string,
  root: Map<string, SyntaxNode>,
  state: EditorState,
  ctx: OverridesEditorContext,
): ValueSpec {
  const op = stringValue(state, root.get('op'))
  if (kind === 'root') {
    if (key === 'op') return { strings: OVERRIDE_OPS }
    if (key === 'parent' || (key === 'page' && op === 'snippet')) return { strings: ctx.pageIds }
    if (key === 'slot') {
      const page = stringValue(state, root.get('page'))
      return { strings: (page && ctx.slotsByPage.get(page)) || ctx.allSlots }
    }
  }
  if ((kind === 'set' || kind === 'snippetDef') && key === 'componentKey') return { strings: ctx.componentKeys }
  if ((kind === 'set' || kind === 'snippetDef') && key === 'enabled') return { booleans: true }
  return {}
}

// --- Completion ---------------------------------------------------------------------------

const TEMPLATE_BODIES = {
  snippet:
    '{\n  "op": "snippet",\n  "page": "${page}",\n  "slot": "${content}",\n  "set": { "props": { ${} } },\n  "reason": "${reason}"\n}',
  'page.add':
    '{\n  "op": "page.add",\n  "parent": "${parent}",\n  "page": {\n    "$id": "${id}",\n    "title": "${title}",\n    "route": "${route}",\n    "layout": { "componentKey": "layouts.LeftSidebar", "enabled": true },\n    "snippets": {}\n  },\n  "reason": "${reason}"\n}',
}

/** Whole-override templates, for an item of the root array. */
const TEMPLATES: Completion[] = Object.entries(TEMPLATE_BODIES).map(([label, body]) =>
  snippetCompletion(body, { label, detail: 'override template', type: 'class' }),
)

/** Same templates wrapped in the root array, for an empty document. */
const ROOT_TEMPLATES: Completion[] = Object.entries(TEMPLATE_BODIES).map(([label, body]) =>
  snippetCompletion(`[\n  ${body.replace(/\n/g, '\n  ')}\n]`, { label, detail: 'override template', type: 'class' }),
)

function enclosing(node: SyntaxNode | null, names: string[]): SyntaxNode | null {
  for (let n = node; n; n = n.parent) if (names.includes(n.name)) return n
  return null
}

export function createOverridesCompletionSource(ctx: OverridesEditorContext): CompletionSource {
  return (context: CompletionContext): CompletionResult | null => {
    const { state, pos } = context
    const node = syntaxTree(state).resolveInner(pos, -1)

    // Inside a closed string: complete its content (a key or a value).
    if (node.name === 'PropertyName' || (node.name === 'String' && node.parent?.name === 'Property')) {
      const from = node.from + 1
      const to = Math.max(from, state.sliceDoc(node.to - 1, node.to) === '"' ? node.to - 1 : node.to)
      const property = node.parent!
      const object = property.parent
      if (!object) return null
      const { path, root } = locate(state, object)
      const rootProps = root ? properties(state, root) : new Map()
      const op = stringValue(state, rootProps.get('op'))
      const kind = kindOf(path, op)

      if (node.name === 'PropertyName') {
        const existing = properties(state, object)
        const options = keysFor(kind, op, ctx)
          .filter(({ key }) => !existing.has(key) || key === unquote(state, node))
          .map(({ key, detail }) => ({ label: key, detail, type: 'property' }))
        return options.length ? { from, to, options, validFor: /^[\w$.-]*$/ } : null
      }

      const key = propertyKey(state, property) ?? ''
      const { strings } = valuesFor(kind, key, kind === 'root' ? properties(state, object) : rootProps, state, ctx)
      if (!strings?.length) return null
      return { from, to, options: strings.map(label => ({ label, type: 'constant' })), validFor: /^[\w$.-]*$/ }
    }

    // Outside a string: a key, a value after `:`, or a whole override in the root array.
    const typed = context.matchBefore(/"?[\w$.-]*/)
    const from = typed ? typed.from : pos
    if (!context.explicit && (!typed || typed.from === typed.to)) {
      // Only open unprompted right after a structural character, not on every whitespace.
      const before = state.sliceDoc(Math.max(0, pos - 2), pos).trim()
      if (!/[{,:[]$/.test(before)) return null
    }

    const container = enclosing(node, ['Property', 'Object', 'Array'])
    if (!container) return state.doc.toString().trim() === '' ? { from, options: ROOT_TEMPLATES } : null

    if (container.name === 'Array') {
      return container.parent?.name === 'JsonText' ? { from, options: TEMPLATES } : null
    }

    if (container.name === 'Property' && !propertyValue(container)) {
      const object = container.parent
      if (!object) return null
      const { path, root } = locate(state, object)
      const rootProps = root ? properties(state, root) : new Map()
      const kind = kindOf(path, stringValue(state, rootProps.get('op')))
      const key = propertyKey(state, container) ?? ''
      const { strings, booleans } = valuesFor(
        kind,
        key,
        kind === 'root' ? properties(state, object) : rootProps,
        state,
        ctx,
      )
      const options: Completion[] = [
        ...(strings ?? []).map(label => ({ label, apply: JSON.stringify(label), type: 'constant' })),
        ...(booleans ? ['true', 'false'].map(label => ({ label, type: 'keyword' })) : []),
      ]
      return options.length ? { from, options } : null
    }

    const object = container.name === 'Object' ? container : container.parent
    if (!object || object.name !== 'Object') return null
    const { path, root } = locate(state, object)
    const rootProps = root ? properties(state, root) : properties(state, object)
    const op = stringValue(state, rootProps.get('op'))
    const existing = properties(state, object)
    const options = keysFor(kindOf(path, op), op, ctx)
      .filter(({ key }) => !existing.has(key))
      .map(({ key, detail }) => ({ label: key, detail, apply: `"${key}": `, type: 'property' }))
    return options.length ? { from, options } : null
  }
}

// --- Diagnostics --------------------------------------------------------------------------

function decodePointer(pointer: string): string[] {
  return pointer
    .split('/')
    .slice(1)
    .map(seg => seg.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/**
 * Document range for a validation error's JSON pointer. Resolves as deep as the document
 * goes: a missing key (e.g. a required property) points at the opening brace of the
 * object that should contain it, rather than at the whole object.
 */
export function rangeAtPointer(state: EditorState, pointer: string): { from: number; to: number } {
  const tree = ensureSyntaxTree(state, state.doc.length, 1000) ?? syntaxTree(state)
  let node: SyntaxNode | null = tree.topNode.firstChild
  if (!node) return { from: 0, to: Math.min(1, state.doc.length) }

  const segments = decodePointer(pointer)
  for (const [index, seg] of segments.entries()) {
    if (node.name === 'Array') {
      const items: SyntaxNode[] = []
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (VALUE_NODES.has(child.name)) items.push(child)
      }
      const item: SyntaxNode | undefined = items[Number(seg)]
      if (!item) return { from: node.from, to: node.from + 1 }
      node = item
    } else if (node.name === 'Object') {
      const property = properties(state, node).get(seg)
      if (!property) return { from: node.from, to: node.from + 1 }
      node = propertyValue(property) ?? property
      // Last segment of an "unexpected property" error: underline the whole property.
      if (index === segments.length - 1) return { from: property.from, to: property.to }
    } else {
      break
    }
  }
  return { from: node.from, to: node.to }
}

export function lintOverrides(state: EditorState): Diagnostic[] {
  const text = state.doc.toString()
  if (text.trim() === '') return []

  const tree = ensureSyntaxTree(state, state.doc.length, 1000) ?? syntaxTree(state)
  let syntaxError: Diagnostic | null = null
  tree.iterate({
    enter: node => {
      if (syntaxError) return false
      if (node.type.isError) {
        const from = Math.min(node.from, Math.max(0, state.doc.length - 1))
        syntaxError = {
          from,
          to: Math.min(state.doc.length, Math.max(node.to, from + 1)),
          severity: 'error',
          message: 'Invalid JSON',
        }
        return false
      }
    },
  })
  if (syntaxError) return [syntaxError]

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (err) {
    return [{ from: 0, to: Math.min(1, state.doc.length), severity: 'error', message: (err as Error).message }]
  }

  const result = validateOverrides(data)
  if (result.ok) return []
  return result.errors.map(error => ({
    ...rangeAtPointer(state, error.path),
    severity: 'error',
    message: error.message,
  }))
}

/** Extensions for the overrides JSON editor: completion + inline validation. */
export function overridesEditorExtensions(dashboard: DashboardConfigData): Extension[] {
  const ctx = buildOverridesEditorContext(dashboard)
  return [
    jsonLanguage.data.of({ autocomplete: createOverridesCompletionSource(ctx) }),
    linter(view => lintOverrides(view.state)),
  ]
}
