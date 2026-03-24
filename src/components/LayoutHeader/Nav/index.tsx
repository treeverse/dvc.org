import cn from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'

import { logEvent } from '../../../utils/front/plausible'
import HamburgerIcon from '../../HamburgerIcon'
import PseudoButton from '../../PseudoButton'
import ThemeSwitcher from '../ThemeSwitcher'

import LinkItems from './LinkItems'
import SocialIcons from './SocialIcons'
import * as styles from './styles.module.css'

interface NavProps {
  opened: boolean
  onToggle: () => void
  onClose: () => void
}

const Nav: React.FC<NavProps> = ({ opened, onToggle, onClose }) => {
  const [docsSidebarOpen, setDocsSidebarOpen] = useState(false)

  // Listen for docs sidebar state changes to sync the hamburger icon
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setDocsSidebarOpen(detail?.open ?? false)
    }
    document.addEventListener('docs-sidebar-state', handler)
    return () => document.removeEventListener('docs-sidebar-state', handler)
  }, [])

  const isDocsPage = useCallback(
    () => document.body.hasAttribute('data-docs-page'),
    []
  )

  const handleToggle = useCallback(() => {
    if (isDocsPage()) {
      document.dispatchEvent(new Event('docs-sidebar-toggle'))
      return
    }
    onToggle()
  }, [onToggle, isDocsPage])

  const handleClose = useCallback(() => {
    if (isDocsPage() && docsSidebarOpen) {
      document.dispatchEvent(new Event('docs-sidebar-toggle'))
      return
    }
    onClose()
  }, [onClose, isDocsPage, docsSidebarOpen])

  // On doc pages, the hamburger reflects the docs sidebar state.
  // On other pages, it reflects the site nav state.
  const hamburgerOpened = docsSidebarOpen || opened

  useEffect(() => {
    document.body.classList.toggle(styles.hiddenScrollbar, hamburgerOpened)
    return () => {
      document.body.classList.remove(styles.hiddenScrollbar)
    }
  }, [hamburgerOpened])

  const onCloseRef = useRef(handleClose)
  useEffect(() => {
    onCloseRef.current = handleClose
  }, [handleClose])

  useEffect(() => {
    if (!hamburgerOpened) return

    const ac = new AbortController()

    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseRef.current()
      },
      { signal: ac.signal }
    )

    return () => ac.abort()
  }, [hamburgerOpened])

  return (
    <>
      <nav
        className={cn(styles.wrapper, opened && styles.opened)}
        aria-label="Main navigation"
      >
        <LinkItems onItemClick={onClose} isMobileMenu={opened} />
        <SocialIcons />
        <ThemeSwitcher className={styles.desktopThemeSwitcher} />
        <PseudoButton
          className={cn(styles.getStartedButton, 'btn-with-focus')}
          href="/start"
          onClick={(): void => {
            logEvent('Nav', { Item: 'get-started' })
            onClose()
          }}
          size="none"
        >
          Get Started
        </PseudoButton>
      </nav>
      <div className={styles.mobileControlsLeft}>
        <button
          className={cn(
            styles.hamburgerButton,
            hamburgerOpened && styles.hamburgerOpened
          )}
          onClick={handleToggle}
          aria-expanded={hamburgerOpened}
          aria-label={hamburgerOpened ? 'Close menu' : 'Open menu'}
        >
          <HamburgerIcon opened={hamburgerOpened} />
        </button>
      </div>
      <div className={styles.mobileControls}>
        <ThemeSwitcher className={styles.mobileThemeSwitcher} />
      </div>
    </>
  )
}

export default Nav
