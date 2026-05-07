import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import { createProxyMiddleware } from 'http-proxy-middleware'
import permissionsPolicy from 'permissions-policy'
import serveHandler from 'serve-handler'

import createMarkdownMiddleware from './markdown.js'
import redirectsMiddleware from './redirect.js'

const port = process.env.PORT || 3000
const app = express()

app.use(compression())
app.use(redirectsMiddleware)
app.use(
  '/pl',
  createProxyMiddleware({
    target: 'https://plausible.io',
    changeOrigin: true,
    xfwd: true,
    pathRewrite: (path, _req) => path.replace(/^\/pl/, '')
  })
)
app.use(express.json())

// we can also extend to add further custom routes
app.get('/api/status', (req, res) => {
  res.send('ok')
})

const helmetOptions = {
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
      frameSrc: [
        'https://*.youtube.com',
        'https://*.youtube-nocookie.com',
        'https://web.cmp.usercentrics.eu',
        'https://api.vector.co' // Common Room
      ],
      connectSrc: ["'self'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      formAction: ["'self'", 'https://doc.dvc.org']
    }
  }
}
app.use(
  permissionsPolicy({
    features: {
      fullscreen: [
        'self',
        '"https://*.youtube.com"',
        '"https://*.youtube-nocookie.com"'
      ],
      encryptedMedia: [
        'self',
        '"https://*.youtube.com"',
        '"https://*.youtube-nocookie.com"'
      ],
      autoplay: [
        'self',
        '"https://*.youtube.com"',
        '"https://*.youtube-nocookie.com"'
      ],
      webShare: ['self'],
      clipboardWrite: ['self']
    }
  })
)
app.use(helmet(helmetOptions))

const mustRevalidate =
  'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=240'
const cacheForever = 'public, max-age=31536000, immutable'
const markdownMiddleware = createMarkdownMiddleware({
  cacheControl: mustRevalidate
})
app.use(markdownMiddleware)
const serveMiddleware = async (req, res) => {
  await serveHandler(req, res, {
    public: 'public',
    cleanUrls: true,
    trailingSlash: false,
    directoryListing: false,
    headers: [
      {
        source: '**/*.html',
        headers: [{ key: 'Cache-Control', value: mustRevalidate }]
      },
      {
        source: 'page-data/**',
        headers: [{ key: 'Cache-Control', value: mustRevalidate }]
      },
      {
        source: 'static/**',
        headers: [{ key: 'Cache-Control', value: cacheForever }]
      },
      {
        source: '**/*.@(css|js)',
        headers: [{ key: 'Cache-Control', value: cacheForever }]
      },
      {
        source: 'fonts/**',
        headers: [{ key: 'Cache-Control', value: cacheForever }]
      },
      {
        source: '**/*.@(jpg|jpeg|gif|png|svg)',
        headers: [{ key: 'Cache-Control', value: 'max-age=86400' }]
      }
    ]
  })
}
app.use(serveMiddleware)

// Error handler
app.use(function onError(err, req, res, _next) {
  console.error(err)

  const status = err?.status || 500

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message
  })
})

// 404 error handler

app.use((req, res, _next) => {
  res.status(404).json({
    message: `${req.method} ${req.url} not found`
  })
})
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`)
  console.log('Serving static files from local')
})
