# SnapKit Development Guide

## MANDATORY: Read Blueprints Before Implementation

**This is a strict rule that MUST be followed before ANY implementation task.**

Before creating or modifying components, features, or any code:

1. **ALWAYS** use `search_blueprint` from `snapkit-blueprint-mcp` to read the relevant development guidelines
2. Search for the specific domain you're working on (e.g., "component development", "API integration", "routing")
3. Follow ALL guidelines found, including post-implementation steps like updating registries

**Example queries:**

```
search_blueprint("component development guidelines")
search_blueprint("API integration patterns")
search_blueprint("creating new feature components")
```

Skipping this step leads to incomplete implementations and missing required steps (like registry updates).

---

## MCP Servers

This project uses multiple MCP servers for different purposes.
No matter what language was used in the prompt, it's important that you **always** use english to query the MCP servers!

| MCP Server               | Purpose                            | When to Use                                                                    |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| **svelte**               | Svelte 5 & SvelteKit documentation | Language features, runes, routing, SvelteKit APIs                              |
| **shadcn-svelte**        | shadcn-svelte component docs       | Using/adding base UI components in `src/lib/components/ui/`                    |
| **shadcn-svelte-extras** | Extra components via jsrepo        | Advanced components not in core shadcn-svelte (Chat, Code, Emoji Picker, etc.) |
| **svelte-components**    | Feature component discovery        | Finding/creating components in `src/lib/components/features/`                  |
| **Moddo API**            | Backend API discovery              | Finding API endpoints and TypeScript types for data fetching                   |

---

## svelte MCP

Use for Svelte 5 and SvelteKit documentation.

**Tools:**

- **list-sections**: Discover available documentation sections. Use this FIRST when asked about Svelte/SvelteKit topics.
- **get-documentation**: Retrieve full documentation content. After `list-sections`, fetch ALL relevant sections based on use_cases.
- **svelte-autofixer**: Analyze Svelte code for issues. MUST use this whenever writing Svelte code - keep calling until no issues remain.
- **playground-link**: Generate a Svelte Playground link. Only use after user confirmation and NEVER if code was written to files.

---

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

---

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

---

## svelte-components MCP

Use for **feature components** in `src/lib/components/features/`. This is where all custom project components live.

**MANDATORY**: Before creating ANY new feature component, you MUST use this MCP to check for existing components. See `search_blueprint("component development guidelines")` for the complete workflow.

**Tools:**

- **search_components**: Semantic search using natural language queries (e.g., "customer selector dropdown", "order table with filters"). Returns results ranked by relevance score.
- **list_components**: List all feature components, optionally filtered by category
- **get_component**: Get detailed component info including props, types, and usage examples

**Required workflow before creating components:**

1. `search_components({ query: "description of what you need" })` - Semantic search for similar components
2. `list_components({ category: "domain" })` - Browse all components in the relevant category
3. Only create a new component if no suitable one exists

---

## Moddo MCP

Use for **backend API discovery** when creating components that fetch or interact with data.

**Tools:**

- **search_api**: Search for API operations by natural language query. Returns matching endpoints with method, path, and TypeScript types.

**Parameters:**

- `query`: Natural language description (e.g., "list orders", "create customer", "update product")
- `namespace` (optional): Filter by API namespace (e.g., "sales-api", "supply-api", "product-api")
- `include_schemas`: Set to `true` to get raw JSON schemas in addition to TypeScript types

**Workflow for components that fetch data:**

1. **Search for relevant endpoints**: Use `search_api` to find endpoints that match your data needs
2. **Review the response types**: Use the returned TypeScript type definitions to type your component's data
3. **Implement the fetch call**: Use `apiRequest` from `$lib/utils/request.ts` (NOT raw `fetch`)
4. **Handle loading and error states**: Always account for async data fetching

## snapkit-blueprint-mcp

**Primary reference for SnapKit implementation rules and patterns.**

Use the `search_blueprint` tool to find:

- Component development guidelines
- API integration patterns
- Routing and navigation rules
- MCP server usage documentation

**Always search the blueprint first** when you need guidance on SnapKit conventions.

```
search_blueprint("MCP servers overview")
```
