import { Update } from 'cycle-telegram'

import TryHaskell from './tryhaskell'

export let plugins = [
  {
    type: Update,
    name: 'tryhaskell',
    pattern: /(?:[\s\S]*)/,
    component: TryHaskell}
]
