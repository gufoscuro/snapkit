export type PathSegment = string | number
export type Path = PathSegment[]

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
