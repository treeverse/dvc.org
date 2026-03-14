import { SkipNavContent } from '@reach/skip-nav'
import cn from 'classnames'
import { PropsWithChildren, Reducer, useEffect, useReducer } from 'react'

import { focusElementWithHotkey } from '../../../utils/front/focusElementWithHotkey'
import HamburgerIcon from '../../HamburgerIcon'
import LayoutWidthContainer from '../../LayoutWidthContainer'

import SearchForm from './SearchForm'
import SidebarMenu from './SidebarMenu'
import * as styles from './styles.module.css'

const toggleReducer: Reducer<boolean, void> = state => !state

const Layout: React.FC<PropsWithChildren<{ currentPath: string }>> = ({
  children,
  currentPath
}) => {
  const [isMenuOpen, toggleMenu] = useReducer(toggleReducer, false)

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

      <button
        className={cn(styles.sideToggle, isMenuOpen && styles.opened)}
        onClick={toggleMenu}
      >
        <HamburgerIcon />
      </button>

      <div className={cn(styles.side, isMenuOpen && styles.opened)}>
        <div className={cn(styles.innerSidebar)}>
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
