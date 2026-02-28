import { externalUrls, mainSiteUrls } from '../../../../../consts'
import Link from '../../../Link'
import SocialIcon from '../../../SocialIcon'
import { ReactComponent as DiscordIcon } from '../../../SocialIcon/discord.svg'
import { ReactComponent as GithubIcon } from '../../../SocialIcon/github.svg'

import * as styles from './styles.module.css'

const socialIconData = [
  {
    site: 'github',
    label: 'GitHub',
    url: externalUrls.dvcRepo,
    Icon: GithubIcon
  },
  {
    site: 'discord',
    label: 'Discord',
    url: mainSiteUrls.chat,
    Icon: DiscordIcon
  }
]

const SocialIcons: React.FC = () => (
  <ul className={styles.socialIcons}>
    {socialIconData.map(({ site, label, url, Icon }, i) => (
      <li key={i} className={styles.socialItem}>
        <SocialIcon
          site={site}
          label={label}
          url={url}
          className={styles.socialIcon}
        />
        <Link href={url} className={styles.socialLink}>
          <Icon className={styles.socialLinkIcon} />
          {label}
        </Link>
      </li>
    ))}
  </ul>
)

export default SocialIcons
