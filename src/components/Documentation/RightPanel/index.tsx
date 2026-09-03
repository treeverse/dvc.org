import cn from 'clsx/lite'
import { useState, useEffect, useRef } from 'react'

import { IHeading } from '../'
import { mainSiteUrls } from '../../../consts.js'
import Link from '../../Link'
import * as sharedStyles from '../styles.module.css'

import * as styles from './styles.module.css'

interface IRightPanelProps {
  headings: Array<IHeading>
  githubLink: string
}

const RightPanel: React.FC<IRightPanelProps> = ({ headings, githubLink }) => {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)
  const animatingRef = useRef(false)
  const contentBlockRef = useRef<HTMLDivElement>(null)
  const guardCleanupRef = useRef<(() => void) | null>(null)
  const scheduleUpdateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let rafId = 0
    animatingRef.current = false

    // A heading is "active" once it passes the visible top boundary.
    // The extra buffer covers the anchor margin and minor spacing.
    const getBaseOffset = (): number =>
      (document.getElementById('header')?.getBoundingClientRect().bottom ??
        56) + 30
    let baseOffset = getBaseOffset()

    const update = (): void => {
      if (animatingRef.current) return
      // Near the bottom, headings can't reach the top — loosen the threshold.
      // Clamp to 0 so short pages (scrollHeight < innerHeight) don't
      // produce a negative value that selects the last heading immediately.
      const remaining = Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight -
          window.scrollY
      )
      const threshold = Math.max(baseOffset, window.innerHeight - remaining)

      let active: string | null = null
      for (const { slug } of headings) {
        const el = document.getElementById(slug)
        if (el && el.getBoundingClientRect().top <= threshold) active = slug
      }

      setCurrentSlug(active)
    }

    const scheduleUpdate = (): void => {
      if (!rafId)
        rafId = requestAnimationFrame(() => {
          rafId = 0
          update()
        })
    }

    const onLayoutResize = (): void => {
      baseOffset = getBaseOffset()
      scheduleUpdate()
    }

    // Detect layout shifts from <details>, images, etc. that don't
    // fire scroll or resize events but still move headings.
    const markdownRoot = document.getElementById('markdown-root')
    const header = document.getElementById('header')
    const resizeObserver = new ResizeObserver(onLayoutResize)
    if (markdownRoot) resizeObserver.observe(markdownRoot)
    if (header) resizeObserver.observe(header)

    document.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', onLayoutResize, { passive: true })
    scheduleUpdateRef.current = scheduleUpdate
    rafId = requestAnimationFrame(() => {
      rafId = 0
      update()
    })

    return (): void => {
      document.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', onLayoutResize)
      resizeObserver.disconnect()
      cancelAnimationFrame(rafId)
      guardCleanupRef.current?.()
      scheduleUpdateRef.current = null
    }
  }, [headings])

  useEffect(() => {
    const block = contentBlockRef.current
    if (!block) return
    if (!currentSlug) {
      block.scrollTo({ top: 0 })
      return
    }
    const el = document.getElementById(`link-${currentSlug}`)
    if (el && block.scrollHeight > block.clientHeight) {
      block.scrollTo({
        top: el.offsetTop - block.clientHeight / 2 + el.clientHeight / 2
      })
    }
  }, [currentSlug])

  const handleClick = (e: React.MouseEvent, slug: string): void => {
    // Ignore modified clicks (Cmd/Ctrl+click, middle-click, etc.)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return
    if (slug === currentSlug) return

    // Cancel any in-flight guard from a previous click
    guardCleanupRef.current?.()

    animatingRef.current = true
    setCurrentSlug(slug)

    const clearGuard = (): void => {
      animatingRef.current = false
      clearTimeout(safetyTimer)
      clearTimeout(idleTimer)
      document.removeEventListener('scrollend', onScrollEnd)
      document.removeEventListener('scroll', onScrollActivity)
      guardCleanupRef.current = null
      // Resync the active heading now that the guard is lifted
      scheduleUpdateRef.current?.()
    }

    const onScrollEnd = (): void => clearGuard()
    document.addEventListener('scrollend', onScrollEnd, { once: true })

    // Scroll-idle fallback: fires 150ms after the last scroll event.
    // Handles browsers without scrollend and the case where the
    // target is already visible (no scroll occurs at all).
    let idleTimer = setTimeout(clearGuard, 150)
    const onScrollActivity = (): void => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(clearGuard, 150)
    }
    document.addEventListener('scroll', onScrollActivity, { passive: true })

    // Absolute safety net for edge cases
    const safetyTimer = setTimeout(clearGuard, 3000)
    guardCleanupRef.current = clearGuard
  }

  return (
    <div className={styles.container}>
      {headings.length > 0 && (
        <nav aria-label="On this page" className={styles.nav}>
          <div>
            <h5 className={styles.header}>Content</h5>
            <hr className={styles.separator} />
          </div>
          <div className={styles.contentBlock} ref={contentBlockRef}>
            {headings.map(({ slug, text }) => (
              <div id={`link-${slug}`} key={`link-${slug}`}>
                <Link
                  className={cn(
                    styles.headingLink,
                    currentSlug === slug && styles.current,
                    'link-with-focus'
                  )}
                  href={`#${slug}`}
                  aria-current={currentSlug === slug ? 'location' : undefined}
                  onClick={(e: React.MouseEvent) => handleClick(e, slug)}
                >
                  {text}
                </Link>
              </div>
            ))}
          </div>
        </nav>
      )}
      <div className={styles.buttonsBlock}>
        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="bug"
            >
              🐛
            </span>{' '}
            Found an issue? Let us know! Or fix it:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href={githubLink}
            target="_blank"
          >
            <i
              className={cn(sharedStyles.buttonIcon, styles.githubIcon)}
              aria-hidden="true"
            />
            Edit on GitHub
          </Link>
        </div>

        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="question"
            >
              ❓
            </span>{' '}
            Have a question? Join our chat, we will help you:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href={mainSiteUrls.chat}
            target="_blank"
          >
            <i
              className={cn(sharedStyles.buttonIcon, styles.discordIcon)}
              aria-hidden="true"
            />
            Discord Chat
          </Link>
        </div>

        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="lakefs"
            >
              🤝
            </span>{' '}
            Data on petabyte scale? Checkout our sister project:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href="https://docs.lakefs.io/latest/index.html"
            target="_blank"
          >
            <i
              className={cn(sharedStyles.buttonIcon, styles.lakefsIcon)}
              aria-hidden="true"
            />
            lakeFS Docs
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
