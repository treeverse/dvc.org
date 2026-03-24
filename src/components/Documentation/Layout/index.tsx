import { SkipNavContent } from '@reach/skip-nav'
import cn from 'classnames'
import {
  PropsWithChildren,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef
} from 'react'

import { focusElementWithHotkey } from '../../../utils/front/focusElementWithHotkey'
import LayoutWidthContainer from '../../LayoutWidthContainer'

import SearchForm from './SearchForm'
import SidebarMenu from './SidebarMenu'
import SiteNav from './SiteNav'
import * as styles from './styles.module.css'

const toggleReducer: Reducer<boolean, void> = state => !state

const Layout: React.FC<PropsWithChildren<{ currentPath: string }>> = ({
  children,
  currentPath
}) => {
  const [isMenuOpen, toggleMenu] = useReducer(toggleReducer, false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwipe = useRef(false)

  const openMenu = useCallback(() => {
    if (!isMenuOpen) toggleMenu()
  }, [isMenuOpen])

  const closeMenu = useCallback(() => {
    if (isMenuOpen) toggleMenu()
  }, [isMenuOpen])

  // Signal to the header Nav that this is a doc page.
  // The Nav component listens for 'docs-sidebar-toggle' to redirect
  // its hamburger click to the docs sidebar instead of the site nav.
  useEffect(() => {
    document.body.setAttribute('data-docs-page', '')
    return () => {
      document.body.removeAttribute('data-docs-page')
    }
  }, [])

  // Listen for toggle requests from the header hamburger
  useEffect(() => {
    const handler = () => toggleMenu()
    document.addEventListener('docs-sidebar-toggle', handler)
    return () => document.removeEventListener('docs-sidebar-toggle', handler)
  }, [])

  // Broadcast sidebar state so the header hamburger icon stays in sync
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('docs-sidebar-state', { detail: { open: isMenuOpen } })
    )
  }, [isMenuOpen])

  // Swipe from left edge to open, swipe left on sidebar to close
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    if (!mq.matches) return

    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      touchStartX.current = x
      touchStartY.current = y
      isSwipe.current = x < 40 || isMenuOpen
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!isSwipe.current) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)

      if (dy > Math.abs(dx)) return

      if (dx > 80 && touchStartX.current < 40) {
        openMenu()
      } else if (dx < -80 && isMenuOpen) {
        closeMenu()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMenuOpen, openMenu, closeMenu])

  useEffect(() => {
    const closeEventListener = focusElementWithHotkey('#doc-search', '/')
    return closeEventListener
  }, [])

  return (
    <LayoutWidthContainer className={styles.container} wide>
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      {/* eslint-disable jsx-a11y/click-events-have-key-events */}
      <div
        className={cn(styles.backdrop, isMenuOpen && styles.opened)}
        onClick={toggleMenu}
      />
      {/* eslint-enable jsx-a11y/no-static-element-interactions */}
      {/* eslint-enable jsx-a11y/click-events-have-key-events */}

      <div className={cn(styles.side, isMenuOpen && styles.opened)}>
        <div className={cn(styles.innerSidebar)}>
          <SiteNav onNavigate={toggleMenu} />
          <SearchForm />
          <SidebarMenu
            currentPath={currentPath}
            onClick={(isLeafItemClicked: boolean): void => {
              if (isLeafItemClicked) {
                toggleMenu()
              }
            }}
          />
        </div>
      </div>
      <div className={styles.content}>
        <SkipNavContent id="main-content" />
        {children}
      </div>
    </LayoutWidthContainer>
  )
}

export default Layout
