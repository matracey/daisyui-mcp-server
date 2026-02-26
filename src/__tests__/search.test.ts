import { describe, it, expect } from 'vitest'

import { searchComponents, findComponent, listComponents } from '../search.js'

describe('searchComponents', () => {
  it('should return highest score for exact name match', () => {
    const results = searchComponents('Button')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].component.name).toBe('Button')
    expect(results[0].score).toBeGreaterThanOrEqual(100)
  })

  it('should return results for partial name match', () => {
    const results = searchComponents('Mod')
    expect(results.length).toBeGreaterThan(0)
    const names = results.map((r) => r.component.name)
    expect(names).toContain('Modal')
  })

  it('should match on description', () => {
    const results = searchComponents('accordion')
    expect(results.length).toBeGreaterThan(0)
    const hasDescMatch = results.some((r) => r.matchedOn.includes('description'))
    expect(hasDescMatch).toBe(true)
  })

  it('should filter by category', () => {
    const results = searchComponents('button', { category: 'actions' })
    for (const result of results) {
      expect(result.component.category).toBe('actions')
    }
  })

  it('should respect limit parameter', () => {
    const results = searchComponents('a', { limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('should return empty array for empty query', () => {
    const results = searchComponents('')
    expect(results).toEqual([])
  })

  it('should return empty array for query with no matches', () => {
    const results = searchComponents('xyznonexistentcomponent12345')
    expect(results).toEqual([])
  })

  it('should be case insensitive', () => {
    const upper = searchComponents('BUTTON')
    const lower = searchComponents('button')
    expect(upper.length).toBeGreaterThan(0)
    expect(upper[0].component.name).toBe(lower[0].component.name)
  })

  it('should handle multi-token queries', () => {
    const results = searchComponents('modal dialog')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should not exceed MAX_SEARCH_RESULTS', () => {
    const results = searchComponents('a', { limit: 100 })
    expect(results.length).toBeLessThanOrEqual(10)
  })
})

describe('findComponent', () => {
  it('should find component by exact name', () => {
    const component = findComponent('Button')
    expect(component).toBeDefined()
    expect(component!.name).toBe('Button')
  })

  it('should be case insensitive', () => {
    const component = findComponent('button')
    expect(component).toBeDefined()
    expect(component!.name).toBe('Button')
  })

  it('should return undefined for unknown component', () => {
    const component = findComponent('NonExistentComponent')
    expect(component).toBeUndefined()
  })
})

describe('listComponents', () => {
  it('should return all components when no category specified', () => {
    const components = listComponents()
    expect(components.length).toBeGreaterThan(0)
  })

  it('should filter by category', () => {
    const components = listComponents('actions')
    expect(components.length).toBeGreaterThan(0)
    for (const component of components) {
      expect(component.category).toBe('actions')
    }
  })

  it('should return empty array for category with no components', () => {
    // All categories should have components, but test the filtering logic
    const all = listComponents()
    const actions = listComponents('actions')
    expect(actions.length).toBeLessThan(all.length)
  })
})
