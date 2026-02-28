import { externalUrls, mainSiteUrls } from '../../../../../consts'
import Link from '../../../Link'
import { ReactComponent as DiscordIcon } from '../../../SocialIcon/discord.svg'
import { ReactComponent as GithubIcon } from '../../../SocialIcon/github.svg'

import * as styles from './styles.module.css'

const socialIconData = [
  {
    label: 'GitHub',
    url: externalUrls.dvcRepo,
    Icon: GithubIcon
  },
  {
    label: 'Discord',
    url: mainSiteUrls.chat,
    Icon: DiscordIcon
  }
]

const SocialIcons: React.FC = () => (
  <ul className={styles.socialIcons}>
    {socialIconData.map(({ label, url, Icon }, i) => (
      <li key={i} className={styles.socialItem}>
        <Link href={url} className={styles.socialLink}>
          <Icon className={styles.socialLinkIcon} />
          <span className={styles.socialLabel}>{label}</span>
        </Link>
      </li>
    ))}
  </ul>
)

export default SocialIcons
