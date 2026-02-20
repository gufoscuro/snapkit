# MCP Servers Overview

This project uses multiple MCP servers. Use the appropriate one based on your task.

## Quick Reference

| MCP Server               | Purpose                            | When to Use                                                                    |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| **svelte**               | Svelte 5 & SvelteKit documentation | Language features, runes, routing, SvelteKit APIs                              |
| **shadcn-svelte**        | shadcn-svelte component docs       | Using/adding base UI components in `src/lib/components/ui/`                    |
| **shadcn-svelte-extras** | Extra components via jsrepo        | Advanced components not in core shadcn-svelte (Chat, Code, Emoji Picker, etc.) |
| **svelte-components**    | Feature component discovery        | Finding/creating components in `src/lib/components/features/`                  |
| **moddo-api**            | Backend API discovery              | Finding API endpoints and TypeScript types for data fetching                   |
| **moddo-legal-entity-config** | Legal entity field configuration | Managing custom fields and field visibility per tenant/legal entity        |

## svelte MCP

Use for Svelte 5 and SvelteKit documentation.

**Tools:**

- **list-sections**: Discover available documentation sections. Use this FIRST when asked about Svelte/SvelteKit topics.
- **get-documentation**: Retrieve full documentation content. After `list-sections`, fetch ALL relevant sections based on use_cases.
- **svelte-autofixer**: Analyze Svelte code for issues. MUST use this whenever writing Svelte code - keep calling until no issues remain.
- **playground-link**: Generate a Svelte Playground link. Only use after user confirmation and NEVER if code was written to files.

## shadcn-svelte MCP

Use for **base UI components** in `src/lib/components/ui/`. These components should NOT be modified directly.

**Tools:**

- **shadcn-svelte-list**: List all available shadcn-svelte components, blocks, charts, and docs
- **shadcn-svelte-get**: Get detailed component documentation, installation commands, and code examples
- **shadcn-svelte-search**: Fuzzy search across shadcn-svelte components and docs
- **shadcn-svelte-icons**: Browse and search Lucide Svelte icons
- **bits-ui-get**: Access Bits UI component API documentation (shadcn-svelte is built on Bits UI)

**When to use:**

1. Understanding props/usage of base UI components (Button, Dialog, Card, etc.)
2. Adding a new shadcn component to the project → use `shadcn-svelte-get` for installation instructions
3. Finding icons → use `shadcn-svelte-icons`

## shadcn-svelte-extras MCP (jsrepo)

Use for **extra components** not included in core shadcn-svelte. These are community components from [shadcn-svelte-extras](https://www.shadcn-svelte-extras.com/).

**Available components include:** Avatar Group, Chat, Code Block, Emoji Picker, Field Set, File Tree, Tags Input, Terminal, and more.

**Tools:**

- **search**: Search for available extra components
- **get_block**: Get component documentation, code, and installation commands
- **list_blocks**: List all available extra components

**When to use:**

1. Need a component not available in core shadcn-svelte
2. Looking for advanced/specialized UI components (chat interfaces, code blocks, terminals, etc.)
3. Adding new extras to the project → use `npx jsrepo add @ieedan/shadcn-svelte-extras/<component>`

## svelte-components MCP

Use for **feature components** in `src/lib/components/features/`. This is where all custom project components live.

**Tools:**

- **list_components**: List all available feature components, optionally filtered by category
- **get_component**: Get detailed information about a specific component including props, types, and usage examples
- **search_components**: Search components by props, types, or functionality

**When to use:**

1. Discovering existing feature components before creating new ones
2. Understanding props and usage of custom project components
3. Finding components with specific functionality

## moddo-api MCP

Use for **backend API discovery** when creating components that fetch or interact with data.

**Tools:**

- **get-api-documentation**: Returns live API documentation generated from the actual codebase. Includes endpoints grouped by feature with HTTP method, URL, request/response schemas, and required permissions.

**Parameters:**

- `group` (optional): Filter by endpoint group name (e.g., `"Customers"`, `"Legal entities"`)

**Workflow for components that fetch data:**

1. **Get endpoint docs**: Call `get-api-documentation` (optionally filtered by group) to find endpoints and TypeScript types
2. **Add types to api-types.ts**: Centralize all API types in `$lib/types/api-types.ts`
3. **Implement the request**: Use `apiRequest` from `$lib/utils/request.ts` (NOT raw `fetch`)
4. **Handle loading and error states**: Always account for async data fetching

## moddo-legal-entity-config MCP

Use for **managing legal entity field configuration** — custom fields and field visibility per tenant.

**Tools:**

- **list-tenants**: List all tenants with their ID, name, and vanity slug
- **get-legal-entity-config**: Returns current field visibility settings and custom fields for a legal entity
- **get-legal-entity-config-schema**: Returns the configuration schema (available fields and custom field types)
- **add-custom-field**: Add a custom field to a resource (text, number, boolean, date, select, textarea)
- **remove-custom-field**: Remove a custom field from a resource
- **set-field-visibility**: Show or hide an optional field
- **set-field-required**: Mark an optional field as required or optional

**Workflow:**

1. Use `list-tenants` to find the tenant vanity slug
2. Use `get-legal-entity-config` to see the current configuration before making changes
3. Confirm changes with the user before applying them
