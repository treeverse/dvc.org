import { SkipNavContent } from '@reach/skip-nav'
import cn from 'classnames'
import {
  PropsWithChildren,
  Reducer,
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

  // Disable sidebar transitions during window resize to prevent flash
  const resizeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    const onResize = () => {
      document.documentElement.setAttribute('data-resizing', '')
      clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(() => {
        document.documentElement.removeAttribute('data-resizing')
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer.current)
    }
  }, [])

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
        <div className={styles.innerSidebar}>
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
