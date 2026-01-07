You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## Component Development Guidelines

### Using arke-components MCP Server

When creating new components, you MUST use the **arke-components MCP server** to discover and utilize existing UI components. This ensures consistency and proper usage of the component library.

Available tools from arke-components:
- **list_components**: List all available components, optionally filtered by category
- **get_component**: Get detailed information about a specific component including props, types, and usage examples
- **search_components**: Search components by props, types, or functionality

**Workflow for creating new components:**
1. First, call `list_components` to see available UI components
2. Use `get_component` to understand the props and usage of components you need
3. Use `search_components` if looking for specific functionality

### Component File Location

All newly created feature components MUST be placed in:
```
src/lib/components/features/
```

Organize by feature/domain, for example:
- `src/lib/components/features/orders/` - Order-related components
- `src/lib/components/features/customers/` - Customer-related components
- `src/lib/components/features/products/` - Product-related components

**Note:** Base UI components live in `src/lib/components/ui/` and should NOT be modified directly. Always build feature components by composing the existing UI components.
