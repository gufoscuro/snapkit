export type PathSegment = string | number
export type Path = PathSegment[]

/**
 * What the left column has selected. The raw JSON view isn't a node in the
 * config tree — it IS the tree — so it can't be addressed by a `Path` (an empty
 * path yields no `NodeKind`). Modelling it as its own case keeps the two
 * selections distinguishable instead of overloading `null`/`[]`.
 */
export type Selection = { type: 'raw' } | { type: 'node'; path: Path }

export type NodeKind =
  | 'pages-root'
  | 'page'
  | 'menus-root'
  | 'menu'
  | 'menu-item'
  | 'resources-root'
  | 'resource'
  | 'resource-fields-group'
  | 'resource-field'
  | 'resource-custom-fields-group'
  | 'custom-field'
  | 'policies-root'
  | 'policy'
