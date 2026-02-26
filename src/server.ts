import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { SERVER_NAME, SERVER_VERSION, CATEGORIES } from './constants.js'
import { searchComponents, findComponent, listComponents } from './search.js'
import {
  formatSearchResults,
  formatComponentFull,
  formatComponentList,
  formatCodeExamples,
} from './formatters.js'
import type { ComponentCategory } from './types.js'

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  })

  // Tool 1: daisyui_search
  server.tool(
    'daisyui_search',
    'Search daisyUI React component documentation. Returns matching components with descriptions, props, and documentation links.',
    {
      query: z.string().describe('Search query'),
      category: z
        .enum(CATEGORIES)
        .optional()
        .describe('Filter by component category'),
      limit: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .default(5)
        .describe('Maximum number of results (1-10, default 5)'),
    },
    async ({ query, category, limit }) => {
      const results = searchComponents(query, { category, limit })
      return {
        content: [{ type: 'text' as const, text: formatSearchResults(results) }],
      }
    }
  )

  // Tool 2: daisyui_get_component
  server.tool(
    'daisyui_get_component',
    'Get full documentation for a specific daisyUI React component including all props, types, defaults, and usage examples.',
    {
      name: z.string().describe('Component name (e.g. "Button", "Modal")'),
    },
    async ({ name }) => {
      const component = findComponent(name)
      if (!component) {
        // Suggest similar names
        const results = searchComponents(name, { limit: 3 })
        const suggestions =
          results.length > 0
            ? `\n\nDid you mean: ${results.map((r) => r.component.name).join(', ')}?`
            : ''
        return {
          content: [
            {
              type: 'text' as const,
              text: `Component "${name}" not found.${suggestions}`,
            },
          ],
          isError: true,
        }
      }
      return {
        content: [{ type: 'text' as const, text: formatComponentFull(component) }],
      }
    }
  )

  // Tool 3: daisyui_get_examples
  server.tool(
    'daisyui_get_examples',
    'Get code examples for a specific daisyUI React component. Returns TSX/JSX snippets showing common usage patterns.',
    {
      name: z.string().describe('Component name'),
    },
    async ({ name }) => {
      const component = findComponent(name)
      if (!component) {
        return {
          content: [
            { type: 'text' as const, text: `Component "${name}" not found.` },
          ],
          isError: true,
        }
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: formatCodeExamples(component.examples, component.name),
          },
        ],
      }
    }
  )

  // Tool 4: daisyui_list_components
  server.tool(
    'daisyui_list_components',
    'List all available daisyUI React components, optionally filtered by category.',
    {
      category: z
        .enum(CATEGORIES)
        .optional()
        .describe('Filter by component category'),
    },
    async ({ category }) => {
      const components = listComponents(category as ComponentCategory | undefined)
      return {
        content: [{ type: 'text' as const, text: formatComponentList(components) }],
      }
    }
  )

  // Tool 5: daisyui_get_theme_info
  server.tool(
    'daisyui_get_theme_info',
    'Get information about daisyUI themes, including available theme names and how to configure them in React.',
    {},
    async () => {
      const themeInfo = `# daisyUI Themes

## Available Themes

daisyUI comes with the following built-in themes:

light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord, sunset

## Using Themes in React

### With the \`<Theme>\` component (react-daisyui)

\`\`\`tsx
import { Theme } from 'react-daisyui'

function App() {
  return (
    <Theme dataTheme="dark">
      <div className="p-4">
        <h1>My App</h1>
      </div>
    </Theme>
  )
}
\`\`\`

### With the \`data-theme\` attribute

\`\`\`tsx
// Apply to the entire app
<html data-theme="cupcake">
  ...
</html>

// Apply to a specific section
<div data-theme="dark">
  <button className="btn btn-primary">Dark themed button</button>
</div>
\`\`\`

### Configuring Themes in tailwind.config.js

\`\`\`js
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'corporate'],
    // or use all themes:
    // themes: true,
  },
}
\`\`\`

### Theme Switcher Example

\`\`\`tsx
import { Theme } from 'react-daisyui'
import { useState } from 'react'

function ThemeSwitcher() {
  const [theme, setTheme] = useState('light')

  return (
    <Theme dataTheme={theme}>
      <select
        className="select select-bordered"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="cupcake">Cupcake</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="dracula">Dracula</option>
      </select>
    </Theme>
  )
}
\`\`\`

For more information, see the [daisyUI themes documentation](https://daisyui.com/docs/themes/).
`
      return {
        content: [{ type: 'text' as const, text: themeInfo }],
      }
    }
  )

  return server
}
