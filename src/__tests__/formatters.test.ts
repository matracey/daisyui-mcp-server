import { describe, it, expect } from 'vitest'
import {
  formatComponentSummary,
  formatComponentFull,
  formatSearchResults,
  formatComponentList,
  formatCodeExamples,
} from '../formatters.js'
import type { DaisyUIComponent, SearchResult, CodeExample } from '../types.js'

const mockComponent: DaisyUIComponent = {
  name: 'Button',
  slug: 'button',
  category: 'actions',
  description: 'A button component',
  docsUrl: 'https://daisyui.com/components/button/',
  sourceUrl: 'https://github.com/daisyui/react-daisyui/blob/main/src/Button/Button.tsx',
  props: [
    {
      name: 'color',
      type: 'ComponentColor',
      required: false,
      default: undefined,
      description: 'The color prop for Button',
    },
    {
      name: 'size',
      type: 'ComponentSize',
      required: false,
      default: "'md'",
      description: 'The size prop for Button',
    },
  ],
  examples: [
    {
      title: 'Basic Button',
      code: '<Button>Click me</Button>',
      language: 'tsx',
    },
  ],
  subComponents: ['ButtonGroup'],
  cssClasses: ['.btn', '.btn-primary'],
}

describe('formatComponentSummary', () => {
  it('should include name, category, description, and docs URL', () => {
    const result = formatComponentSummary(mockComponent)
    expect(result).toContain('Button')
    expect(result).toContain('actions')
    expect(result).toContain('A button component')
    expect(result).toContain('https://daisyui.com/components/button/')
  })

  it('should include prop count', () => {
    const result = formatComponentSummary(mockComponent)
    expect(result).toContain('2')
  })

  it('should include sub-components when present', () => {
    const result = formatComponentSummary(mockComponent)
    expect(result).toContain('ButtonGroup')
  })
})

describe('formatComponentFull', () => {
  it('should include props table headers', () => {
    const result = formatComponentFull(mockComponent)
    expect(result).toContain('| Name | Type | Required | Default | Description |')
  })

  it('should include all prop rows', () => {
    const result = formatComponentFull(mockComponent)
    expect(result).toContain('color')
    expect(result).toContain('size')
    expect(result).toContain('ComponentColor')
    expect(result).toContain('ComponentSize')
  })

  it('should include code examples', () => {
    const result = formatComponentFull(mockComponent)
    expect(result).toContain('Basic Button')
    expect(result).toContain('<Button>Click me</Button>')
  })

  it('should include CSS classes', () => {
    const result = formatComponentFull(mockComponent)
    expect(result).toContain('.btn')
    expect(result).toContain('.btn-primary')
  })

  it('should include sub-components', () => {
    const result = formatComponentFull(mockComponent)
    expect(result).toContain('ButtonGroup')
  })
})

describe('formatSearchResults', () => {
  it('should render multiple results with scores', () => {
    const results: SearchResult[] = [
      { component: mockComponent, score: 100, matchedOn: ['name'] },
      {
        component: { ...mockComponent, name: 'Modal', slug: 'modal' },
        score: 50,
        matchedOn: ['description'],
      },
    ]
    const output = formatSearchResults(results)
    expect(output).toContain('Button')
    expect(output).toContain('score: 100')
    expect(output).toContain('Modal')
    expect(output).toContain('score: 50')
    expect(output).toContain('Found 2 component(s)')
  })

  it('should return message for empty results', () => {
    const output = formatSearchResults([])
    expect(output).toContain('No components found')
  })
})

describe('formatComponentList', () => {
  it('should render all entries', () => {
    const components = [
      mockComponent,
      { ...mockComponent, name: 'Modal', slug: 'modal', category: 'actions' as const },
    ]
    const output = formatComponentList(components)
    expect(output).toContain('Button')
    expect(output).toContain('Modal')
    expect(output).toContain('2 component(s)')
  })

  it('should return message for empty list', () => {
    const output = formatComponentList([])
    expect(output).toContain('No components found')
  })
})

describe('formatCodeExamples', () => {
  it('should wrap code in fenced blocks', () => {
    const examples: CodeExample[] = [
      { title: 'Example 1', code: '<Button>Test</Button>', language: 'tsx' },
    ]
    const output = formatCodeExamples(examples, 'Button')
    expect(output).toContain('```tsx')
    expect(output).toContain('<Button>Test</Button>')
    expect(output).toContain('```')
  })

  it('should include example titles', () => {
    const examples: CodeExample[] = [
      { title: 'Primary Button', code: '<Button color="primary">OK</Button>', language: 'tsx' },
    ]
    const output = formatCodeExamples(examples, 'Button')
    expect(output).toContain('Primary Button')
  })

  it('should return message when no examples', () => {
    const output = formatCodeExamples([], 'Button')
    expect(output).toContain('No code examples available')
  })
})
