# MCP Server Template

> A starter template for building [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) servers in TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

## What You Get

- A working MCP server with an example `hello` tool
- TypeScript with ES modules
- Testing with Vitest
- Linting (ESLint) and formatting (Prettier)
- CI pipeline and npm publishing workflow
- VS Code, Claude Desktop, and Cursor configuration examples

```text
┌─────────────────┐     ┌────────────┐     ┌──────────────────┐
│  AI Assistant    │────▶│ MCP Client │────▶│ Your MCP Server  │
│ (Copilot/Claude) │◀────│            │◀────│                  │
└─────────────────┘     └────────────┘     └──────────────────┘
```

## Quick Start

### 1. Create your project

```bash
npx -y degit matracey/mcp-server-template my-mcp-server
cd my-mcp-server
npm install
```

### 2. Customize

- Update `name`, `description`, and `bin` in `package.json`
- Replace the example `hello` tool in `src/server.ts` with your own tools
- Update the server name/version in `src/server.ts`

### 3. Build and test

```bash
npm run build
npm test
```

### 4. Run locally

```bash
npm run dev    # Run with auto-restart on file changes
npm start      # Run the built version
```

## Adding Tools

Edit `src/server.ts` and register a new tool:

```ts
server.tool(
  'my_tool',
  'Description of what this tool does.',
  {
    param: z.string().describe('Parameter description'),
  },
  async ({ param }) => {
    return {
      content: [{ type: 'text' as const, text: `Result: ${param}` }],
    }
  }
)
```

The template includes an example `hello` tool to demonstrate the pattern.

## Client Configuration

Once published (or running locally), configure your AI client:

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

> Replace `my-mcp-server` with your published package name.

## Project Structure

```text
src/
├── index.ts          # Entry point — stdio transport setup
├── server.ts         # MCP server & tool definitions
├── __tests__/        # Tests (vitest)
└── data/             # Static data (if needed)
scripts/              # Dev-time scripts
```

## Development

### Prerequisites

- Node.js >= 20
- npm

### Commands

```bash
npm run build           # TypeScript compilation
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
npm run dev             # Run with auto-restart on changes
npm run validate        # Run all CI checks (format, lint, build, test)
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
