import { describe, expect, it } from 'vitest'
import { buildTenantHandoffUrl, buildVanityOrigin, getVanityFromHost, isShadowing, readTenantHandoff } from './tenant'

describe('getVanityFromHost', () => {
  it('reads the first label as the vanity', () => {
    expect(getVanityFromHost('acme.moddo.pro')).toBe('acme')
    expect(getVanityFromHost('moddo.moddo.local')).toBe('moddo')
  })

  it('is case-insensitive and ignores surrounding space', () => {
    expect(getVanityFromHost('  ACME.Moddo.Pro ')).toBe('acme')
  })

  it('returns null for hosts with no tenant label', () => {
    expect(getVanityFromHost('localhost')).toBeNull()
    expect(getVanityFromHost('')).toBeNull()
  })

  it('returns null for IP literals, which have no subdomain structure', () => {
    expect(getVanityFromHost('127.0.0.1')).toBeNull()
    expect(getVanityFromHost('::1')).toBeNull()
    expect(getVanityFromHost('[::1]')).toBeNull()
  })

  it('does not treat the marketing host as a tenant named "www"', () => {
    expect(getVanityFromHost('www.moddo.pro')).toBeNull()
  })
})

describe('isShadowing', () => {
  it('is true only when the home tenant differs from the origin tenant', () => {
    expect(isShadowing('tenant-moddo', 'tenant-acme')).toBe(true)
    expect(isShadowing('tenant-moddo', 'tenant-moddo')).toBe(false)
  })

  it('is false when either side is unknown — an unresolved origin sends no header', () => {
    expect(isShadowing(null, 'tenant-acme')).toBe(false)
    expect(isShadowing('tenant-moddo', null)).toBe(false)
    expect(isShadowing(undefined, null)).toBe(false)
  })
})

describe('buildVanityOrigin', () => {
  it('swaps only the first label, preserving the rest of the domain', () => {
    expect(buildVanityOrigin('acme', { protocol: 'https:', hostname: 'moddo.moddo.pro', port: '' })).toBe(
      'https://acme.moddo.pro',
    )
  })

  it('preserves the dev port and scheme', () => {
    expect(buildVanityOrigin('acme', { protocol: 'http:', hostname: 'moddo.moddo.local', port: '5173' })).toBe(
      'http://acme.moddo.local:5173',
    )
  })
})

describe('buildTenantHandoffUrl', () => {
  const location = { protocol: 'http:', hostname: 'moddo.moddo.local', port: '5173' }

  it('carries both ids to the target origin', () => {
    const url = new URL(
      buildTenantHandoffUrl(
        { vanity: 'acme', tenantId: 'tenant-uuid', legalEntityId: 'entity-uuid', path: '/admin' },
        location,
      ),
    )
    expect(url.origin).toBe('http://acme.moddo.local:5173')
    expect(url.pathname).toBe('/admin')
    expect(url.searchParams.get('t')).toBe('tenant-uuid')
    expect(url.searchParams.get('le')).toBe('entity-uuid')
  })

  it('defaults to the root and normalizes a path without a leading slash', () => {
    expect(
      new URL(buildTenantHandoffUrl({ vanity: 'acme', tenantId: 't', legalEntityId: 'e' }, location)).pathname,
    ).toBe('/')
    expect(
      new URL(buildTenantHandoffUrl({ vanity: 'acme', tenantId: 't', legalEntityId: 'e', path: 'admin' }, location))
        .pathname,
    ).toBe('/admin')
  })

  it('round-trips through readTenantHandoff', () => {
    const url = new URL(
      buildTenantHandoffUrl({ vanity: 'acme', tenantId: 'tenant-uuid', legalEntityId: 'entity-uuid' }, location),
    )
    expect(readTenantHandoff(url)).toEqual({ tenantId: 'tenant-uuid', legalEntityId: 'entity-uuid' })
  })
})

describe('readTenantHandoff', () => {
  it('returns null unless both ids are present — a half handoff is not a handoff', () => {
    expect(readTenantHandoff(new URL('http://acme.moddo.local/'))).toBeNull()
    expect(readTenantHandoff(new URL('http://acme.moddo.local/?t=tenant-uuid'))).toBeNull()
    expect(readTenantHandoff(new URL('http://acme.moddo.local/?le=entity-uuid'))).toBeNull()
  })
})
