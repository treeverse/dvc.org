import cn from 'clsx/lite'
import { useState, useRef, useEffect, useCallback } from 'react'

import * as sharedStyles from '../styles.module.css'

import * as styles from './styles.module.css'

interface ICopyPageButtonProps {
  pagePath: string
}

const CopyPageButton: React.FC<ICopyPageButtonProps> = ({ pagePath }) => {
  const [open, setOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>(
    'idle'
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const markdownUrl =
    pagePath === '/' ? '/index.md' : `${pagePath.replace(/\/$/, '')}.md`

  const handleCopy = useCallback(async () => {
    setCopyState('copying')
    setOpen(false)
    try {
      const textPromise = fetch(markdownUrl).then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.text()
      })

      // Safari requires clipboard writes to start in the synchronous call
      // stack of a user gesture. Using ClipboardItem with a Promise lets us
      // begin the write synchronously while resolving content async.
      if (
        typeof ClipboardItem !== 'undefined' &&
        ClipboardItem.supports?.('text/plain')
      ) {
        const item = new ClipboardItem({
          'text/plain': textPromise.then(
            t => new Blob([t], { type: 'text/plain' })
          )
        })
        await navigator.clipboard.write([item])
      } else {
        await navigator.clipboard.writeText(await textPromise)
      }
    } catch {
      setCopyState('idle')
      return
    }
    clearTimeout(timerRef.current)
    setCopyState('copied')
    timerRef.current = setTimeout(() => setCopyState('idle'), 2000)
  }, [markdownUrl])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const label =
    copyState === 'copying'
      ? 'Copying…'
      : copyState === 'copied'
        ? 'Copied!'
        : 'Copy page'

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={cn(sharedStyles.button, styles.splitButton)}>
        <button
          className={styles.mainButton}
          onClick={handleCopy}
          disabled={copyState === 'copying'}
          title="Copy page as Markdown"
          type="button"
        >
          {copyState === 'copied' ? (
            <svg
              className={cn(sharedStyles.buttonIcon, styles.icon)}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className={cn(sharedStyles.buttonIcon, styles.icon)}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5.5"
                y="5.5"
                width="8"
                height="9"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M10.5 5.5V3.5C10.5 2.95 10.05 2.5 9.5 2.5H3.5C2.95 2.5 2.5 2.95 2.5 3.5V11.5C2.5 12.05 2.95 12.5 3.5 12.5H5.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          )}
          {label}
        </button>
        <button
          className={cn(styles.chevronButton, open && styles.chevronOpen)}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="More copy options"
          type="button"
        >
          <svg
            className={styles.chevron}
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className={styles.dropdown} role="menu">
          <button
            className={styles.dropdownItem}
            onClick={handleCopy}
            role="menuitem"
            type="button"
          >
            <svg
              className={styles.dropdownIcon}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5.5"
                y="5.5"
                width="8"
                height="9"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M10.5 5.5V3.5C10.5 2.95 10.05 2.5 9.5 2.5H3.5C2.95 2.5 2.5 2.95 2.5 3.5V11.5C2.5 12.05 2.95 12.5 3.5 12.5H5.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
            <span className={styles.dropdownText}>
              <span className={styles.dropdownLabel}>Copy page</span>
              <span className={styles.dropdownDescription}>
                Copy page as Markdown for LLMs
              </span>
            </span>
          </button>
          <a
            className={styles.dropdownItem}
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <svg
              className={styles.dropdownIcon}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1.5"
                y="2.5"
                width="13"
                height="11"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <text
                x="8"
                y="10.5"
                textAnchor="middle"
                fill="currentColor"
                fontSize="6.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                MD
              </text>
            </svg>
            <span className={styles.dropdownText}>
              <span className={styles.dropdownLabel}>
                View as Markdown
                <svg
                  className={styles.externalIcon}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 2.5H9.5V8.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 2.5L2.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className={styles.dropdownDescription}>
                View this page as plain text
              </span>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}

export default CopyPageButton
