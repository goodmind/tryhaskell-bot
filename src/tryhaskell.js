import { Observable as $ } from 'rx'
import { values, prop } from 'ramda'

import { run } from '@cycle/core'
import { makeHTTPDriver } from '@cycle/http'
import { makeTelegramDriver } from 'cycle-telegram'
import { matchWith } from 'cycle-telegram/plugins'

import { plugins } from './plugins'

let intent = (sources) => ({
  messages: sources.bot
    .events('message')
    ::matchWith(plugins, sources)
    .share(),

  inlineQuery: sources.bot
    .events('inline_query')
    ::matchWith(plugins, sources)
    .share()
})

let model = ({messages, inlineQuery, commands}, sources) => $.from([
  messages.pluck('bot').mergeAll(),
  inlineQuery.pluck('bot').mergeAll()
])

let main = (sources) => {
  let actions = intent(sources)

  return {
    HTTP: $.merge(actions.inlineQuery, actions.messages)
      .filter(prop('HTTP'))
      .pluck('HTTP')
      .mergeAll(),

    bot: model(actions, sources),

    log: $.from(values(actions)).mergeAll()
  }
}

run(main, {
  HTTP: makeHTTPDriver(),
  bot: makeTelegramDriver(process.env.ACCESS_TOKEN),
  log: (m) => m.forEach(::console.log)
})
