// we require prism and load its bash module so we have
// Prism.languages.bash to embed into our DVC language.

import Prism from 'prismjs'
import 'prismjs/components/prism-bash.js'
import './dvc-hook.js'
const { bash } = Prism.languages

import dvc from './dvc-commands.js'

// Command arrays are intentionally reverse sorted
// to prevent shorter matches before longer ones

const git = [
  'tag',
  'status',
  'remote update',
  'remote rename',
  'remote remove',
  'remote add',
  'remote',
  'push',
  'pull',
  'merge',
  'init',
  'fetch',
  'commit',
  'clone',
  'checkout',
  'add'
]

const beforeCommand = String.raw`(\$[\s(]+|;\s*)`

Prism.languages.cli = {
  line: {
    pattern: /(?<=(^|\n))\$[\s\S]*?[^\\](:?\n|$)/,
    inside: {
      dvc: {
        pattern: new RegExp(
          String.raw`${beforeCommand}\b(?:dvc (?:${dvc.join('|')}))\b`
        ),
        greedy: true,
        lookbehind: true
      },
      git: {
        pattern: new RegExp(
          String.raw`${beforeCommand}\b(?:git (?:${git.join('|')}))\b`
        ),
        greedy: true,
        lookbehind: true
      },
      command: {
        pattern: new RegExp(String.raw`${beforeCommand}\b[a-zA-Z0-9\-_]+\b`),
        greedy: true,
        lookbehind: true
      },
      ...bash,
      parameter: {
        pattern: /(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:[.-]\w+)*(?=[=\s]|$)/,
        alias: 'variable',
        lookbehind: true
      }
    }
  },
  comment: {
    pattern: /(^|[\s^"{\\$])#.*/,
    lookbehind: true
  }
}

Prism.languages.dvc = Prism.languages.cli
