import Promise from 'promise-polyfill'

const createScript = (
  src: string,
  onload: () => void,
  onerror: () => void
): HTMLScriptElement => {
  const node = document.createElement('script')

  node.onload = onload
  node.onerror = onerror
  node.type = 'text/javascript'
  node.src = src

  return node
}

const createStylesheet = (
  href: string,
  onload: () => void,
  onerror: () => void
): HTMLLinkElement => {
  const node = document.createElement('link')

  node.onload = onload
  node.onerror = onerror
  node.rel = 'stylesheet'
  node.type = 'text/css'
  node.media = 'all'
  node.href = href

  return node
}

const resourcesCache: { [url: string]: Promise<void> } = {}
const resourceNodeCreators: {
  [regex: string]: typeof createScript | typeof createStylesheet
} = {
  '\\.js$': createScript,
  '\\.css$': createStylesheet
}

export const loadResource = (url: string): Promise<void> => {
  if (!resourcesCache[url]) {
    resourcesCache[url] = new Promise((resolve, reject) => {
      const howToHandle = Object.keys(resourceNodeCreators).find(regExp =>
        new RegExp(regExp).test(url)
      )

      if (!howToHandle) {
        throw new Error(`You can't load resource with this url: ${url}`)
      }

      const creator = resourceNodeCreators[howToHandle]

      if (creator) {
        const node = creator(url, resolve, reject)
        document.head.appendChild(node)
      }
    })
  }

  return resourcesCache[url]
}
