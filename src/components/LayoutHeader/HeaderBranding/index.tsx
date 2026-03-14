import cn from 'classnames'

import { mainSiteUrls } from '../../../consts.js'
import { ReactComponent as LogoSVG } from '../../../images/dvc_by_lakefs.svg'
import Link from '../../Link'

import * as styles from './styles.module.css'

export const HeaderBranding = () => (
  <>
    <Link
      href={mainSiteUrls.home}
      className={cn(styles.logoLink, 'mr-auto')}
      title="DVC"
      aria-label="DVC"
    >
      <LogoSVG className={styles.logo} />
    </Link>
  </>
)
