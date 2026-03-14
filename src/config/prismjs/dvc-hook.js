/* eslint-env node */

const Prism = require('prismjs')
const argsRegex = new RegExp(/-{1,2}[a-zA-Z-]*/, 'ig')

// Make sure the $ part of the command prompt in shell
// examples isn't copiable by making it an 'input' token.
Prism.hooks.add('after-tokenize', env => {
  if (['dvc', 'cli'].includes(env.language) && Array.isArray(env.tokens)) {
    for (const token of env.tokens) {
      if (token.type === 'line' && /^\$\s+$/.test(token.content[0])) {
        const old = token.content[0]
        token.content[0] = new Prism.Token('input', old, null, old, false)
      }
    }
  }
})

Prism.hooks.add('wrap', env => {
  if (env.language === 'usage' && env.type === 'arg') {
    const { content } = env
    env.tag = 'a'
    const href = content.match(argsRegex)[0]
    env.attributes.href = `#${href}`
  }
})
