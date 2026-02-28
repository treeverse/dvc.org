const path = require('path')

module.exports = {
  docsPath: path.resolve('content', 'docs'),
  docsInstanceName: 'docs',
  glossaryPath: path.resolve('content', 'docs', 'user-guide', 'basic-concepts'),
  glossaryInstanceName: 'glossary',
  argsLinkerPath: ['command-reference', `ref`, 'cli-reference'],
  sentry: true
}
