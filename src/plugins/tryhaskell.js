import { Observable as $ } from 'rx'
import { compose, prop, curryN } from 'ramda'
import { stripIndents } from 'common-tags'

import { reply, answerInlineQuery } from 'cycle-telegram'

let prettify = (query, result) => `
Prelude> ${query}
${result}
`

let answer = curryN(2, (u, text) => $.just(
  u.inline_query ? answerInlineQuery({
    results: [
      {
        type: 'article',
        title: text,
        input_message_content: {
          message_text: prettify(u.inline_query.query, text)
        }
      }
    ],
    cache_time: 0
  }, u) : reply({ text: prettify(u.message.text, text) }, u)))

function TryHaskell ({HTTP, props}, u) {
  let text = props[0]
  let res = HTTP
    .filter(res$ => res$.request.send.exp === text)
    .mergeAll()
    .map(compose(JSON.parse, prop('text')))
    .flatMapLatest(({
      error,
      success
    }) => error ? $.throw(error) : $.just(success))

  return {
    bot: res
      .map(res => stripIndents`
${res.stdout.join('')}
${res.value} :: ${res.type}
      `)
      .flatMapLatest(answer(u))
      .catch(answer(u)),

    HTTP: $.just({
      method: 'POST',
      url: 'http://tryhaskell.org/eval',
      category: 'tryhaskell',
      send: {
        exp: text
      },
      type: 'application/x-www-form-urlencoded',
      accept: 'application/json'
    })
  }
}

export default TryHaskell
