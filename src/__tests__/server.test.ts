import { describe, it, expect, beforeAll } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../server.js'
import { SERVER_NAME, SERVER_VERSION } from '../constants.js'

describe('createServer', () => {
  it('should return an McpServer instance', () => {
    const server = createServer()
    expect(server).toBeDefined()
    expect(server.server).toBeDefined()
  })
})

describe('MCP Server integration', () => {
  let client: Client

  beforeAll(async () => {
    const server = createServer()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)
    client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(clientTransport)
  })

  it('should report correct server info', async () => {
    const info = client.getServerVersion()
    expect(info?.name).toBe(SERVER_NAME)
    expect(info?.version).toBe(SERVER_VERSION)
  })

  it('should list all 5 tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('daisyui_search')
    expect(toolNames).toContain('daisyui_get_component')
    expect(toolNames).toContain('daisyui_get_examples')
    expect(toolNames).toContain('daisyui_list_components')
    expect(toolNames).toContain('daisyui_get_theme_info')
    expect(result.tools).toHaveLength(5)
  })

  describe('daisyui_search', () => {
    it('should return results for a valid query', async () => {
      const result = await client.callTool({
        name: 'daisyui_search',
        arguments: { query: 'button' },
      })
      expect(result.content).toBeDefined()
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Button')
    })

    it('should return no results for nonsense query', async () => {
      const result = await client.callTool({
        name: 'daisyui_search',
        arguments: { query: 'xyznonexistent12345' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('No components found')
    })

    it('should filter by category', async () => {
      const result = await client.callTool({
        name: 'daisyui_search',
        arguments: { query: 'button', category: 'actions' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Button')
    })
  })

  describe('daisyui_get_component', () => {
    it('should return full component info', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_component',
        arguments: { name: 'Button' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('# Button')
      expect(text).toContain('Props')
    })

    it('should return error for unknown component', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_component',
        arguments: { name: 'NonExistent' },
      })
      expect(result.isError).toBe(true)
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('not found')
    })

    it('should suggest similar names for unknown component', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_component',
        arguments: { name: 'Btn' },
      })
      expect(result.isError).toBe(true)
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Did you mean')
    })
  })

  describe('daisyui_get_examples', () => {
    it('should return examples for a valid component', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_examples',
        arguments: { name: 'Button' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text.length).toBeGreaterThan(0)
    })

    it('should return error for unknown component', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_examples',
        arguments: { name: 'FakeComponent' },
      })
      expect(result.isError).toBe(true)
    })
  })

  describe('daisyui_list_components', () => {
    it('should list all components', async () => {
      const result = await client.callTool({
        name: 'daisyui_list_components',
        arguments: {},
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('component(s)')
      expect(text).toContain('Button')
    })

    it('should filter by category', async () => {
      const result = await client.callTool({
        name: 'daisyui_list_components',
        arguments: { category: 'feedback' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Alert')
      expect(text).not.toContain('Button')
    })
  })

  describe('daisyui_get_theme_info', () => {
    it('should return theme information', async () => {
      const result = await client.callTool({
        name: 'daisyui_get_theme_info',
        arguments: {},
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('daisyUI Themes')
      expect(text).toContain('light')
      expect(text).toContain('dark')
      expect(text).toContain('dracula')
      expect(text).toContain('data-theme')
      expect(text).toContain('<Theme')
    })
  })
})
