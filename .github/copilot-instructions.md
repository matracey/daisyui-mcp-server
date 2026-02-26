# Copilot Instructions

## Build, Test & Lint

```bash
npm run build          # TypeScript compilation (tsc)
npm test               # Run all tests (vitest)
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
npm run lint           # ESLint on src/ and scripts/
npm run format:check   # Prettier check
npm run format         # Prettier auto-fix
npm run validate       # Run all CI checks (format, lint, build, test:coverage)
```

**Important:** Always run `npm run validate` after making changes to ensure nothing is broken. This runs the same checks as CI.

Run a single test file:

```bash
npx vitest run src/__tests__/server.test.ts
```

Run a single test by name:

```bash
npx vitest run -t "should return a greeting"
```

## Architecture

This is an MCP (Model Context Protocol) server that exposes tools for AI assistants. It communicates over **stdio transport**.

### Key Source Files

- `src/index.ts` — Entry point. Creates the MCP server and connects it via `StdioServerTransport`.
- `src/server.ts` — Registers all MCP tools with Zod schemas. This is where tool definitions and handlers live.

### Adding a New Tool

Edit `src/server.ts` and register a new tool using `server.tool()`. See the existing `hello` tool for the pattern.

## Conventions

- **Formatting**: Prettier with no semicolons, single quotes, trailing commas (es5), 100 char print width.
- **Commit messages**: Follow [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **Test coverage**: Maintain above 90%. Tests live in `src/__tests__/` mirroring source file names.
- **Integration tests**: Use `InMemoryTransport.createLinkedPair()` from the MCP SDK to test server tools end-to-end without stdio.
- **ESM**: The project uses ES modules (`"type": "module"` in package.json). Use `.js` extensions in TypeScript import paths.
- **Tool responses**: All MCP tool handlers return `{ content: [{ type: 'text' as const, text: string }] }`. Error responses add `isError: true`.
