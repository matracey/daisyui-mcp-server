import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as cheerio from 'cheerio'
import type {
  ComponentCategory,
  DaisyUIComponent,
  ComponentProp,
  CodeExample,
} from '../src/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CATEGORY_MAP: Record<string, ComponentCategory> = {
  Button: 'actions',
  Dropdown: 'actions',
  Modal: 'actions',
  Swap: 'actions',
  Theme: 'actions',
  Accordion: 'data-display',
  Avatar: 'data-display',
  Badge: 'data-display',
  Card: 'data-display',
  Carousel: 'data-display',
  ChatBubble: 'data-display',
  Collapse: 'data-display',
  Countdown: 'data-display',
  Diff: 'data-display',
  Kbd: 'data-display',
  Stats: 'data-display',
  Table: 'data-display',
  Timeline: 'data-display',
  Breadcrumbs: 'navigation',
  Dock: 'navigation',
  Link: 'navigation',
  Menu: 'navigation',
  Navbar: 'navigation',
  Pagination: 'navigation',
  Steps: 'navigation',
  Tabs: 'navigation',
  Alert: 'feedback',
  Loading: 'feedback',
  Progress: 'feedback',
  RadialProgress: 'feedback',
  Skeleton: 'feedback',
  Toast: 'feedback',
  Tooltip: 'feedback',
  Artboard: 'layout',
  Divider: 'layout',
  Drawer: 'layout',
  Footer: 'layout',
  Hero: 'layout',
  Indicator: 'layout',
  Join: 'layout',
  Mask: 'layout',
  Stack: 'layout',
  Checkbox: 'data-input',
  FileInput: 'data-input',
  Form: 'data-input',
  Input: 'data-input',
  Radio: 'data-input',
  Range: 'data-input',
  Rating: 'data-input',
  Select: 'data-input',
  Textarea: 'data-input',
  Toggle: 'data-input',
  BrowserMockup: 'mockup',
  CodeMockup: 'mockup',
  PhoneMockup: 'mockup',
  WindowMockup: 'mockup',
}

const SLUG_MAP: Record<string, string> = {
  ChatBubble: 'chat-bubble',
  BrowserMockup: 'browser-mockup',
  CodeMockup: 'code-mockup',
  PhoneMockup: 'phone-mockup',
  WindowMockup: 'window-mockup',
  FileInput: 'file-input',
  RadialProgress: 'radial-progress',
}

function toSlug(name: string): string {
  if (SLUG_MAP[name]) return SLUG_MAP[name]
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function log(msg: string): void {
  process.stderr.write(`[generate] ${msg}\n`)
}

function parsePropsFromSource(source: string, componentName: string): ComponentProp[] {
  const props: ComponentProp[] = []

  // Match exported type/interface for component props
  const typePatterns = [
    // export type ButtonProps = ... & { ... }
    new RegExp(
      `export\\s+type\\s+${componentName}Props[^=]*=\\s*[^{]*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`,
      's'
    ),
    // export interface ButtonProps { ... }
    new RegExp(
      `export\\s+interface\\s+${componentName}Props[^{]*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`,
      's'
    ),
  ]

  let propsBlock: string | null = null
  for (const pattern of typePatterns) {
    const match = source.match(pattern)
    if (match) {
      propsBlock = match[1]
      break
    }
  }

  if (!propsBlock) return props

  // Parse individual prop lines
  const propLineRegex = /(\w+)(\?)?:\s*([^;\n]+)/g
  let propMatch: RegExpExecArray | null
  while ((propMatch = propLineRegex.exec(propsBlock)) !== null) {
    const [, name, optional, type] = propMatch
    // Skip internal/inherited props
    if (['children', 'className', 'style', 'ref', 'key'].includes(name)) continue

    props.push({
      name,
      type: type
        .trim()
        .replace(/\/\/.*$/, '')
        .trim(),
      required: !optional,
      description: `The ${name} prop for ${componentName}`,
    })
  }

  return props
}

function parseDefaultsFromSource(source: string, props: ComponentProp[]): ComponentProp[] {
  // Look for destructured defaults in forwardRef or function component
  // e.g. { size = 'md', border = true, ...props }
  const destructureMatch = source.match(/\(\s*\{([^}]+)\}/s)
  if (!destructureMatch) return props

  const destructured = destructureMatch[1]
  for (const prop of props) {
    const defaultMatch = destructured.match(new RegExp(`${prop.name}\\s*=\\s*([^,}]+)`))
    if (defaultMatch) {
      prop.default = defaultMatch[1].trim()
    }
  }

  return props
}

function findSubComponents(dirPath: string, componentName: string): string[] {
  const subComponents: string[] = []
  try {
    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      if (
        file.endsWith('.tsx') &&
        file !== `${componentName}.tsx` &&
        file !== 'index.tsx' &&
        !file.includes('.stories.') &&
        !file.includes('.test.')
      ) {
        const subName = file.replace('.tsx', '')
        subComponents.push(subName)
      }
    }
  } catch {
    // ignore
  }
  return subComponents
}

async function scrapeDocsPage(
  slug: string
): Promise<{ description: string; cssClasses: string[]; examples: CodeExample[] }> {
  const url = `https://daisyui.com/components/${slug}/`
  try {
    log(`  Scraping ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      log(`  HTTP ${response.status} for ${url}, skipping scrape`)
      return { description: '', cssClasses: [], examples: [] }
    }
    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract description - usually the first paragraph after h1
    const description =
      $('meta[name="description"]').attr('content') || $('main p').first().text().trim() || ''

    // Extract CSS class names from the docs table
    const cssClasses: string[] = []
    $('table').each((_i, table) => {
      $(table)
        .find('tr')
        .each((_j, row) => {
          const firstCell = $(row).find('td').first().text().trim()
          if (firstCell && firstCell.startsWith('.')) {
            cssClasses.push(firstCell)
          } else if (firstCell && /^[a-z][\w-]*$/.test(firstCell)) {
            cssClasses.push(`.${firstCell}`)
          }
        })
    })

    // Extract code examples
    const examples: CodeExample[] = []
    $('pre code').each((i, el) => {
      const code = $(el).text().trim()
      if (code && code.length > 10) {
        // Look for a heading above the code block
        const section = $(el).closest('section, div, [class*="component"]')
        const heading = section.find('h2, h3').first().text().trim()

        examples.push({
          title: heading || `Example ${i + 1}`,
          code,
          language: code.includes('import') || code.includes('className') ? 'tsx' : 'html',
        })
      }
    })

    return { description, cssClasses, examples }
  } catch (error) {
    log(`  Error scraping ${url}: ${error}`)
    return { description: '', cssClasses: [], examples: [] }
  }
}

async function main() {
  const tmpDir = path.join('/tmp', 'react-daisyui-gen')
  const repoUrl = 'https://github.com/daisyui/react-daisyui.git'
  const outputDir = path.join(__dirname, '..', 'src', 'data', 'generated')

  // Clone or update the repo
  if (fs.existsSync(tmpDir)) {
    log('Updating existing clone...')
    try {
      execSync('git pull', { cwd: tmpDir, stdio: 'pipe' })
    } catch {
      log('Pull failed, re-cloning...')
      fs.rmSync(tmpDir, { recursive: true, force: true })
      execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: 'pipe' })
    }
  } else {
    log('Cloning react-daisyui...')
    execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: 'pipe' })
  }

  const srcDir = path.join(tmpDir, 'src')
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  const componentDirs = entries.filter((e) => e.isDirectory() && CATEGORY_MAP[e.name] !== undefined)

  log(`Found ${componentDirs.length} component directories`)

  const components: DaisyUIComponent[] = []

  for (const dir of componentDirs) {
    const componentName = dir.name
    const dirPath = path.join(srcDir, componentName)
    const mainFile = path.join(dirPath, `${componentName}.tsx`)

    log(`Processing ${componentName}...`)

    if (!fs.existsSync(mainFile)) {
      log(`  No main file found at ${mainFile}, skipping`)
      continue
    }

    const source = fs.readFileSync(mainFile, 'utf-8')
    const slug = toSlug(componentName)
    const category = CATEGORY_MAP[componentName]

    // Parse props from source
    let props = parsePropsFromSource(source, componentName)
    props = parseDefaultsFromSource(source, props)

    // Find sub-components
    const subComponents = findSubComponents(dirPath, componentName)

    // Scrape documentation page
    const docsData = await scrapeDocsPage(slug)

    const component: DaisyUIComponent = {
      name: componentName,
      slug,
      category,
      description: docsData.description || `${componentName} component from daisyUI`,
      docsUrl: `https://daisyui.com/components/${slug}/`,
      sourceUrl: `https://github.com/daisyui/react-daisyui/blob/main/src/${componentName}/${componentName}.tsx`,
      props,
      examples: docsData.examples,
      ...(subComponents.length > 0 && { subComponents }),
      ...(docsData.cssClasses.length > 0 && { cssClasses: docsData.cssClasses }),
    }

    components.push(component)
  }

  // Sort by name
  components.sort((a, b) => a.name.localeCompare(b.name))

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true })

  // Write components.json
  const jsonPath = path.join(outputDir, 'components.json')
  fs.writeFileSync(jsonPath, JSON.stringify(components, null, 2) + '\n')
  log(`Wrote ${components.length} components to ${jsonPath}`)

  // Write index.ts
  const indexPath = path.join(outputDir, 'index.ts')
  const indexContent = `import type { DaisyUIComponent } from '../../types.js'
import data from './components.json' with { type: 'json' }

export const components: DaisyUIComponent[] = data as DaisyUIComponent[]
`
  fs.writeFileSync(indexPath, indexContent)
  log(`Wrote ${indexPath}`)

  log('Done!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
