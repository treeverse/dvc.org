const url = require('url')

const {
  buildSidebarRedirects,
  processRedirectString,
  getRedirect
} = require('./redirects')

describe('buildRedirectsList', () => {
  it('builds correct redirects list', () => {
    const list = [
      {
        source: false,
        path: '/a',
        children: [
          {
            path: '/a/b',
            source: 'some-file'
          }
        ]
      }
    ]

    expect(buildSidebarRedirects(list)).toEqual(['^/a/?$ /a/b 307'])
  })
})

describe('processRedirectString', () => {
  it('reads the regex, replacement and code', () => {
    const { regex, replace, code } = processRedirectString('^/foo /bar 418')

    expect(regex).toBeInstanceOf(RegExp)
    expect(regex.source).toEqual('^\\/foo')
    expect(replace).toEqual('/bar')
    expect(code).toEqual(418)
  })

  it('defaults to 301 response code', () => {
    const { code } = processRedirectString('^/x /y')

    expect(code).toEqual(301)
  })

  it('detects whether redirecting a full URL or just a path', () => {
    const { matchPathname: matchPathnameFalse } = processRedirectString(
      '^https://example.com/foo /x'
    )
    expect(matchPathnameFalse).toEqual(false)

    const { matchPathname } = processRedirectString('^/path /y')
    expect(matchPathname).toEqual(true)
  })
})

describe('getRedirects', () => {
  it('enforces HTTPS and removes www simultaneously', () => {
    const mockReq = {
      headers: {
        'x-forwarded-proto': 'http'
      },
      url: '/foo/bar?baz'
    }
    expect(
      getRedirect('www.dvc.org', '/not-used', { req: mockReq, dev: false })
    ).toEqual([301, 'https://dvc.org/foo/bar?baz'])
  })

  const itRedirects = (source, target, code = 301) => {
    const addHost = pathOrUrl => {
      if (pathOrUrl.startsWith('/')) {
        return `https://dvc.org${pathOrUrl}`
      }
      return pathOrUrl
    }

    it(`${source} -> ${target} (${code})`, () => {
      source = addHost(source)
      const { hostname, pathname } = url.parse(source)
      const [rCode, rLocation] = getRedirect(hostname, pathname)

      expect(rLocation).toEqual(target)
      expect(rCode).toEqual(code)

      // Detect redirect loops.
      const secondUrl = url.parse(addHost(rLocation))
      if (
        secondUrl.hostname === 'downloads.dvc.org' ||
        secondUrl.hostname === 'r2.dvc.org'
      ) {
        // downloads.dvc.org redirects are handled externally and does not redirect back to dvc.org.
        // Return to prevent endless redirects since some rules redirect to downloads.dvc.org
        // and would otherwise match the same redirect rule again.
        return
      }
      // allow second redirect only if it removes trailing slash
      const secondRedirect = getRedirect(secondUrl.hostname, secondUrl.pathname)
      if (secondRedirect.length) {
        const thirdUrl = url.parse(addHost(secondRedirect[1]))
        expect(secondUrl.host).toEqual(thirdUrl.host)
        expect(secondUrl.pathname.replace(/\/$/, '')).toEqual(secondRedirect[1])

        const thirdRedirect = getRedirect(thirdUrl.hostname, thirdUrl.pathname)
        expect(thirdRedirect).toEqual([])
      }
    })
  }

  describe('fromSubdomains', () => {
    itRedirects(
      'https://man.dvc.org',
      'https://doc.dvc.org/command-reference',
      303
    )
    itRedirects(
      'https://man.dvc.org/',
      'https://doc.dvc.org/command-reference',
      303
    )

    itRedirects(
      'https://man.dvc.org/foo',
      'https://doc.dvc.org/command-reference/foo',
      303
    )

    itRedirects(
      'https://error.dvc.org/',
      'https://doc.dvc.org/user-guide/troubleshooting#',
      303
    )

    itRedirects(
      'https://error.dvc.org/foo',
      'https://doc.dvc.org/user-guide/troubleshooting#foo',
      303
    )
  })

  describe('toS3', () => {
    itRedirects('https://code.dvc.org', 'https://r2.dvc.org/code/', 303)

    itRedirects('https://data.dvc.org', 'https://r2.dvc.org/data/', 303)

    itRedirects('https://remote.dvc.org', 'https://r2.dvc.org/remote/', 303)

    itRedirects(
      'https://code.dvc.org/foo/bar',
      'https://r2.dvc.org/code/foo/bar',
      303
    )

    itRedirects(
      'https://data.dvc.org/foo/bar',
      'https://r2.dvc.org/data/foo/bar',
      303
    )

    itRedirects(
      'https://remote.dvc.org/foo/bar',
      'https://r2.dvc.org/remote/foo/bar',
      303
    )
  })

  describe('fromPaths', () => {
    itRedirects('/doc/x', '/x')
    itRedirects('/docs/x', '/x')
    itRedirects('/documentation/x', '/x')

    itRedirects('/commands-reference/foo', '/command-reference/foo')

    itRedirects('/tutorial', '/start')
    itRedirects('/tutorial/', '/start')
    itRedirects('/tutorials', '/start')
    itRedirects('/tutorials/', '/start')
    itRedirects('/tutorials/deep', '/start')
    itRedirects('/tutorials/versioning', '/start')

    itRedirects('/tutorial/bar', '/start')
  })

  describe('use-cases to example-scenarios', () => {
    itRedirects(
      '/use-cases/versioning-data-and-model-files/tutorial',
      '/example-scenarios/versioning-data-and-models/tutorial'
    )
    itRedirects(
      '/use-cases/data-and-model-files-versioning',
      '/example-scenarios/versioning-data-and-models'
    )
    itRedirects(
      '/use-cases/versioning-data-and-model-files',
      '/example-scenarios/versioning-data-and-models'
    )
    itRedirects(
      '/use-cases/shared-development-server',
      '/example-scenarios/fast-data-storage-layer#example-shared-development-server'
    )
    itRedirects(
      '/use-cases/data-registries',
      '/example-scenarios/data-registry'
    )
    itRedirects('/use-cases', '/example-scenarios')
    itRedirects('/use-cases/something-new', '/example-scenarios/something-new')
  })

  describe('example-scenarios legacy slugs', () => {
    itRedirects(
      '/example-scenarios/data-and-model-files-versioning',
      '/example-scenarios/versioning-data-and-models'
    )
    itRedirects(
      '/example-scenarios/versioning-data-and-model-files',
      '/example-scenarios/versioning-data-and-models'
    )
    itRedirects(
      '/example-scenarios/shared-development-server',
      '/example-scenarios/fast-data-storage-layer#example-shared-development-server'
    )
    itRedirects(
      '/example-scenarios/data-registries',
      '/example-scenarios/data-registry'
    )
  })

  describe('Does not accidentally redirect to an external site', () => {
    itRedirects('//google.com/', '/google.com')
    itRedirects('https://dvc.org//google.com/', '/google.com')
    itRedirects('/////////evil.com/', '/evil.com')
  })
})
