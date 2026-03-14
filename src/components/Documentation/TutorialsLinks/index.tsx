import cn from 'classnames'
import startCase from 'lodash/startCase'
import topairs from 'lodash/toPairs'

import Link from '../../Link'
import * as sharedStyles from '../styles.module.css'

import * as styles from './styles.module.css'

interface ITutorialsLinksProps {
  compact?: boolean
  buttonClassName?: string
  tutorials: { [type: string]: string }
}

const TutorialsLinks: React.FC<ITutorialsLinksProps> = ({
  compact = false,
  buttonClassName,
  tutorials
}) => (
  <>
    {topairs(tutorials).map(([type, href]) => {
      return (
        <Link
          href={href}
          key={href}
          className={cn(
            sharedStyles.button,
            styles.button,
            buttonClassName,
            compact && styles.compact
          )}
          target="_blank"
        >
          {styles[`${type}Icon`] && (
            <i className={cn(sharedStyles.buttonIcon, styles[`${type}Icon`])} />
          )}
          {!compact && `Run in ${startCase(type)}`}
        </Link>
      )
    })}
  </>
)

export default TutorialsLinks
