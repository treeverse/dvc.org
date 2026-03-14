import Prism from 'prismjs'

import dvc from './dvc-commands.js'

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
