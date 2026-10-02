/**
 * Per-legal-entity overrides of the scaffold dashboard, stored in the legal entity
 * config under `dashboard.overrides` and re-applied by "push scaffold".
 * See `.blueprints/components/dashboard-overrides.md`.
 *
 * Stored as JSON and edited as JSON in the admin panel: keep every override
 * JSON-serializable, and mirror any change to these types in `schema.ts`.
 */
import type { ComponentKey } from '$generated/components-registry'
import type { PageConfig } from '$lib/utils/page-registry'

/** Patches one snippet slot of an existing page (top-level or subpage, any depth). */
export type SnippetOverride = {
  op: 'snippet'
  /** `$id` of the target page */
  page: string
  /** Snippet slot name, as in `PageConfig.snippets` (e.g. `content`, `sidebar`) */
  slot: string
  set: {
    /** Merged over the scaffold's props (shallow) */
    props?: Record<string, unknown>
    /** Replaces the scaffold's component, e.g. to point at a variant */
    componentKey?: ComponentKey
    enabled?: boolean
  }
  /** Why this tenant needs it — shown in the admin view */
  reason?: string
}

/** Adds a page the scaffold doesn't have, top-level or under an existing page. */
export type AddPageOverride = {
  op: 'page.add'
  /** `$id` of the parent page; omit for a top-level page */
  parent?: string
  page: PageConfig
  reason?: string
}

export type DashboardOverride = SnippetOverride | AddPageOverride

export const UnresolvedReason = {
  /** The target (or parent) page `$id` is not in the scaffold anymore */
  PageNotFound: 'page-not-found',
  /** The page exists but has no such snippet slot */
  SlotNotFound: 'slot-not-found',
  /** A page with the added `$id` already exists — likely the scaffold now ships it */
  PageExists: 'page-exists',
} as const
export type UnresolvedReason = (typeof UnresolvedReason)[keyof typeof UnresolvedReason]

export type UnresolvedOverride = { override: DashboardOverride; reason: UnresolvedReason }
