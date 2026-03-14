import * as Sentry from '@sentry/node'

const parseBoolean = str => {
  return ['True', 'true', '1', true].includes(str)
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: parseBoolean(process.env.SENTRY_DEBUG)
})
