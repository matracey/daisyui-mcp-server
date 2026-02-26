import type { ComponentCategory, DaisyUIComponent, SearchResult } from './types.js'
import { components } from './data/generated/index.js'
import { MAX_SEARCH_RESULTS } from './constants.js'

export function searchComponents(
  query: string,
  options?: { category?: ComponentCategory; limit?: number }
): SearchResult[] {
  const limit = options?.limit ?? 5
  const categoryFilter = options?.category

  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return []

  const tokens = queryLower.split(/\s+/).filter((t) => t.length > 0)

  let filtered = components
  if (categoryFilter) {
    filtered = filtered.filter((c) => c.category === categoryFilter)
  }

  const results: SearchResult[] = []

  for (const component of filtered) {
    let score = 0
    const matchedOn = new Set<'name' | 'description' | 'props' | 'examples' | 'css'>()
    const nameLower = component.name.toLowerCase()

    // Exact name match
    if (nameLower === queryLower) {
      score += 100
      matchedOn.add('name')
    }
    // Name contains full query
    else if (nameLower.includes(queryLower)) {
      score += 50
      matchedOn.add('name')
    }

    // Name contains any token
    for (const token of tokens) {
      if (nameLower.includes(token) && !matchedOn.has('name')) {
        score += 30
        matchedOn.add('name')
      }
    }

    // Description matching
    const descLower = component.description.toLowerCase()
    for (const token of tokens) {
      if (descLower.includes(token)) {
        score += 15
        matchedOn.add('description')
        break
      }
    }

    // Prop name matching
    for (const prop of component.props) {
      const propLower = prop.name.toLowerCase()
      for (const token of tokens) {
        if (propLower === token || propLower.includes(token)) {
          score += 10
          matchedOn.add('props')
          break
        }
      }
      if (matchedOn.has('props')) break
    }

    // CSS class matching
    if (component.cssClasses) {
      for (const cls of component.cssClasses) {
        const clsLower = cls.toLowerCase()
        for (const token of tokens) {
          if (clsLower.includes(token)) {
            score += 10
            matchedOn.add('css')
            break
          }
        }
        if (matchedOn.has('css')) break
      }
    }

    // Example matching
    for (const example of component.examples) {
      const titleLower = example.title.toLowerCase()
      const codeLower = example.code.toLowerCase()
      for (const token of tokens) {
        if (titleLower.includes(token) || codeLower.includes(token)) {
          score += 5
          matchedOn.add('examples')
          break
        }
      }
      if (matchedOn.has('examples')) break
    }

    if (score > 0) {
      results.push({
        component,
        score,
        matchedOn: Array.from(matchedOn),
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, Math.min(limit, MAX_SEARCH_RESULTS))
}

export function findComponent(name: string): DaisyUIComponent | undefined {
  const nameLower = name.toLowerCase()
  return components.find((c) => c.name.toLowerCase() === nameLower)
}

export function listComponents(category?: ComponentCategory): DaisyUIComponent[] {
  if (category) {
    return components.filter((c) => c.category === category)
  }
  return [...components]
}
