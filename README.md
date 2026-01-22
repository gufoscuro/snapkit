# Snapkit

Snapkit is an **AI-assisted customization framework** built on SvelteKit, TypeScript, and shadcn-svelte. It implements a declarative page architecture with dynamic component resolution and typed state sharing—designed from the ground up to be understood and extended by both humans and AI agents.

## Overview

Traditional web frameworks require developers to manually wire components, manage state, and navigate complex codebases. Snapkit takes a different approach: it exposes its architecture through **Model Context Protocol (MCP) servers**, creating a symbiotic relationship between the codebase and AI assistants.

### Core Principles

- **Declarative Page Configuration** — Define pages via metadata, not scattered route files
- **Composable Layouts** — Plug any component into any layout slot
- **Decoupled Component Communication** — Components share state without importing each other
- **Abstract Page References** — Reference pages by `$id`, not hardcoded URLs
- **AI-Native Development** — MCP servers provide structured context for AI-assisted building

## How It Works

### 1. Page Registry

Pages are defined declaratively in a central registry:

```typescript
{
  $id: 'order-detail',
  title: 'Order Detail',
  route: '/orders/:uuid',
  layout: { componentKey: 'layouts.Detail', enabled: true },
  snippets: {
    header: { componentKey: 'orders.DetailHeader', enabled: true },
    content: { componentKey: 'orders.ItemsTable', enabled: true }
  }
}
```

### 2. Component Registry

Components are auto-discovered from `src/lib/components/features/` and registered with typed keys:

```typescript
'orders.orderfilters.OrderFilters' → lazy import
'layouts.Detail' → lazy import
```

### 3. State Sharing via Contracts

Components communicate through typed contracts without direct imports:

```typescript
// Provider component
const filtersHandle = useProvides(FilterContract, 'filters')
filtersHandle.set({ search: 'query', status: ['pending'] })

// Consumer component (no direct dependency)
const filtersHandle = useConsumes(TableContract, 'filters')
const filters = filtersHandle.get()
```

## AI-Assisted Development

Snapkit's architecture is designed for AI comprehension. Multiple MCP servers transform the codebase into a queryable knowledge base.

### The Blueprints System

The **snapkit-blueprint-mcp** server extracts structured knowledge from the `.blueprints/` folder, providing AI agents with:

- Implementation rules and patterns
- Component development guidelines
- API integration conventions
- Architecture decisions and rationale

This creates a **living documentation system** where architectural knowledge is always in sync with the codebase and immediately accessible to AI assistants.

### MCP Server Ecosystem

| Server | Purpose |
|--------|---------|
| **snapkit-blueprint** | Architectural guidelines and implementation rules from `.blueprints/` |
| **svelte** | Svelte 5 & SvelteKit documentation, syntax validation, auto-fixing |
| **svelte-components** | Live component registry discovery and contract exploration |
| **shadcn-svelte** | Base UI component library documentation |
| **arke** | Backend API exploration and type generation |

### AI Development Workflow

```
Developer: "Create a component to display material stock levels"

AI (via MCP servers):
  → Queries snapkit-blueprint for component patterns
  → Discovers /api/materials/:id/stock endpoint via arke
  → Checks existing components via svelte-components
  → Generates component following Snapkit conventions
  → Validates with svelte-autofixer
```

## Multi-Tenant Architecture

Snapkit supports **configuration-driven customization** where different users receive tailored experiences without separate codebases:

```
┌─────────────────────────────────────┐
│   Customer Configuration Layer      │  ← Per-tenant page config
├─────────────────────────────────────┤
│   Base Page Registry                │  ← Default pages
├─────────────────────────────────────┤
│   Component Registry                │  ← Shared component pool
├─────────────────────────────────────┤
│   shadcn-svelte Base UI             │  ← Foundational primitives
└─────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

### Generate Component Registry

After creating new components:

```sh
npm run generate:components-registry
```

### Build

```sh
npm run build
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # Base UI (shadcn-svelte)
│   │   ├── features/        # Domain components (auto-discovered)
│   │   └── runtime/         # SnippetResolver, bindings
│   ├── contexts/
│   │   └── page-state/      # State sharing system
│   └── utils/
│       ├── page-registry.ts # Page definitions
│       └── route-builder.ts # URL generation
├── generated/
│   └── components-registry.ts
└── routes/
    └── [...path]/           # Catch-all route handler
```

## Key Technologies

- **SvelteKit** — Full-stack framework
- **Svelte 5** — Runes-based reactivity
- **TypeBox** — Runtime validation with TypeScript inference
- **shadcn-svelte** — UI component library
- **path-to-regexp** — Route pattern matching

## Learn More

- [Snapkit Architecture](docs/SNAPKIT.md) — Full technical documentation
- [Svelte 5 Documentation](https://svelte.dev/docs)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
