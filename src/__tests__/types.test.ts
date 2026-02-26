import { describe, it, expect } from 'vitest'
import { components } from '../data/generated/index.js'
import type { DaisyUIComponent, ComponentCategory } from '../types.js'
import { CATEGORIES } from '../constants.js'

const validCategories: ComponentCategory[] = [...CATEGORIES]

describe('knowledge base validation', () => {
  it('should have components loaded', () => {
    expect(components.length).toBeGreaterThan(0)
  })

  it('should be an array of DaisyUIComponent objects', () => {
    expect(Array.isArray(components)).toBe(true)
  })

  describe('each component', () => {
    for (const component of components) {
      describe(component.name, () => {
        it('should have required fields', () => {
          expect(component.name).toBeDefined()
          expect(typeof component.name).toBe('string')
          expect(component.name.length).toBeGreaterThan(0)

          expect(component.slug).toBeDefined()
          expect(typeof component.slug).toBe('string')
          expect(component.slug.length).toBeGreaterThan(0)

          expect(component.category).toBeDefined()
          expect(validCategories).toContain(component.category)

          expect(component.description).toBeDefined()
          expect(typeof component.description).toBe('string')

          expect(component.docsUrl).toBeDefined()
          if (component.docsUrl !== '') {
            expect(component.docsUrl).toMatch(/^https:\/\//)
          }

          expect(component.sourceUrl).toBeDefined()
          expect(component.sourceUrl).toMatch(/^https:\/\//)

          expect(Array.isArray(component.props)).toBe(true)
          expect(Array.isArray(component.examples)).toBe(true)
        })

        it('should have valid props', () => {
          for (const prop of component.props) {
            expect(prop.name).toBeDefined()
            expect(typeof prop.name).toBe('string')
            expect(prop.name.length).toBeGreaterThan(0)

            expect(prop.type).toBeDefined()
            expect(typeof prop.type).toBe('string')

            expect(typeof prop.required).toBe('boolean')

            expect(prop.description).toBeDefined()
            expect(typeof prop.description).toBe('string')
          }
        })

        it('should have valid examples', () => {
          for (const example of component.examples) {
            expect(example.title).toBeDefined()
            expect(typeof example.title).toBe('string')

            expect(example.code).toBeDefined()
            expect(typeof example.code).toBe('string')

            expect(['tsx', 'jsx', 'html']).toContain(example.language)
          }
        })
      })
    }
  })

  it('should cover all categories', () => {
    const foundCategories = new Set(components.map((c: DaisyUIComponent) => c.category))
    for (const cat of validCategories) {
      expect(foundCategories.has(cat)).toBe(true)
    }
  })
})
