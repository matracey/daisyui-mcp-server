import type { CodeExample, DaisyUIComponent, SearchResult } from './types.js'

export function formatComponentSummary(component: DaisyUIComponent): string {
  const lines = [
    `## ${component.name}`,
    '',
    `**Category:** ${component.category}`,
    `**Description:** ${component.description}`,
    `**Docs:** ${component.docsUrl}`,
    `**Props:** ${component.props.length}`,
  ]

  if (component.subComponents && component.subComponents.length > 0) {
    lines.push(`**Sub-components:** ${component.subComponents.join(', ')}`)
  }

  return lines.join('\n')
}

export function formatComponentFull(component: DaisyUIComponent): string {
  const lines = [
    `# ${component.name}`,
    '',
    component.description,
    '',
    `- **Category:** ${component.category}`,
    `- **Docs:** ${component.docsUrl}`,
    `- **Source:** ${component.sourceUrl}`,
  ]

  if (component.subComponents && component.subComponents.length > 0) {
    lines.push(`- **Sub-components:** ${component.subComponents.join(', ')}`)
  }

  // Props table
  if (component.props.length > 0) {
    lines.push('', '## Props', '')
    lines.push('| Name | Type | Required | Default | Description |')
    lines.push('|------|------|----------|---------|-------------|')
    for (const prop of component.props) {
      const required = prop.required ? '✅' : '❌'
      const defaultVal = prop.default ?? '-'
      lines.push(
        `| ${prop.name} | \`${prop.type}\` | ${required} | ${defaultVal} | ${prop.description} |`
      )
    }
  }

  // CSS classes
  if (component.cssClasses && component.cssClasses.length > 0) {
    lines.push('', '## CSS Classes', '')
    for (const cls of component.cssClasses) {
      lines.push(`- \`${cls}\``)
    }
  }

  // Examples
  if (component.examples.length > 0) {
    lines.push('', '## Examples', '')
    lines.push(formatCodeExamples(component.examples, component.name))
  }

  return lines.join('\n')
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No components found matching your query.'
  }

  const lines = [`Found ${results.length} component(s):`, '']

  for (const result of results) {
    lines.push(`### ${result.component.name} (score: ${result.score})`)
    lines.push('')
    lines.push(`**Category:** ${result.component.category}`)
    lines.push(`**Description:** ${result.component.description}`)
    lines.push(`**Matched on:** ${result.matchedOn.join(', ')}`)
    lines.push(`**Docs:** ${result.component.docsUrl}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatComponentList(components: DaisyUIComponent[]): string {
  if (components.length === 0) {
    return 'No components found.'
  }

  const lines = [`${components.length} component(s):`, '']

  for (const component of components) {
    lines.push(`- **${component.name}** (${component.category}) — ${component.description}`)
  }

  return lines.join('\n')
}

export function formatCodeExamples(examples: CodeExample[], componentName: string): string {
  if (examples.length === 0) {
    return `No code examples available for ${componentName}.`
  }

  const lines: string[] = []

  for (const example of examples) {
    lines.push(`### ${example.title}`)
    if (example.description) {
      lines.push('', example.description)
    }
    lines.push('', `\`\`\`${example.language}`, example.code, '```', '')
  }

  return lines.join('\n')
}
