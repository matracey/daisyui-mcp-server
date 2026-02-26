import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const SERVER_NAME = 'my-mcp-server'
const SERVER_VERSION = '0.1.0'

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  })

  // Example tool — replace with your own
  server.tool(
    'hello',
    'A simple greeting tool that returns a hello message.',
    {
      name: z.string().describe('Name to greet'),
    },
    async ({ name }) => {
      return {
        content: [{ type: 'text' as const, text: `Hello, ${name}!` }],
      }
    }
  )

  return server
}
