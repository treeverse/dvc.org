import Promise from 'promise-polyfill'
import { useEffect, useState } from 'react'

import { loadResource } from '../../../../utils/front/resources'

import * as styles from './styles.module.css'

declare global {
  interface Window {
    docsearch?: (opts: Record<string, unknown>) => void
  }
}

const apiKey = '5341554faa7a8255d383af495c6d3ed2'
const appId = '98DVTFT919'
const indexName = 'dvc-docs'

const SearchForm: React.FC = props => {
  const [searchAvailable, setSearchAvailable] = useState<boolean>(false)
  useEffect(() => {
    if (window) {
      if (!window.docsearch) {
        Promise.all([
          loadResource(
            'https://cdn.jsdelivr.net/npm/docsearch.js@2.6.2/dist/cdn/docsearch.min.css'
          ),
          loadResource(
            'https://cdn.jsdelivr.net/npm/docsearch.js@2.6.2/dist/cdn/docsearch.min.js'
          )
        ]).then(() => {
          if (window.docsearch) {
            window.docsearch({
              appId,
              apiKey,
              indexName,
              inputSelector: '#doc-search',
              debug: false // Set to `true` if you want to inspect the dropdown
            })
            setSearchAvailable(true)
          }
        })
      } else {
        window.docsearch({
          appId,
          apiKey,
          indexName,
          inputSelector: '#doc-search',
          debug: false // Set to `true` if you want to inspect the dropdown
        })
        setSearchAvailable(true)
      }
    }
  }, [])

  return (
    <div className={styles.searchArea}>
      <div className={styles.container}>
        <input
          className={styles.input}
          type="text"
          id="doc-search"
          placeholder="Search docs"
          disabled={!searchAvailable}
          {...props}
        />
      </div>
    </div>
  )
}

export default SearchForm
