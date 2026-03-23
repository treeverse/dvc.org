import cn from 'classnames'

import { mainSiteUrls } from '../../../consts.js'
import { ReactComponent as LogoSVG } from '../../../images/dvc_by_lakefs.svg'
import Link from '../../Link'

import * as styles from './styles.module.css'

interface HeaderBrandingProps {
  onClick?: () => void
}

export const HeaderBranding: React.FC<HeaderBrandingProps> = ({ onClick }) => (
  <>
    <Link
      onClick={onClick}
      href={mainSiteUrls.home}
      className={cn(styles.logoLink, 'mr-auto')}
      title="DVC"
      aria-label="DVC"
    >
      <LogoSVG className={styles.logo} />
    </Link>
  </>
)
