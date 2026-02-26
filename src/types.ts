export interface DaisyUIComponent {
  name: string
  slug: string
  category: ComponentCategory
  description: string
  docsUrl: string
  sourceUrl: string
  props: ComponentProp[]
  examples: CodeExample[]
  subComponents?: string[]
  cssClasses?: string[]
}

export type ComponentCategory =
  | 'actions'
  | 'data-display'
  | 'navigation'
  | 'feedback'
  | 'layout'
  | 'data-input'
  | 'mockup'

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export interface CodeExample {
  title: string
  description?: string
  code: string
  language: 'tsx' | 'jsx' | 'html'
}

export interface SearchResult {
  component: DaisyUIComponent
  score: number
  matchedOn: ('name' | 'description' | 'props' | 'examples' | 'css')[]
}
