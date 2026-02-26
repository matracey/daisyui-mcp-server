# Copilot Instructions for daisyui-mcp-server

## Build, Test & Lint

```bash
npm run build          # TypeScript compilation (tsc)
npm test               # Run all tests (vitest)
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
npm run lint           # ESLint on src/ and scripts/
npm run format:check   # Prettier check
npm run format         # Prettier auto-fix
```

Run a single test file:

```bash
npx vitest run src/__tests__/search.test.ts
```

Run a single test by name:

```bash
npx vitest run -t "should find component by exact name"
```

## Architecture

This is an MCP (Model Context Protocol) server that exposes daisyUI React component documentation as tools for AI assistants. It communicates over **stdio transport**.

### Data Flow

```
generate-knowledge-base.ts → components.json → search/formatters → MCP tools (stdio)
```

1. **Knowledge base generation** (`npm run generate`): The `scripts/generate-knowledge-base.ts` script clones the `react-daisyui` repo, parses TypeScript source for props/types, scrapes `daisyui.com` for descriptions/examples, and outputs `src/data/generated/components.json`. This is a dev-time step — the generated JSON is committed to the repo.

2. **Runtime**: `src/index.ts` creates the MCP server and connects it via `StdioServerTransport`. The server (defined in `src/server.ts`) registers 5 tools that query the static knowledge base through `src/search.ts` and format results via `src/formatters.ts`.

### Key Source Files

- `src/server.ts` — Registers all MCP tools with Zod schemas. This is where tool definitions and handlers live.
- `src/search.ts` — Token-based search engine with weighted scoring (exact name: +100, name contains: +50, token match: +30, etc.).
- `src/formatters.ts` — Converts components and search results into markdown strings for tool responses.
- `src/types.ts` — Core type definitions (`DaisyUIComponent`, `ComponentProp`, `CodeExample`, `SearchResult`).
- `src/data/generated/` — Auto-generated from `npm run generate`. Do not edit manually.

### Adding a New Component

1. Add the component name and category to `CATEGORY_MAP` in `scripts/generate-knowledge-base.ts`
2. Run `npm run generate`
3. Run `npm test` to verify

## Conventions

- **Formatting**: Prettier with no semicolons, single quotes, trailing commas (es5), 100 char print width.
- **Commit messages**: Follow [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **Test coverage**: Maintain above 90%. Tests live in `src/__tests__/` mirroring source file names.
- **Integration tests**: Use `InMemoryTransport.createLinkedPair()` from the MCP SDK to test server tools end-to-end without stdio.
- **ESM**: The project uses ES modules (`"type": "module"` in package.json). Use `.js` extensions in TypeScript import paths.
- **Tool responses**: All MCP tool handlers return `{ content: [{ type: 'text' as const, text: string }] }`. Error responses add `isError: true`.
