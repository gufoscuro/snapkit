# Snapkit Blueprint Content Structure

This directory contains the implementation rules and guidelines for Snapkit, organized by domain for optimal semantic search.

## Directory Structure

```
snapkit-content/
├── mcp-servers/          # MCP server documentation and usage
│   └── overview.md       # All available MCP servers and their tools
├── components/           # Component development guidelines
│   ├── development-guidelines.md  # Component creation and organization
│   ├── patterns.md                # Common component patterns (selectors, etc.)
│   ├── state-sharing.md           # Sibling component state sharing architecture
│   ├── forms.md                   # Form system with context API and validation
│   └── detail-record-form.md      # Create/update record form guide (useDetailRecord)
├── api/                  # API integration guidelines
│   └── integration-guidelines.md  # API types, requests, error handling
└── routing/              # Navigation and routing patterns
    └── navigation.md     # Route builder usage and best practices
```

## File Descriptions

### MCP Servers

- **overview.md**: Complete reference for all MCP servers (svelte, shadcn-svelte, arke, etc.) including their tools and when to use them

### Components

- **development-guidelines.md**: Rules for creating, organizing, and documenting components. Covers file locations, composition patterns, and the decision flow for new components
- **patterns.md**: Specific patterns like selector components, with implementation examples
- **state-sharing.md**: Architecture for sharing state between sibling components using contracts and bindings. Covers PageState, useProvides/useConsumes hooks, and database-driven configuration
- **forms.md**: Form system architecture with FormUtil, context API for field components, validation builder, and scaffolding examples
- **detail-record-form.md**: Step-by-step guide for creating create/update detail form components using `useDetailRecord`. Covers the full workflow: entity type discovery, contract, `useDetailRecord` setup, validation schemas, resource config, page state sharing, and the component checklist
- **resource-table.md**: Generic ResourceTable component for data tables. Covers declarative column configuration, 11 built-in renderers, utilities (createApiFetcher, createArchiveAction), table variants, and best practices

### API

- **integration-guidelines.md**: How to work with backend APIs, including type management, the apiRequest utility, error handling, and discovering endpoints with arke MCP

### Routing

- **navigation.md**: Using the route-builder utility for type-safe navigation, with examples and best practices

## Usage with MCP Server

These files are designed to be:

1. **Chunked** by heading sections during embedding generation
2. **Searched semantically** when Claude Code needs implementation guidance
3. **Updated independently** when rules change in specific domains

## Maintenance

When updating guidelines:

1. Edit the relevant markdown file
2. Run `npm run build:embeddings` to regenerate embeddings
3. Commit both the content and updated embeddings.json

## Semantic Search Examples

- "How do I create a new component?" → `components/development-guidelines.md`
- "How to fetch data from API?" → `api/integration-guidelines.md`
- "What MCP server should I use for icons?" → `mcp-servers/overview.md`
- "How to create links?" → `routing/navigation.md`
- "How to make a selector component?" → `components/patterns.md`
- "How do components share state?" → `components/state-sharing.md`
- "How to create a form?" → `components/forms.md`
- "How to validate form fields?" → `components/forms.md`
- "How to create a create/edit record form?" → `components/detail-record-form.md`
- "How to use useDetailRecord?" → `components/detail-record-form.md`
- "How to handle create and update in the same component?" → `components/detail-record-form.md`
- "How to create a data table?" → `components/resource-table.md`
- "How to use ResourceTable?" → `components/resource-table.md`
- "What renderers are available for tables?" → `components/resource-table.md`
