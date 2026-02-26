# 🌼 daisyui-mcp-server

> MCP server for daisyUI React components — search docs, props, and code examples from any AI coding assistant

[![npm version](https://img.shields.io/npm/v/daisyui-mcp-server)](https://www.npmjs.com/package/daisyui-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/matracey/daisyui-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/matracey/daisyui-mcp-server/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

## Overview

**daisyui-mcp-server** is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives AI coding assistants instant access to [daisyUI](https://daisyui.com) React component documentation. It enables tools like GitHub Copilot, Claude, Cursor, and others to search components, look up props, and retrieve code examples — all without leaving your editor.

[daisyUI](https://daisyui.com) is the most popular component library for Tailwind CSS, providing beautiful, accessible UI components. This MCP server is built around the [react-daisyui](https://github.com/daisyui/react-daisyui) bindings.

```
┌─────────────────┐     ┌────────────┐     ┌─────────────────────┐     ┌────────────────┐
│  AI Assistant    │────▶│ MCP Client │────▶│ daisyui-mcp-server  │────▶│ Knowledge Base │
│ (Copilot/Claude) │◀────│            │◀────│                     │◀────│ (56 components)│
└─────────────────┘     └────────────┘     └─────────────────────┘     └────────────────┘
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `daisyui_search` | Search component documentation | `query` (required), `category`, `limit` |
| `daisyui_get_component` | Get full component docs with props & examples | `name` (required) |
| `daisyui_get_examples` | Get code examples for a component | `name` (required) |
| `daisyui_list_components` | List all components, optionally by category | `category` |
| `daisyui_get_theme_info` | Get daisyUI theme configuration guide | — |

### Categories

Components are organized into: `actions`, `data-display`, `navigation`, `feedback`, `layout`, `data-input`, `mockup`

## Quick Start

```bash
npx daisyui-mcp-server
```

## Configuration

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "daisyui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "daisyui": {
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "daisyui": {
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "daisyui": {
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

### Amazon Q Developer CLI

Add to `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "daisyui": {
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

### Zed

Add to `settings.json`:

```json
{
  "context_servers": {
    "daisyui": {
      "command": {
        "path": "npx",
        "args": ["-y", "daisyui-mcp-server"]
      }
    }
  }
}
```

### JetBrains IDEs (IntelliJ, WebStorm, etc.)

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **Add**
3. Set command to `npx` with arguments `["-y", "daisyui-mcp-server"]`

### Cline

Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "daisyui": {
      "command": "npx",
      "args": ["-y", "daisyui-mcp-server"]
    }
  }
}
```

## Development

### Prerequisites

- Node.js >= 18
- npm

### Setup

```bash
git clone https://github.com/matracey/daisyui-mcp-server.git
cd daisyui-mcp-server
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Run Locally

```bash
npm run dev    # Watch mode with tsx
npm start      # Run built version
```

### Regenerate Knowledge Base

The knowledge base is generated from the [react-daisyui](https://github.com/daisyui/react-daisyui) source code and daisyUI documentation:

```bash
npm run generate
```

This clones the react-daisyui repo, parses component source files for props and types, scrapes daisyui.com for descriptions and examples, and outputs the result to `src/data/generated/`.

### Adding New Components

1. Add the component name and category to the `CATEGORY_MAP` in `scripts/generate-knowledge-base.ts`
2. Run `npm run generate` to regenerate the knowledge base
3. Run `npm test` to verify the new component is valid

## How It Works

### Architecture

The server uses the [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) to expose 5 tools over stdio transport. When an AI assistant connects, it can call these tools to query a pre-built knowledge base of 56 daisyUI React components.

### Knowledge Base Generation

The `scripts/generate-knowledge-base.ts` script:

1. Clones the `react-daisyui` repository
2. Parses each component's TypeScript source to extract props, types, and defaults
3. Scrapes `daisyui.com/components/<name>/` for descriptions, CSS classes, and examples
4. Outputs a structured JSON file (`src/data/generated/components.json`)

### Search Scoring

The search engine uses a token-based scoring system:

| Match Type | Score |
|-----------|-------|
| Exact name match | +100 |
| Name contains query | +50 |
| Name contains token | +30 |
| Description contains token | +15 |
| Prop name matches token | +10 |
| CSS class matches token | +10 |
| Example matches token | +5 |

Results are sorted by score and returned up to the specified limit (default 5, max 10).

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- [Open an issue](https://github.com/matracey/daisyui-mcp-server/issues) for bugs or feature requests
- Submit a pull request with your changes

## License

MIT — see [LICENSE](LICENSE) for details.
