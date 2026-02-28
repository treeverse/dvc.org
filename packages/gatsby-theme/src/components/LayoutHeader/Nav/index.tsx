import cn from 'classnames'
import { useEffect, useRef } from 'react'

import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import { mainSiteUrls } from '../../../../consts'
import { ReactComponent as LogoSVG } from '../../../images/dvc_by_lakefs.svg'
import HamburgerIcon from '../../HamburgerIcon'
import Link from '../../Link'
import PseudoButton from '../../PseudoButton'

import LinkItems from './LinkItems'
import SocialIcons from './SocialIcons'
import * as styles from './styles.module.css'

interface NavProps {
  opened: boolean
  onToggle: () => void
  onClose: () => void
}

const Nav: React.FC<NavProps> = ({ opened, onToggle, onClose }) => {
  useEffect(() => {
    document.body.classList.toggle(styles.hiddenScrollbar, opened)
    return () => {
      document.body.classList.remove(styles.hiddenScrollbar)
    }
  }, [opened])

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!opened) return

    const ac = new AbortController()

    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseRef.current()
      },
      { signal: ac.signal }
    )

    return () => ac.abort()
  }, [opened])

  return (
    <>
      <nav
        className={cn(styles.wrapper, opened && styles.opened)}
        aria-label="Main navigation"
      >
        <div className={styles.mobileLogoRow}>
          <Link
            onClick={onClose}
            href={mainSiteUrls.home}
            className={styles.mobileLogo}
            aria-label="Home"
          >
            <LogoSVG />
          </Link>
        </div>
        <LinkItems onItemClick={onClose} isMobileMenu={opened} />
        <SocialIcons />
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
      <button
        className={cn(styles.hamburgerButton, opened && styles.hamburgerOpened)}
        onClick={onToggle}
        aria-expanded={opened}
        aria-label={opened ? 'Close menu' : 'Open menu'}
      >
        <HamburgerIcon opened={opened} />
      </button>
    </>
  )
}

export default Nav
