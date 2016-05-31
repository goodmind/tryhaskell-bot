import { Update } from 'cycle-telegram'

import TryHaskell from './tryhaskell'

export let plugins = [
  {
    type: Update,
    name: 'tryhaskell',
    path: /(?:[\s\S]*)/,
    component: TryHaskell}
]
