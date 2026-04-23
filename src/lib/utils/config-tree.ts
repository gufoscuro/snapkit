import type {
  NodeKind,
  Path,
  PathSegment,
} from '$components/features/settings/DashboardEditor/types'
import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'

export function pathsEqual(a: Path | null, b: Path | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function getAtPath(config: LegalEntityConfigResponse, path: Path): unknown {
  if (path.length === 0) return config
  let current = resolveRoot(config, path[0])
  for (let i = 1; i < path.length; i++) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<PathSegment, unknown>)[path[i]]
  }
  return current
}

export function updateAtPath(
  config: LegalEntityConfigResponse,
  path: Path,
  updater: (node: unknown) => unknown,
): LegalEntityConfigResponse {
  if (path.length === 0) return updater(config) as LegalEntityConfigResponse

  const [head, ...rest] = path

  switch (head) {
    case 'pages':
      return {
        ...config,
        dashboard: {
          ...config.dashboard,
          pages: updateInCollection(config.dashboard.pages, rest, updater) as typeof config.dashboard.pages,
        },
      }
    case 'menus':
      return {
        ...config,
        dashboard: {
          ...config.dashboard,
          menus: updateInCollection(config.dashboard.menus, rest, updater) as typeof config.dashboard.menus,
        },
      }
    case 'resources':
      return {
        ...config,
        resources: updateInCollection(config.resources, rest, updater) as typeof config.resources,
      }
    case 'policies':
      return {
        ...config,
        policies: updateInCollection(config.policies, rest, updater) as typeof config.policies,
      }
    default:
      return config
  }
}

function resolveRoot(config: LegalEntityConfigResponse, head: PathSegment): unknown {
  switch (head) {
    case 'pages':
      return config.dashboard.pages
    case 'menus':
      return config.dashboard.menus
    case 'resources':
      return config.resources
    case 'policies':
      return config.policies
    default:
      return undefined
  }
}

function updateInCollection(
  obj: unknown,
  path: Path,
  updater: (node: unknown) => unknown,
): unknown {
  if (path.length === 0) return updater(obj)
  const [head, ...rest] = path

  if (Array.isArray(obj)) {
    const idx = typeof head === 'number' ? head : Number(head)
    return obj.map((item, i) => (i === idx ? updateInCollection(item, rest, updater) : item))
  }

  if (obj && typeof obj === 'object') {
    const rec = obj as Record<string, unknown>
    return { ...rec, [head]: updateInCollection(rec[head], rest, updater) }
  }

  return updater(obj)
}

export function getKind(path: Path): NodeKind | null {
  if (path.length === 0) return null
  const head = path[0]

  if (head === 'pages') {
    if (path.length === 1) return 'pages-root'
    return 'page'
  }

  if (head === 'menus') {
    if (path.length === 1) return 'menus-root'
    if (path.length === 2) return 'menu'
    return 'menu-item'
  }

  if (head === 'resources') {
    if (path.length === 1) return 'resources-root'
    if (path.length === 2) return 'resource'
    if (path.length === 3) {
      if (path[2] === 'fields') return 'resource-fields-group'
      if (path[2] === 'custom_fields') return 'resource-custom-fields-group'
    }
    if (path.length === 4) {
      if (path[2] === 'fields') return 'resource-field'
      if (path[2] === 'custom_fields') return 'custom-field'
    }
  }

  if (head === 'policies') {
    if (path.length === 1) return 'policies-root'
    return 'policy'
  }

  return null
}
