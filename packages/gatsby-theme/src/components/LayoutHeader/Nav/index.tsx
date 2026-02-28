import cn from 'classnames'
import { useEffect } from 'react'

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
    const method = opened ? 'add' : 'remove'
    document.body.classList[method](styles.hiddenScrollbar)
  }, [opened])

  return (
    <>
      <nav className={cn(styles.wrapper, opened && styles.opened)}>
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
        <LinkItems onItemClick={onClose} />
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
        aria-label="Toggle Mobile Menu"
      >
        <HamburgerIcon opened={opened} />
      </button>
    </>
  )
}

export default Nav
