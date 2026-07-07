import type { Snippet } from 'svelte'

export type StatCardTrendDirection = 'up' | 'down' | 'flat'

/** Emotional coloring of a trend, independent from its direction (for a KPI
 * where "down" is good, pass `sentiment: 'positive'`). */
export type StatCardSentiment = 'positive' | 'negative' | 'neutral'

export interface StatCardTrend {
  direction: StatCardTrendDirection
  /** Short label rendered inside the pill, e.g. `+12.5%`. */
  label: string
  /** Overrides the color derived from `direction`. */
  sentiment?: StatCardSentiment
}

export interface StatCardProps {
  /** Muted label at the top of the card. */
  title: string

  // ── state ──────────────────────────────────────────────────────────────
  loading?: boolean
  /** Localized error message; when set the card renders its error state. */
  error?: string | null
  /** Retry handler shown in the error state. */
  onRetry?: () => void
  /** Renders the empty state (no data / not configured). */
  empty?: boolean
  emptyLabel?: string

  // ── loaded content ─────────────────────────────────────────────────────
  /** Preformatted primary value (currency, count, …). */
  value?: string
  /** Top-right pill. */
  trend?: StatCardTrend
  /** Bold footer line. */
  footerTitle?: string
  /** Muted footer line below `footerTitle`. */
  footerSubtext?: string
  /**
   * Custom footer content for the loaded state, replacing `footerTitle` /
   * `footerSubtext`. Interactive elements inside must be `relative z-10` to sit
   * above the card's stretched link (see `href`).
   */
  footer?: Snippet
  /** `positive` tints the card for a "nothing to do / all done" success. */
  tone?: 'default' | 'positive'
  /** Makes the whole card a link (disabled in loading/error states). */
  href?: string
  /** Shows a subtle "demo" marker (mock data). */
  demo?: boolean

  /** Optional leading icon rendered next to the title. */
  icon?: Snippet
  class?: string
}
