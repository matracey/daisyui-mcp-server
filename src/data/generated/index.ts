import type { DaisyUIComponent } from '../../types.js'
import data from './components.json' with { type: 'json' }

export const components: DaisyUIComponent[] = data as DaisyUIComponent[]
