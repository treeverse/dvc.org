/* eslint-env node */
const Prism = require('prismjs')

const getTableTextBgColorRegex = color => new RegExp(String.raw`${color}:\S+`)

const boldAndItalicConfig = {
  bold: {
    pattern: /\*\*(?:(?!\*\*).)+\*\*/,
    inside: {
      hide: /\*\*/
    }
  },
  italic: {
    pattern: /\*(?:(?!\*).)+\*/,
    inside: {
      hide: /\*/
    }
  }
}

Prism.languages.dvctable = {
  rows: {
    pattern: /((?<=^|\n)[^─]{2}[\s\S]*?(:?\n|$))+/,
    inside: {
      'bg-white': {
        pattern: getTableTextBgColorRegex('(white|neutral)'),
        inside: {
          hide: {
            pattern: /(white|neutral):/
          },
          ...boldAndItalicConfig
        }
      },
      'bg-yellow': {
        pattern: getTableTextBgColorRegex('(yellow|metric)'),
        inside: {
          hide: {
            pattern: /(yellow|metric):/
          },
          ...boldAndItalicConfig
        }
      },
      'bg-blue': {
        pattern: getTableTextBgColorRegex('(blue|param)'),
        inside: {
          hide: {
            pattern: /(blue|param):/
          },
          ...boldAndItalicConfig
        }
      },
      'bg-violet': {
        pattern: getTableTextBgColorRegex('(violet|dep)'),
        inside: {
          hide: {
            pattern: /(violet|dep):/
          },
          ...boldAndItalicConfig
        }
      },
      ...boldAndItalicConfig
    }
  }
}
