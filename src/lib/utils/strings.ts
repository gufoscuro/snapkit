export function getUserInitials(name: string) {
  const names = name.trim().split(/\s+/)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  const first = names[0].charAt(0).toUpperCase()
  const last = names[names.length - 1].charAt(0).toUpperCase()
  return first + last
}
