/* eslint-env node */

const Prism = require('prismjs')

const dvc = require('./dvc-commands')

Prism.languages.usage = {
  dvc: {
    pattern: new RegExp(`dvc (?:${dvc.join('|')})`)
  },
  usage: {
    pattern:
      /(^|\n)\s*(usage|arguments|positional arguments|optional arguments)/
  },
  args: {
    pattern: /(?<=\[)(?:[^\][]+|\[(?:[^\][]+|\[[^\][]*\])*\])*(?=\])/,
    inside: {
      arg: {
        pattern: /-{1,2}[^|]*/
      }
    }
  }
}
