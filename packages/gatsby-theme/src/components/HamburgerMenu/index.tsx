import cn from 'classnames'
import { useEffect, useState, useCallback, MouseEvent } from 'react'

import {
  docUrls,
  externalUrls,
  mainSiteUrls
} from '@dvcorg/gatsby-theme/consts'
import menuData from '@dvcorg/gatsby-theme/src/data/menu'
import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import { ReactComponent as MailIcon } from '../../../../../static/img/community/icon-mail.svg'
import HamburgerIcon from '../HamburgerIcon'
import Link from '../Link'
import { ReactComponent as DiscordSVG } from '../SocialIcon/discord.svg'
import { ReactComponent as GithubIcon } from '../SocialIcon/github.svg'
import { ReactComponent as TwitterIcon } from '../SocialIcon/twitter.svg'

import * as styles from './styles.module.css'

export type HamburgerHelpers = {
  opened: boolean
  setOpened: (newState: boolean) => void
  handleToggle: () => void
  handleClose: () => void
  handleItemClick: (name?: string) => (e: MouseEvent) => void
}

export const useHamburgerMenu: () => HamburgerHelpers = () => {
  const [opened, setOpened] = useState(false)

  const handleToggle = useCallback(() => setOpened(!opened), [opened])

  const handleClose = useCallback(() => setOpened(false), [])

  const handleItemClick = useCallback(
    (item?: string) => (): void => {
      handleClose()
      if (item) {
        logEvent('Hamburger Menu', { Item: item })
      }
    },
    [handleClose]
  )

  useEffect(() => {
    const method = opened ? 'add' : 'remove'
    document.body.classList[method](styles.hiddenScrollbar)
  }, [opened])

  return {
    opened,
    setOpened,
    handleToggle,
    handleClose,
    handleItemClick
  }
}

export const HamburgerMenu: React.FC<
  Pick<HamburgerHelpers, 'opened' | 'handleItemClick' | 'handleToggle'> & {
    collapsed: boolean
  }
> = ({ opened, handleItemClick }) => {
  return (
    <div className={cn(styles.wrapper, opened && styles.opened)}>
      <div className={styles.logoRow}>
        <Link
          onClick={() => handleItemClick()}
          href={mainSiteUrls.home}
          className={styles.logo}
          aria-label="Home"
        >
          <img src="/img/dvc_by_lakefs_white.svg" alt="DVC Logo" />
        </Link>
      </div>
      <ul className={styles.sections}>
        <li className={styles.section}>
          <Link
            href={docUrls.exampleScenarios}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('example-scenarios')}
          >
            Example Scenarios
          </Link>
        </li>
        <li className={styles.section}>
          <Link
            href={docUrls.home}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('doc')}
          >
            Doc
          </Link>
        </li>
        <li className={styles.section}>
          <Link
            href={mainSiteUrls.blog}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('blog')}
          >
            Blog
          </Link>
        </li>
        <li className={styles.section}>
          <Link
            href={externalUrls.course}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('course')}
          >
            Course
          </Link>
        </li>
        <li className={styles.section}>
          <Link
            href={mainSiteUrls.community}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('community')}
          >
            Community
          </Link>
          <ul className={styles.subSections}>
            {menuData.community.map(item => (
              <li className={styles.subSection} key={item.href}>
                <Link
                  href={item.href}
                  className={styles.subSectionLink}
                  onClick={() => handleItemClick('community')}
                >
                  <img
                    className={styles.subSectionLinkImage}
                    src={item.img}
                    alt={item.imgAlt}
                  />
                  <span className={styles.subSectionLinkTitle}>
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li className={styles.section}>
          <Link
            href={mainSiteUrls.support}
            className={styles.sectionHeading}
            onClick={() => handleItemClick('support')}
          >
            Support
          </Link>
          <ul className={styles.subSections}>
            <li className={styles.subSection}>
              <Link
                className={styles.subSectionLink}
                href={externalUrls.mail}
                target="_blank"
                onClick={() => handleItemClick('mail')}
              >
                <MailIcon className={styles.subSectionLinkImage} />
                <span className={styles.subSectionLinkTitle}>E-Mail</span>
              </Link>
            </li>
            <li className={styles.subSection}>
              <Link
                className={styles.subSectionLink}
                href={externalUrls.dvcRepo}
                onClick={() => handleItemClick('github')}
                target="_blank"
              >
                <GithubIcon className={styles.subSectionLinkImage} />
                <span className={styles.subSectionLinkTitle}>GitHub</span>
              </Link>
            </li>
            <li className={styles.subSection}>
              <Link
                className={styles.subSectionLink}
                href={mainSiteUrls.chat}
                onClick={() => handleItemClick('chat')}
                target="_blank"
              >
                <DiscordSVG className={styles.subSectionLinkImage} />
                <span className={styles.subSectionLinkTitle}>Discord</span>
              </Link>
            </li>
            <li className={styles.subSection}>
              <Link
                className={styles.subSectionLink}
                href={externalUrls.twitter}
                onClick={() => handleItemClick('twitter')}
                target="_blank"
              >
                <TwitterIcon className={styles.subSectionLinkImage} />
                <span className={styles.subSectionLinkTitle}>Twitter</span>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
      <Link
        href={docUrls.getStarted}
        className={styles.linkButton}
        onClick={() => handleItemClick('get-started')}
      >
        Get started
      </Link>
    </div>
  )
}

export const HamburgerButton: React.FC<{
  opened: boolean
  collapsed: boolean
  handleClick: (e: MouseEvent) => void
}> = ({ opened, handleClick }) => (
  <button
    className={cn(styles.toggleButton, opened && styles.opened)}
    onClick={handleClick}
    aria-label="Toggle Mobile Menu"
  >
    <HamburgerIcon opened={opened} />
  </button>
)
