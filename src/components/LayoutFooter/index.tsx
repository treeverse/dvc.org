import cn from 'classnames'

import { ReactComponent as LogoSVG } from '../../../static/img/dvc_by_lakefs_white.svg'
import { externalUrls, mainSiteUrls, docUrls } from '../../consts'
import LayoutWidthContainer from '../LayoutWidthContainer'
import Link from '../Link'
import { ReactComponent as BlogSVG } from '../SocialIcon/blog.svg'
import { ReactComponent as DiscordSVG } from '../SocialIcon/discord.svg'
import { ReactComponent as GithubSVG } from '../SocialIcon/github.svg'
import { ReactComponent as TwitterSVG } from '../SocialIcon/twitter.svg'

import * as styles from './styles.module.css'

declare global {
  interface Window {
    // https://usercentrics.com/docs/web/features/api/control-ui/
    __ucCmp?: {
      showFirstLayer?: () => void
      showSecondLayer?: () => void
    }
  }
}

interface IFooterLinkData {
  href: string
  text: string
  icon?: JSX.Element
  target?: '_blank'
}

interface IFooterButtonData {
  text: string
  icon?: JSX.Element
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

interface IFooterListData {
  header: string
  links: Array<IFooterLinkData | IFooterButtonData>
}

const footerListsData: Array<IFooterListData> = [
  {
    header: 'Data Version Control',
    links: [
      {
        href: externalUrls.lakefsHome,
        text: 'For AI/ML & Data Infrastructure'
      },
      { href: docUrls.home, text: 'For Local Workflows (Git Extension)' },
      { href: externalUrls.lakefsAboutUs, text: 'About lakeFS' }
    ]
  },
  {
    header: 'Help',
    links: [
      { href: mainSiteUrls.support, text: 'Support' },
      { href: docUrls.getStarted, text: 'Get started' },
      { href: mainSiteUrls.community, text: 'Community' },
      { href: docUrls.home, text: 'Documentation' }
    ]
  },
  {
    header: 'Community',
    links: [
      {
        href: mainSiteUrls.blog,
        text: 'Blog',
        icon: <BlogSVG className={styles.icon} />
      },
      {
        href: externalUrls.twitter,
        text: 'Twitter',
        icon: <TwitterSVG className={styles.icon} />,
        target: '_blank'
      },
      {
        href: externalUrls.dvcRepo,
        text: 'Github',
        icon: <GithubSVG className={styles.icon} />,
        target: '_blank'
      },
      {
        href: mainSiteUrls.chat,
        text: 'Discord',
        icon: <DiscordSVG className={styles.icon} />
      }
    ]
  },
  {
    header: 'Legal',
    links: [
      {
        href: externalUrls.privacyPolicy,
        text: 'Privacy Policy'
      },
      {
        text: 'Privacy Settings',
        onClick: function () {
          if (window.__ucCmp?.showSecondLayer) {
            window.__ucCmp.showSecondLayer()
          } else {
            console.log('Privacy Settings not available')
          }
        }
      },
      {
        text: 'Do not share or sell my personal information',
        onClick: function () {
          if (window.__ucCmp?.showFirstLayer) {
            window.__ucCmp.showFirstLayer()
          } else {
            console.log('Privacy Settings not available')
          }
        }
      }
    ]
  }
]

const FooterLists: React.FC = () => (
  <div className={styles.columns}>
    {footerListsData.map(({ header, links }, index) => (
      <div className={styles.column} key={index}>
        <h2 className={styles.heading}>{header}</h2>
        <ul className={styles.links}>
          {links.map((link, i) => {
            const isButton = 'onClick' in link && !('href' in link)
            return (
              <li
                // className={styles.linkItem}
                key={i}
              >
                {isButton ? (
                  <button className={styles.link} onClick={link.onClick}>
                    {link.icon}
                    {link.text}
                  </button>
                ) : (
                  <Link
                    target={link.target}
                    href={link.href}
                    className={styles.link}
                  >
                    {link.icon}
                    {link.text}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    ))}
  </div>
)

const LayoutFooter: React.FC = () => (
  <footer className={styles.wrapper}>
    <LayoutWidthContainer className={cn(styles.container)} wide>
      <div
      //  className={styles.top}
      >
        <Link className={styles.logo} href={mainSiteUrls.home} title="dvc.org">
          <LogoSVG />
        </Link>
      </div>
      <FooterLists />
    </LayoutWidthContainer>
  </footer>
)

export default LayoutFooter
