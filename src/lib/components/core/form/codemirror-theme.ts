import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

/**
 * Primary-based CodeMirror theme.
 *
 * Primary color: oklch(0.58 0.11 223.66)
 * All shades share hue 223.66 with varying lightness and chroma.
 */

// ── CSS custom properties (from layout.css) ─────────────────────────
const cssVar = {
  foreground: 'var(--foreground)',
  mutedForeground: 'var(--muted-foreground)',
} as const

// ── Primary palette ─────────────────────────────────────────────────
const primary = {
  50: 'oklch(0.97 0.01 223.66)',
  100: 'oklch(0.93 0.025 223.66)',
  200: 'oklch(0.85 0.055 223.66)',
  300: 'oklch(0.75 0.09 223.66)',
  400: 'oklch(0.66 0.10 223.66)',
  500: 'oklch(0.58 0.11 223.66)', // primary
  600: 'oklch(0.50 0.10 223.66)',
  700: 'oklch(0.42 0.085 223.66)',
  800: 'oklch(0.34 0.07 223.66)',
  900: 'oklch(0.26 0.05 223.66)',
  950: 'oklch(0.19 0.035 223.66)',
} as const

// ── Light theme ──────────────────────────────────────────────────────

const primaryLightTheme = EditorView.theme(
  {
    '&': {
      color: cssVar.foreground,
      backgroundColor: 'transparent',
    },
    '.cm-content': {
      caretColor: primary[500],
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: primary[500],
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: primary[100],
    },
    '.cm-panels': {
      backgroundColor: primary[50],
      color: cssVar.foreground,
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: `1px solid ${primary[200]}`,
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: `1px solid ${primary[200]}`,
    },
    '.cm-searchMatch': {
      backgroundColor: primary[100],
      outline: `1px solid ${primary[300]}`,
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: primary[200],
    },
    '.cm-activeLine': {
      backgroundColor: primary[50],
    },
    '.cm-selectionMatch': {
      backgroundColor: primary[100],
    },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: primary[200],
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: primary[50],
      color: primary[500],
    },
    '.cm-foldPlaceholder': {
      backgroundColor: primary[100],
      border: 'none',
      color: primary[600],
    },
    '.cm-tooltip': {
      border: `1px solid ${primary[200]}`,
      backgroundColor: primary[50],
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: primary[200],
      borderBottomColor: primary[200],
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: primary[50],
      borderBottomColor: primary[50],
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: primary[100],
        color: cssVar.foreground,
      },
    },
  },
  { dark: false },
)

const primaryLightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: primary[600], fontWeight: 'bold' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: primary[700] },
  { tag: [tags.function(tags.variableName)], color: primary[600] },
  { tag: [tags.labelName], color: primary[600] },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: primary[500] },
  { tag: [tags.definition(tags.name), tags.separator], color: primary[600] },
  { tag: [tags.definition(tags.propertyName), tags.propertyName], color: primary[500], fontWeight: 'bold' },
  {
    tag: [tags.typeName, tags.className, tags.changed, tags.annotation, tags.self, tags.namespace],
    color: primary[700],
  },
  { tag: [tags.number], color: primary[500] },
  { tag: [tags.operator, tags.operatorKeyword], color: primary[600] },
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: primary[400] },
  { tag: [tags.meta, tags.comment], color: cssVar.mutedForeground, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.heading, fontWeight: 'bold', color: primary[700] },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: primary[500] },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: cssVar.mutedForeground },
  { tag: tags.invalid, color: primary[400], textDecoration: 'underline wavy' },
])

// ── Dark theme ───────────────────────────────────────────────────────

const primaryDarkTheme = EditorView.theme(
  {
    '&': {
      color: cssVar.foreground,
      backgroundColor: 'transparent',
    },
    '.cm-content': {
      caretColor: primary[400],
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: primary[400],
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: primary[900],
    },
    '.cm-panels': {
      backgroundColor: primary[950],
      color: cssVar.foreground,
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: `1px solid ${primary[800]}`,
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: `1px solid ${primary[800]}`,
    },
    '.cm-searchMatch': {
      backgroundColor: primary[900],
      outline: `1px solid ${primary[700]}`,
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: primary[800],
    },
    '.cm-activeLine': {
      backgroundColor: primary[950],
    },
    '.cm-selectionMatch': {
      backgroundColor: primary[900],
    },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: primary[800],
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: primary[950],
      color: primary[400],
    },
    '.cm-foldPlaceholder': {
      backgroundColor: primary[900],
      border: 'none',
      color: primary[400],
    },
    '.cm-tooltip': {
      border: `1px solid ${primary[800]}`,
      backgroundColor: primary[950],
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: primary[800],
      borderBottomColor: primary[800],
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: primary[950],
      borderBottomColor: primary[950],
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: primary[900],
        color: cssVar.foreground,
      },
    },
  },
  { dark: true },
)

const primaryDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: primary[400], fontWeight: 'bold' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: primary[200] },
  { tag: [tags.function(tags.variableName)], color: primary[300] },
  { tag: [tags.labelName], color: primary[600] },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: primary[400] },
  { tag: [tags.definition(tags.name), tags.separator], color: primary[500] },
  { tag: [tags.definition(tags.propertyName), tags.propertyName], color: primary[300], fontWeight: 'bold' },
  {
    tag: [tags.typeName, tags.className, tags.changed, tags.annotation, tags.self, tags.namespace],
    color: primary[300],
  },
  { tag: [tags.number], color: primary[400] },
  { tag: [tags.operator, tags.operatorKeyword], color: primary[300] },
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: primary[400] },
  { tag: [tags.meta, tags.comment], color: cssVar.mutedForeground, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.heading, fontWeight: 'bold', color: primary[300] },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: primary[400] },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: cssVar.mutedForeground },
  { tag: tags.invalid, color: primary[500], textDecoration: 'underline wavy' },
])

// ── Exports ──────────────────────────────────────────────────────────

/** Light primary theme (editor chrome + syntax highlighting) */
export const brandLight = [primaryLightTheme, syntaxHighlighting(primaryLightHighlightStyle)]

/** Dark primary theme (editor chrome + syntax highlighting) */
export const brandDark = [primaryDarkTheme, syntaxHighlighting(primaryDarkHighlightStyle)]
